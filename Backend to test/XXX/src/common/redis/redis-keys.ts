/**
 * Centralised Redis key factory.
 *
 * - One helper per use-case so typos can't happen; the old pattern of
 *   inlined string templates (`auth:${userId}:refresh_token`) is replaced
 *   by `RedisKeys.refreshToken(userId)`.
 * - Every key is prefixed by `REDIS_KEY_PREFIX` (env var, default: unset).
 *   This lets multiple environments (dev / staging / prod / CI) share a
 *   single Redis cluster without key collisions.
 *
 * TTLs live here too so they are discoverable in one place.
 *
 *   | Key                              | Purpose                           | TTL                   |
 *   | -------------------------------- | --------------------------------- | --------------------- |
 *   | auth:{sub}:refresh_token         | refresh token per user            | 7 days                |
 *   | reset:{email}:code               | bcrypt-hashed 6-digit reset code  | 10 minutes            |
 *   | reset:{email}:attempts           | reset-code wrong-try counter (max 3) | 10 minutes         |
 *   | reset:{email}:token              | single-use 64-hex resetToken      | 10 minutes            |
 *   | invitation:{jti}:used            | single-use invitation marker      | aligned on JWT exp    |
 *   | perms:{sub} / perms:profile:{id} | CASL rules array (versioned)      | 1 hour                |
 *   | rl:forgot:{email}                | forgot-password rate limit window | 1 hour (5 max)        |
 *   | rl:login:{email}                 | login rate limit window           | 1 minute (10 max)     |
 */

import { envNumber } from '../config/env';

/**
 * Every TTL and rate-limit threshold is read from the environment with a
 * sane fallback. Values are resolved ONCE at module load — hot-reload is
 * the responsibility of a service restart.
 */
export const REDIS_TTL = {
  REFRESH_TOKEN: envNumber('REFRESH_TOKEN_TTL_SECONDS', 7 * 24 * 3600),
  RESET_CODE: envNumber('RESET_CODE_TTL_SECONDS', 600),
  RESET_ATTEMPTS: envNumber('RESET_CODE_TTL_SECONDS', 600),
  RESET_TOKEN: envNumber('RESET_TOKEN_TTL_SECONDS', 600),
  PERMS: envNumber('PERMS_CACHE_TTL_SECONDS', 3600),
  RATE_LIMIT_FORGOT: envNumber('RATE_LIMIT_FORGOT_WINDOW_SECONDS', 3600),
  RATE_LIMIT_LOGIN: envNumber('RATE_LIMIT_LOGIN_WINDOW_SECONDS', 60),
} as const;

export const RATE_LIMIT = {
  FORGOT_MAX_PER_HOUR: envNumber('RATE_LIMIT_FORGOT_MAX', 5),
  LOGIN_MAX_PER_MINUTE: envNumber('RATE_LIMIT_LOGIN_MAX', 10),
} as const;

function prefix(): string {
  const configured = process.env.REDIS_KEY_PREFIX;
  return configured ? `${configured.replace(/:+$/, '')}:` : '';
}

export const RedisKeys = {
  refreshToken: (userId: string) => `${prefix()}auth:${userId}:refresh_token`,
  // Bumped on login / password change / logout. JWTs embed the value they
  // were issued at; older ones get rejected. No TTL.
  tokenVersion: (userId: string) => `${prefix()}auth:${userId}:token_version`,
  resetCode: (email: string) => `${prefix()}reset:${email.toLowerCase()}:code`,
  resetAttempts: (email: string) =>
    `${prefix()}reset:${email.toLowerCase()}:attempts`,
  resetToken: (email: string) => `${prefix()}reset:${email.toLowerCase()}:token`,
  invitationUsed: (jti: string) => `${prefix()}invitation:${jti}:used`,
  perms: (sub: string) => `${prefix()}perms:${sub}`,
  permsProfile: (profileId: string) => `${prefix()}perms:profile:${profileId}`,
  rateLimitForgot: (email: string) =>
    `${prefix()}rl:forgot:${email.toLowerCase()}`,
  rateLimitLogin: (email: string) =>
    `${prefix()}rl:login:${email.toLowerCase()}`,
};
