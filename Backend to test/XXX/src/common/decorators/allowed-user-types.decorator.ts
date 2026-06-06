import { SetMetadata } from '@nestjs/common';

export const ALLOWED_USER_TYPES_KEY = 'allowedUserTypes';

export type AllowedUserType = 'admin' | 'kine' | 'patient';

// JWT `type` is the only thing that pins a token to its issuing collection.
// Without this guard, /api/v1/kine/me happily accepts an admin token because
// the signature/version checks pass and `sub` resolves to *some* user.
export const AllowedUserTypes = (...types: AllowedUserType[]) =>
  SetMetadata(ALLOWED_USER_TYPES_KEY, types);
