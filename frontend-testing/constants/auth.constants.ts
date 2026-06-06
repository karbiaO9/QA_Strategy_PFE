import path from 'path';

export const AUTH_STORAGE = {
  KINE_STATE_PATH: path.join(__dirname, '../playwright/.auth/physio-kine.json'),
  KINE_TOKENS_PATH: path.join(__dirname, '../playwright/.auth/physio-kine-tokens.json'),
  RECOVERY_PATH: path.join(__dirname, '../playwright/.auth/recovery-chain.json'),
  ADMIN_STATE_PATH: path.join(__dirname, '../playwright/.auth/physio-admin.json'),
  ADMIN_TOKENS_PATH: path.join(__dirname, '../playwright/.auth/physio-admin-tokens.json'),
  /** Written by STC-INVIT-GEN-003/B, consumed by STC-INVIT-ACCEPT-004/B */
  INVITATION_CHAIN_PATH: path.join(__dirname, '../playwright/.auth/invitation-chain.json'),
} as const;

export const AUTH_ROLES = {
  KINE: 'kine',
  ADMIN: 'admin',
  PATIENT: 'patient',
  GUEST: 'guest',
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];
