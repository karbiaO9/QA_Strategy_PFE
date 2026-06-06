import { Injectable, Logger } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { requireEnv } from '../config/env';
import { AuthErrorCode } from '../exceptions/auth-error-codes';
import { AppError } from '../exceptions/app-error';

export interface GoogleIdentity {
  provider: 'GOOGLE';
  providerId: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  picture?: string;
}

@Injectable()
export class OAuthVerifierService {
  private readonly logger = new Logger(OAuthVerifierService.name);
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;
  private readonly googleAllowedAudiences: string[];

  constructor(private readonly config: ConfigService) {
    this.googleClientId = requireEnv('GOOGLE_CLIENT_ID');
    const extra =
      this.config.get<string>('GOOGLE_ALLOWED_AUDIENCES')?.trim() || '';
    this.googleAllowedAudiences = extra
      ? extra.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

  async verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
    if (!idToken || typeof idToken !== 'string') {
      throw AppError.unauthorized(AuthErrorCode.OAUTH_LOGIN_FAILED, 'Missing or invalid Google id_token.');
    }

    let payload: TokenPayload | undefined;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: [this.googleClientId, ...this.googleAllowedAudiences],
      });
      payload = ticket.getPayload();
    } catch (err) {
      this.logger.warn(`Google id_token verification failed: ${(err as Error).message}`);
      throw AppError.unauthorized(AuthErrorCode.OAUTH_LOGIN_FAILED, 'Google id_token verification failed.');
    }

    if (!payload || !payload.sub || !payload.email) {
      throw AppError.unauthorized(AuthErrorCode.OAUTH_LOGIN_FAILED, 'Google id_token payload is incomplete.');
    }

    if (payload.email_verified !== true) {
      throw AppError.unauthorized(AuthErrorCode.OAUTH_EMAIL_NOT_VERIFIED, 'Google account email is not verified.');
    }

    return {
      provider: 'GOOGLE',
      providerId: payload.sub,
      email: payload.email.toLowerCase(),
      emailVerified: true,
      firstName: payload.given_name ?? payload.name?.split(' ')[0] ?? 'Patient',
      lastName: payload.family_name ?? payload.name?.split(' ').slice(1).join(' ') ?? '',
      picture: payload.picture,
    };
  }
}
