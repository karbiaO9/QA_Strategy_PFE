import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { REDIS_CLIENT } from '@common/redis/redis.module';

describe('TokensService', () => {
  let service: TokensService;
  let jwtService: JwtService;
  let redis: any;

  beforeEach(async () => {
    redis = {
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
      // generateTokens now bumps the per-user token version on every call.
      incr: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('jwt-token'),
            verifyAsync: jest.fn(),
          },
        },
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile();

    service = module.get(TokensService);
    jwtService = module.get(JwtService);
  });

  const payload = {
    sub: 'user_id',
    email: 'a@b.com',
    type: 'kine',
    cabinetId: 'cab',
    roleSlug: 'KINE',
  };

  describe('generateTokens', () => {
    it('returns access + refresh tokens', async () => {
      const tokens = await service.generateTokens(payload);
      expect(tokens.accessToken).toBe('jwt-token');
      expect(tokens.refreshToken).toMatch(/^[a-f0-9]{64}$/);
    });

    it('stores refresh token in Redis with TTL 7d', async () => {
      await service.generateTokens(payload);
      expect(redis.setex).toHaveBeenCalledWith(
        'auth:user_id:refresh_token',
        7 * 24 * 3600,
        expect.any(String),
      );
    });

    it('signs JWT with expiresIn 24h and includes the bumped token version', async () => {
      await service.generateTokens(payload);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        // Payload now includes the version returned by Redis INCR.
        expect.objectContaining({ ...payload, v: 1 }),
        expect.objectContaining({ expiresIn: '24h' }),
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('returns true when token matches Redis', async () => {
      redis.get.mockResolvedValue('rt_stored');
      const ok = await service.verifyRefreshToken('user_id', 'rt_stored');
      expect(ok).toBe(true);
    });

    it('throws 401 when Redis has no token', async () => {
      redis.get.mockResolvedValue(null);
      await expect(
        service.verifyRefreshToken('user_id', 'rt_whatever'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws 401 when tokens do not match', async () => {
      redis.get.mockResolvedValue('rt_stored');
      await expect(
        service.verifyRefreshToken('user_id', 'rt_different'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeRefreshToken', () => {
    it('deletes the Redis key', async () => {
      await service.revokeRefreshToken('user_id');
      expect(redis.del).toHaveBeenCalledWith('auth:user_id:refresh_token');
    });
  });

  describe('signInvitation', () => {
    const invitationPayload = {
      cabinetId: 'cab_id',
      invitedEmail: 'invitee@b.com',
      targetProfileType: 'MEMBER' as const,
      roleId: 'role_id',
      invitedByKineId: 'inviter_id',
    };

    it('signs a JWT with purpose=kine-invitation and a random jti', async () => {
      const signed = await service.signInvitation(invitationPayload);
      expect(signed.token).toBe('jwt-token');
      expect(signed.jti).toMatch(/^[a-f0-9]{32}$/);
      expect(signed.expiresAt).toBeInstanceOf(Date);
      const [signedPayload, signOpts] = (jwtService.signAsync as jest.Mock).mock
        .calls[0];
      expect(signedPayload).toMatchObject({
        ...invitationPayload,
        purpose: 'kine-invitation',
      });
      expect(signedPayload.jti).toBe(signed.jti);
      expect(signOpts).toMatchObject({ expiresIn: '7d' });
    });

    it('expiresAt is roughly now + 7 days', async () => {
      const before = Date.now();
      const { expiresAt } = await service.signInvitation(invitationPayload);
      const sevenDays = 7 * 24 * 3600 * 1000;
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + sevenDays - 5000);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(before + sevenDays + 5000);
    });
  });

  describe('verifyInvitation', () => {
    const validPayload = {
      cabinetId: 'cab_id',
      invitedEmail: 'invitee@b.com',
      targetProfileType: 'MEMBER' as const,
      roleId: 'role_id',
      invitedByKineId: 'inviter_id',
      purpose: 'kine-invitation',
      jti: 'a'.repeat(32),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    };

    it('returns the structured payload on a valid unused token', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(validPayload);
      redis.get.mockResolvedValue(null); // not yet consumed
      const out = await service.verifyInvitation('valid.jwt');
      expect(out.cabinetId).toBe('cab_id');
      expect(out.invitedEmail).toBe('invitee@b.com');
      expect(out.targetProfileType).toBe('MEMBER');
      expect(out.jti).toBe(validPayload.jti);
      expect(out.expiresAt).toBeInstanceOf(Date);
    });

    it('throws TOKEN_INVALID on signature failure', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        Object.assign(new Error('bad sig'), { name: 'JsonWebTokenError' }),
      );
      await expect(service.verifyInvitation('bad')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyInvitation('bad')).rejects.toMatchObject({
        response: { code: 'TOKEN_INVALID' },
      });
    });

    it('throws INVITATION_EXPIRED on TokenExpiredError', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        Object.assign(new Error('exp'), { name: 'TokenExpiredError' }),
      );
      await expect(service.verifyInvitation('expired')).rejects.toMatchObject({
        response: { code: 'INVITATION_EXPIRED' },
      });
    });

    it('throws INVITATION_NOT_KINE when purpose != kine-invitation', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
        ...validPayload,
        purpose: 'something-else',
      });
      await expect(
        service.verifyInvitation('wrong.purpose'),
      ).rejects.toMatchObject({
        response: { code: 'INVITATION_NOT_KINE' },
      });
    });

    it('throws INVITATION_ALREADY_USED on jti replay', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(validPayload);
      redis.get.mockResolvedValue('1'); // already consumed
      await expect(service.verifyInvitation('replay')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.verifyInvitation('replay')).rejects.toMatchObject({
        response: { code: 'INVITATION_ALREADY_USED' },
      });
    });
  });

  describe('markInvitationUsed', () => {
    it('writes the jti flag with a TTL aligned to expiresAt', async () => {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // +1h
      await service.markInvitationUsed('jti_xyz', expiresAt);
      expect(redis.setex).toHaveBeenCalledWith(
        'invitation:jti_xyz:used',
        expect.any(Number),
        '1',
      );
      const ttlArg = (redis.setex as jest.Mock).mock.calls[0][1];
      expect(ttlArg).toBeGreaterThan(60); // at least the floor
      expect(ttlArg).toBeLessThanOrEqual(3600);
    });

    it('floors TTL at 60 seconds when expiresAt is in the past', async () => {
      const expiredAt = new Date(Date.now() - 5 * 60 * 1000); // 5 min ago
      await service.markInvitationUsed('jti_old', expiredAt);
      const ttlArg = (redis.setex as jest.Mock).mock.calls[0][1];
      expect(ttlArg).toBe(60);
    });
  });
});
