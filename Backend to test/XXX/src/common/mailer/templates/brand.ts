// Centralised brand tokens used by every email template. Colours match the
// official XXX & Connect logo (blue + green) — see assets/logo.svg.

export const BRAND = {
  name: 'XXX & Connect',
  tagline: 'Plateforme kine multi-tenant',
  // Both surfaces of the wordmark in the logo.
  primaryBlue: '#2D8BCA',
  primaryGreen: '#53BD92',
  // Mid-stop of the gradient seen on the logo's "P".
  primaryMid: '#41A6AB',
  // UI accent shared with the app screenshot (section titles).
  accent: '#6366F1',
  // Neutral palette.
  textDark: '#0F172A',
  textMuted: '#64748B',
  borderLight: '#E2E8F0',
  bgPage: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgSoftBlue: '#E8F2FB',
  bgSoftGreen: '#E8F7EF',
} as const;

// System font stack — universal email-safe fallback chain.
export const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

import { readFileSync } from 'fs';
import { join } from 'path';

// Logo lives next to the compiled brand.js in dist/. Copied there by the
// `assets` rule in nest-cli.json.
export const LOGO_FILE_PATH = join(__dirname, 'assets', 'logo.png');

// Embedding the logo as a base64 data URI keeps it inline in the HTML —
// no remote fetch, no MIME attachment, no Gmail "pièce jointe" annoyance.
// `undefined` = not yet attempted, `null` = file missing (use wordmark).
let cachedLogoDataUri: string | null | undefined = undefined;

export function resolveLogoDataUri(): string | null {
  if (cachedLogoDataUri !== undefined) return cachedLogoDataUri;
  try {
    const buffer = readFileSync(LOGO_FILE_PATH);
    cachedLogoDataUri = `data:image/png;base64,${buffer.toString('base64')}`;
  } catch {
    // No PNG in the image — layout will fall back to the text wordmark.
    cachedLogoDataUri = null;
  }
  return cachedLogoDataUri;
}
