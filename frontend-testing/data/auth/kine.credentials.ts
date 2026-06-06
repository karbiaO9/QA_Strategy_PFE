import type { KineCredentials } from '../../utils/types';

/** Default member Kine used by profile / switcher specs (ali.dupont). */
const DEFAULT_KINE_EMAIL = 'ali.dupont@cabinet-paris.fr';
const DEFAULT_KINE_PASSWORD = 'Kine123!';

export const kineCredentials: KineCredentials = {
  email: process.env.KINE_EMAIL?.trim() || DEFAULT_KINE_EMAIL,
  password: process.env.KINE_PASSWORD?.trim() || DEFAULT_KINE_PASSWORD,
  phone: process.env.KINE_PHONE?.trim() || '',
  invalidPassword: process.env.KINE_PASSWORD_INVALID?.trim() || 'WrongP@ssword1!',
};

export const passwordRecoveryData = {
  verificationCode: process.env.VERIFICATION_CODE ?? '',
  resetToken: process.env.RESET_TOKEN ?? '',
  invalidOtp: '999999',
};
