import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoServerError } from 'mongodb';
import { AuthErrorCode } from '../exceptions/auth-error-codes';

type ConflictMapping = { code: AuthErrorCode; message: string };

// Maps `<collection>.<unique-field>` to the AuthErrorCode + message we want
// to surface when MongoDB rejects an insert with E11000. Anything not listed
// here falls back to the generic DUPLICATE_KEY response.
const CONFLICT_MAP: Record<string, Record<string, ConflictMapping>> = {
  actions: {
    slug: {
      code: AuthErrorCode.ACTION_SLUG_ALREADY_EXISTS,
      message: 'An action with this slug already exists.',
    },
  },
  modules: {
    slug: {
      code: AuthErrorCode.MODULE_SLUG_ALREADY_EXISTS,
      message: 'A module with this slug already exists.',
    },
  },
  permissions: {
    code: {
      code: AuthErrorCode.PERMISSION_CODE_ALREADY_EXISTS,
      message: 'A permission with this code already exists.',
    },
  },
  roles: {
    slug: {
      code: AuthErrorCode.ROLE_SLUG_ALREADY_EXISTS,
      message: 'A role with this slug already exists.',
    },
  },
  kines: {
    email: {
      code: AuthErrorCode.EMAIL_ALREADY_USED,
      message: 'An account already exists with this email.',
    },
    professionalNumber: {
      code: AuthErrorCode.PROFESSIONAL_NUMBER_ALREADY_USED,
      message:
        'This professional number is already linked to an active account.',
    },
  },
  admins: {
    email: {
      code: AuthErrorCode.EMAIL_ALREADY_USED,
      message: 'An account already exists with this email.',
    },
  },
  patients: {
    email: {
      code: AuthErrorCode.EMAIL_ALREADY_USED,
      message: 'An account already exists with this email.',
    },
  },
};

@Catch(MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 11000) {
      const collection = this.extractCollection(exception);
      const keyPattern = (exception as any).keyPattern ?? {};
      const keyValue = (exception as any).keyValue ?? {};
      const field = Object.keys(keyPattern)[0] ?? null;
      const value = field ? keyValue[field] : null;

      const known =
        collection && field ? CONFLICT_MAP[collection]?.[field] : undefined;

      const body: Record<string, unknown> = {
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        code: known?.code ?? AuthErrorCode.DUPLICATE_KEY,
        message:
          known?.message ??
          (field
            ? `Duplicate value for unique field "${field}".`
            : 'Duplicate value violates a unique constraint.'),
        field,
        value,
      };

      return response.status(HttpStatus.CONFLICT).json(body);
    }

    // Any other MongoServerError (write concern issues, validation, etc.)
    // is logged and returned as a generic 500 — never leak the raw driver
    // message to the client.
    this.logger.error(
      `Unhandled MongoServerError (code=${exception.code}): ${exception.message}`,
      exception.stack,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'A database error occurred.',
    });
  }

  // The driver only exposes the collection name inside `errmsg` as
  // `collection: <db>.<coll>`. We parse it out so the response can be
  // routed to the right resource-specific message.
  private extractCollection(exception: MongoServerError): string | null {
    const errmsg =
      (exception as any).errmsg ??
      (exception as any).errorResponse?.errmsg ??
      exception.message ??
      '';
    const match = /collection:\s*\S+\.(\w+)/.exec(String(errmsg));
    return match ? match[1] : null;
  }
}
