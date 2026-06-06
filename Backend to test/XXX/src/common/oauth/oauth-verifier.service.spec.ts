import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

const mockVerifyIdToken = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

import { OAuthVerifierService } from './oauth-verifier.service';

describe('OAuthVerifierService', () => {
  let service: OAuthVerifierService;
  let config: any;
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(async () => {
    process.env.GOOGLE_CLIENT_ID = 'client_id_123.apps.googleusercontent.com';

    config = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'GOOGLE_ALLOWED_AUDIENCES') return '';
        return undefined;
      }),
    };

    mockVerifyIdToken.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthVerifierService,
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(OAuthVerifierService);
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('verifyGoogleIdToken', () => {
    it('throws OAUTH_LOGIN_FAILED when idToken is empty', async () => {
      await expect(service.verifyGoogleIdToken('')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.verifyGoogleIdToken('')).rejects.toMatchObject({
        response: { code: 'OAUTH_LOGIN_FAILED' },
      });
    });

    it('throws OAUTH_LOGIN_FAILED when google-auth-library rejects the signature', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('bad signature'));
      await expect(
        service.verifyGoogleIdToken('garbage.jwt.value'),
      ).rejects.toMatchObject({
        response: { code: 'OAUTH_LOGIN_FAILED' },
      });
    });

    it('throws OAUTH_LOGIN_FAILED when payload is missing required fields', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({}), // no sub, no email
      });
      await expect(
        service.verifyGoogleIdToken('valid.but.empty'),
      ).rejects.toMatchObject({
        response: { code: 'OAUTH_LOGIN_FAILED' },
      });
    });

    it('throws OAUTH_EMAIL_NOT_VERIFIED when email_verified !== true', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'g_sub_id',
          email: 'patient@gmail.com',
          email_verified: false,
        }),
      });
      await expect(
        service.verifyGoogleIdToken('valid.unverified'),
      ).rejects.toMatchObject({
        response: { code: 'OAUTH_EMAIL_NOT_VERIFIED' },
      });
    });

    it('returns a normalised GoogleIdentity on a valid id_token', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'g_sub_id',
          email: 'PATIENT@gmail.com',
          email_verified: true,
          given_name: 'Marie',
          family_name: 'Durand',
          picture: 'https://lh3.googleusercontent.com/marie',
        }),
      });
      const result = await service.verifyGoogleIdToken('valid.jwt');
      expect(result).toEqual({
        provider: 'GOOGLE',
        providerId: 'g_sub_id',
        email: 'patient@gmail.com', // lowercased
        emailVerified: true,
        firstName: 'Marie',
        lastName: 'Durand',
        picture: 'https://lh3.googleusercontent.com/marie',
      });
    });

    it('falls back to splitting payload.name when given_name / family_name are absent', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'g_sub_id',
          email: 'patient@gmail.com',
          email_verified: true,
          name: 'Marie Anne Durand',
        }),
      });
      const result = await service.verifyGoogleIdToken('valid.jwt');
      expect(result.firstName).toBe('Marie');
      expect(result.lastName).toBe('Anne Durand');
    });

    it('passes the configured client id (and any extra audiences) to the verifier', async () => {
      config.get.mockImplementation((key: string) =>
        key === 'GOOGLE_ALLOWED_AUDIENCES'
          ? 'extra-audience-1,extra-audience-2'
          : undefined,
      );
      // Re-init the service with extra audiences
      const m: TestingModule = await Test.createTestingModule({
        providers: [
          OAuthVerifierService,
          { provide: ConfigService, useValue: config },
        ],
      }).compile();
      const svc = m.get(OAuthVerifierService);

      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'g',
          email: 'a@b.com',
          email_verified: true,
        }),
      });
      await svc.verifyGoogleIdToken('valid');
      const arg = mockVerifyIdToken.mock.calls.at(-1)![0];
      expect(arg.audience).toEqual([
        'client_id_123.apps.googleusercontent.com',
        'extra-audience-1',
        'extra-audience-2',
      ]);
    });
  });
});
