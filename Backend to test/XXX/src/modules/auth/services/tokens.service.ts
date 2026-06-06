import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type Redis from 'ioredis';
import * as crypto from 'crypto';
import { REDIS_CLIENT } from '@common/redis/redis.module';
import { RedisKeys, REDIS_TTL } from '@common/redis/redis-keys';
import { envNumber, envString } from '@common/config/env';
import { AuthErrorCode } from '@common/exceptions/auth-error-codes';
import { AppError } from '@common/exceptions/app-error';


@Injectable()
export class TokensService {
  // Env-backed TTLs (fallbacks keep the legacy behaviour).
  private readonly accessTtl = envString('JWT_EXPIRES_IN', '24h');
  private readonly invitationTtl = envString('JWT_INVITATION_TTL', '7d');
  private readonly invitationTtlSeconds = envNumber(
    'JWT_INVITATION_TTL_SECONDS',
    7 * 24 * 3600,
  );

  constructor(
    private jwtService: JwtService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async generateTokens(payload: {
    sub: string;
    email: string;
    type: string;
    cabinetId: string | null;
    roleSlug: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    // Bump first so the new JWT carries the fresh version. Older tokens
    // out there get rejected on their next request.
    const newVersion = await this.bumpTokenVersion(payload.sub);

    const accessToken = await this.jwtService.signAsync(
      { ...payload, v: newVersion },
      { expiresIn: this.accessTtl as any },
    );

    const refreshToken = crypto.randomBytes(32).toString('hex');
    await this.redis.setex(
      RedisKeys.refreshToken(payload.sub),
      REDIS_TTL.REFRESH_TOKEN,
      refreshToken,
    );

    return { accessToken, refreshToken };
  }

  // Bumps the user's token version and returns the new value. INCR is
  // atomic, so concurrent logins don't race.
  async bumpTokenVersion(userId: string): Promise<number> {
    return this.redis.incr(RedisKeys.tokenVersion(userId));
  }

  // Returns 0 if no version was set yet (grace window for pre-rollout tokens).
  async getTokenVersion(userId: string): Promise<number> {
    const raw = await this.redis.get(RedisKeys.tokenVersion(userId));
    return raw ? Number(raw) : 0;
  }


  async verifyRefreshToken(
    userId: string,
    presented: string,
  ): Promise<boolean> {
    const stored = await this.redis.get(RedisKeys.refreshToken(userId));
    if (!stored) {
      throw AppError.unauthorized(AuthErrorCode.REFRESH_TOKEN_INVALID, 'Refresh token invalid or expired.');
    }
    if (stored !== presented) {
      throw AppError.unauthorized(AuthErrorCode.REFRESH_TOKEN_INVALID, 'Refresh token invalid.');
    }
    return true;
  }


  async revokeRefreshToken(userId: string): Promise<void> {
    await this.redis.del(RedisKeys.refreshToken(userId));
  }

  // Invitation tokens (MEMBER / ASSISTANT registration). TTL is resolved
  // once at construction from JWT_INVITATION_TTL / JWT_INVITATION_TTL_SECONDS.

  /**
   * Sign a kine invitation JWT carrying the cabinet context.
   *
   * A random `jti` (JWT id) is baked in so that the token can later be marked
   * as consumed in Redis and become single-use. Without this guard, a valid
   * invitation JWT could be replayed until its natural expiry.
   */
  async signInvitation(payload: {
    cabinetId: string;
    invitedEmail: string;
    targetProfileType: 'MEMBER' | 'ASSISTANT';
    roleId: string;
    invitedByKineId: string;
  }): Promise<{ token: string; expiresAt: Date; jti: string }> {
    const jti = crypto.randomBytes(16).toString('hex');
    const token = await this.jwtService.signAsync(
      { ...payload, purpose: 'kine-invitation', jti },
      { expiresIn: this.invitationTtl as any },
    );
    const expiresAt = new Date(Date.now() + this.invitationTtlSeconds * 1000);
    return { token, expiresAt, jti };
  }

  /**
   * Verify an invitation token. Throws `UnauthorizedException` with a
   * `TOKEN_INVALID` / `TOKEN_EXPIRED` code on any signature / expiry failure,
   * or a `ConflictException` on replay (token already consumed).
   */
  async verifyInvitation(token: string): Promise<{
    cabinetId: string;
    invitedEmail: string;
    targetProfileType: 'MEMBER' | 'ASSISTANT';
    roleId: string;
    invitedByKineId: string;
    jti: string;
    expiresAt: Date;
  }> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (err: any) {
      const isExpired = err?.name === 'TokenExpiredError';
      throw AppError.unauthorized(isExpired ? AuthErrorCode.INVITATION_EXPIRED : AuthErrorCode.TOKEN_INVALID, isExpired ? 'Invitation expired.' : 'Invalid invitation.');
    }

    if (payload?.purpose !== 'kine-invitation') {
      throw AppError.unauthorized(AuthErrorCode.INVITATION_NOT_KINE, 'This token is not a kine invitation.');
    }

    // Single-use guard: if we already marked this jti as consumed, the caller
    // is replaying the link. We raise a specific conflict so the frontend can
    // display the "link already used" state without ambiguity.
    if (payload.jti) {
      const used = await this.redis.get(RedisKeys.invitationUsed(payload.jti));
      if (used) {
        throw AppError.conflict(AuthErrorCode.INVITATION_ALREADY_USED, 'This invitation link has already been used.');
      }
    }

    const expSeconds = typeof payload.exp === 'number' ? payload.exp : null;
    const expiresAt = expSeconds
      ? new Date(expSeconds * 1000)
      : new Date(Date.now() + this.invitationTtlSeconds * 1000);

    return {
      cabinetId: payload.cabinetId,
      invitedEmail: payload.invitedEmail,
      targetProfileType: payload.targetProfileType,
      roleId: payload.roleId,
      invitedByKineId: payload.invitedByKineId,
      jti: payload.jti,
      expiresAt,
    };
  }

  /**
   * Mark an invitation jti as consumed. Redis TTL is aligned with the token's
   * natural expiry so the flag disappears when the token would anyway be
   * rejected by the signature check — no unbounded growth.
   */
  async markInvitationUsed(jti: string, expiresAt: Date): Promise<void> {
    const ttlSeconds = Math.max(
      60,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );
    await this.redis.setex(RedisKeys.invitationUsed(jti), ttlSeconds, '1');
  }
}
