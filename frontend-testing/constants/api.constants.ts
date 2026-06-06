const API_BASE = process.env.API_BASE_URL ?? 'https://identity.physio.agregatech.com';
const KINE_AUTH = process.env.API_KINE_AUTH_PATH ?? '/api/v1/kine/auth';
const KINE = process.env.API_KINE_PATH ?? '/api/v1/kine';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE,
  KINE_AUTH_BASE: `${API_BASE}${KINE_AUTH}`,
  KINE_BASE: `${API_BASE}${KINE}`,
  LOGIN: `${API_BASE}${KINE_AUTH}/login`,
  LOGOUT: `${API_BASE}${KINE_AUTH}/logout`,
  FORGOT_PASSWORD: `${API_BASE}${KINE_AUTH}/forgot-password`,
  VERIFY_CODE: `${API_BASE}${KINE_AUTH}/verify-code`,
  RESET_PASSWORD: `${API_BASE}${KINE_AUTH}/reset-password`,
  REFRESH_TOKEN: `${API_BASE}${KINE_AUTH}/refresh-token`,
  ME: `${API_BASE}${KINE}/me`,

  // Invitations (Kine admin gated) — POST under /kine/auth
  INVITATIONS: `${API_BASE}${KINE_AUTH}/invitations`,
  INVITATIONS_PREVIEW: `${API_BASE}${KINE_AUTH}/invitations/preview`,
  INVITATIONS_ATTACH: `${API_BASE}${KINE_AUTH}/invitations/attach`,
  ACCEPT_INVITATION: `${API_BASE}${KINE_AUTH}/accept-invitation`,

  // Profile switcher / creation
  SELECT_PROFILE: `${API_BASE}${KINE_AUTH}/select-profile`,
  PROFILES: `${API_BASE}${KINE}/profiles`,
} as const;

export const PUBLIC_API_PATHS = [
  'login',
  'register',
  'forgot-password',
  'verify-code',
  'reset-password',
] as const;
