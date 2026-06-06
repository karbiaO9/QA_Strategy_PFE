export const ALLOWED_JUSTIFICATIF_MIME: readonly string[] = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export const DEFAULT_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export function resolveUploadMaxBytes(): number {
  const raw = process.env.UPLOAD_MAX_BYTES;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_UPLOAD_MAX_BYTES;
}
