import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  ALLOWED_USER_TYPES_KEY,
  AllowedUserType,
} from '../decorators/allowed-user-types.decorator';
import { AuthErrorCode } from '../exceptions/auth-error-codes';
import { AppError } from '../exceptions/app-error';
import { TokensService } from '../../modules/auth/services/tokens.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    // Lets us reject tokens whose per-user version has been bumped (re-login,
    // password change, logout, etc.).
    private tokensService: TokensService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw AppError.unauthorized(AuthErrorCode.TOKEN_MISSING, 'Token missing');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (err: any) {
      if (err?.name === 'TokenExpiredError') {
        throw AppError.unauthorized(AuthErrorCode.TOKEN_EXPIRED, 'Token expired');
      }
      throw AppError.unauthorized(AuthErrorCode.TOKEN_INVALID, 'Invalid token');
    }

    // Missing `v` is treated as 0 — keeps pre-rollout tokens valid until the
    // user re-logs in (grace window).
    if (payload?.sub) {
      const currentVersion = await this.tokensService.getTokenVersion(
        payload.sub,
      );
      const tokenVersion = typeof payload.v === 'number' ? payload.v : 0;
      if (tokenVersion !== currentVersion) {
        throw AppError.unauthorized(AuthErrorCode.TOKEN_INVALID, 'Token superseded by a newer session.');
      }
    }

    // Audience check: routes that opt in via @AllowedUserTypes(...) refuse
    // tokens issued for a different collection. Without this, a SUPER_ADMIN
    // token would happily resolve on /api/v1/kine/me because `sub` is a
    // valid id in *some* collection — same JWT secret across audiences.
    const allowedTypes = this.reflector.getAllAndOverride<
      AllowedUserType[] | undefined
    >(ALLOWED_USER_TYPES_KEY, [context.getHandler(), context.getClass()]);
    if (allowedTypes && allowedTypes.length > 0) {
      const tokenType = payload?.type;
      if (!tokenType || !allowedTypes.includes(tokenType)) {
        throw AppError.forbidden(
          AuthErrorCode.WRONG_AUDIENCE,
          'This token is not valid for this entry point.',
        );
      }
    }

    request['user'] = payload;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
