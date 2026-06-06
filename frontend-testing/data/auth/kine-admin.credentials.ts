import type { KineAdminCredentials } from '../../utils/types';

/**
 * Cabinet-admin Kine account — required to create invitations
 * (POST /api/v1/kine/auth/invitations).
 *
 * Specs call `hasKineAdminCredentials()` and `test.skip()` when no
 * usable credentials are available, instead of failing hard.
 */
const DEFAULT_KINE_ADMIN_EMAIL = 'sophie.martin@cabinet-paris.fr';
const DEFAULT_KINE_ADMIN_PASSWORD = 'KineAdmin123!';

export const kineAdminCredentials: KineAdminCredentials = {
  email: process.env.KINE_ADMIN_EMAIL?.trim() || DEFAULT_KINE_ADMIN_EMAIL,
  password: process.env.KINE_ADMIN_PASSWORD?.trim() || DEFAULT_KINE_ADMIN_PASSWORD,
};

export function hasKineAdminCredentials(): boolean {
  return Boolean(kineAdminCredentials.email && kineAdminCredentials.password);
}
