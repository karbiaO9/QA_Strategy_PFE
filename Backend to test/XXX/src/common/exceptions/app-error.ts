import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthErrorCode } from './auth-error-codes';

type Extra = Record<string, unknown>;

function build<T>(
  ExceptionClass: new (payload: { code: AuthErrorCode; message: string } & Extra) => T,
) {
  return (code: AuthErrorCode, message: string, extra?: Extra): T =>
    new ExceptionClass({ code, message, ...(extra ?? {}) });
}

export const AppError = {
  badRequest:   build(BadRequestException),
  unauthorized: build(UnauthorizedException),
  forbidden:    build(ForbiddenException),
  notFound:     build(NotFoundException),
  conflict:     build(ConflictException),
  payloadTooLarge: build(PayloadTooLargeException),

  internal(code: AuthErrorCode, message: string, extra?: Extra) {
    return new InternalServerErrorException({ code, message, ...(extra ?? {}) });
  },

  http(status: HttpStatus, code: AuthErrorCode, message: string, extra?: Extra) {
    return new HttpException({ code, message, ...(extra ?? {}) }, status);
  },
};
