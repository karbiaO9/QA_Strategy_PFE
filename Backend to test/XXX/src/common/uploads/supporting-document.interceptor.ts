import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthErrorCode } from '../exceptions/auth-error-codes';
import { AppError } from '../exceptions/app-error';
import {
  ALLOWED_JUSTIFICATIF_MIME,
  resolveUploadMaxBytes,
} from './uploads.constants';

export interface UploadedFileLike {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export const justificatifFileFilter = (
  _req: unknown,
  file: { mimetype: string; originalname: string },
  cb: (err: Error | null, accept: boolean) => void,
): void => {
  if (!ALLOWED_JUSTIFICATIF_MIME.includes(file.mimetype)) {
    cb(
      AppError.badRequest(
        AuthErrorCode.FILE_TYPE_NOT_ALLOWED,
        `File type '${file.mimetype}' is not allowed. Accepted formats: ` +
          ALLOWED_JUSTIFICATIF_MIME.join(', '),
      ),
      false,
    );
    return;
  }
  cb(null, true);
};

export function JustificatifFileInterceptor() {
  return FileInterceptor('justificatif', {
    storage: memoryStorage(),
    limits: {
      fileSize: resolveUploadMaxBytes(),
      files: 1,
    },
    fileFilter: justificatifFileFilter,
  });
}

export function mapMulterError(err: any): never {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    throw AppError.payloadTooLarge(
      AuthErrorCode.FILE_TOO_LARGE,
      `File too large (max ${resolveUploadMaxBytes()} bytes).`,
    );
  }
  throw err;
}
