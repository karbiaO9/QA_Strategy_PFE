import { BadRequestException } from '@nestjs/common';
import { justificatifFileFilter } from './supporting-document.interceptor';
import {
  ALLOWED_JUSTIFICATIF_MIME,
  resolveUploadMaxBytes,
  DEFAULT_UPLOAD_MAX_BYTES,
} from './uploads.constants';

describe('justificatif upload interceptor', () => {
  describe('MIME allowlist (fileFilter)', () => {
    const call = (mimetype: string) =>
      new Promise<{ err: Error | null; accept: boolean }>((resolve) => {
        justificatifFileFilter(
          null,
          { mimetype, originalname: 'x' },
          (err, accept) => resolve({ err, accept }),
        );
      });

    it('accepts application/pdf', async () => {
      const { err, accept } = await call('application/pdf');
      expect(err).toBeNull();
      expect(accept).toBe(true);
    });

    it('accepts image/jpeg', async () => {
      const { err, accept } = await call('image/jpeg');
      expect(err).toBeNull();
      expect(accept).toBe(true);
    });

    it('accepts image/png', async () => {
      const { err, accept } = await call('image/png');
      expect(err).toBeNull();
      expect(accept).toBe(true);
    });

    it('rejects application/x-msdownload (.exe)', async () => {
      const { err, accept } = await call('application/x-msdownload');
      expect(err).toBeInstanceOf(BadRequestException);
      expect(accept).toBe(false);
    });

    it('rejects image/svg+xml', async () => {
      const { err, accept } = await call('image/svg+xml');
      expect(err).toBeInstanceOf(BadRequestException);
      expect(accept).toBe(false);
    });

    it('exposes the canonical allowlist', () => {
      expect(ALLOWED_JUSTIFICATIF_MIME).toEqual([
        'application/pdf',
        'image/jpeg',
        'image/png',
      ]);
    });
  });

  describe('size cap', () => {
    it('defaults to 5 Mo (spec US-A.4) when UPLOAD_MAX_BYTES is unset', () => {
      const prev = process.env.UPLOAD_MAX_BYTES;
      delete process.env.UPLOAD_MAX_BYTES;
      try {
        expect(resolveUploadMaxBytes()).toBe(DEFAULT_UPLOAD_MAX_BYTES);
        expect(DEFAULT_UPLOAD_MAX_BYTES).toBe(5 * 1024 * 1024);
      } finally {
        if (prev !== undefined) process.env.UPLOAD_MAX_BYTES = prev;
      }
    });

    it('honors UPLOAD_MAX_BYTES env override', () => {
      const prev = process.env.UPLOAD_MAX_BYTES;
      process.env.UPLOAD_MAX_BYTES = '1048576'; // 1 Mo
      try {
        expect(resolveUploadMaxBytes()).toBe(1048576);
      } finally {
        if (prev === undefined) delete process.env.UPLOAD_MAX_BYTES;
        else process.env.UPLOAD_MAX_BYTES = prev;
      }
    });

    it('falls back to default on non-numeric UPLOAD_MAX_BYTES', () => {
      const prev = process.env.UPLOAD_MAX_BYTES;
      process.env.UPLOAD_MAX_BYTES = 'not-a-number';
      try {
        expect(resolveUploadMaxBytes()).toBe(DEFAULT_UPLOAD_MAX_BYTES);
      } finally {
        if (prev === undefined) delete process.env.UPLOAD_MAX_BYTES;
        else process.env.UPLOAD_MAX_BYTES = prev;
      }
    });
  });
});
