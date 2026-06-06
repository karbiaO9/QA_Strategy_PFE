import type { KineCredentials } from '../../utils/types';

/**
 * Existing Kine account that receives practitioner invitations
 * (STC-INVIT-ACCEPT-004/B). Configure GMAIL_USER to this inbox for
 * automatic invitation-link capture from email.
 */
const DEFAULT_INVITEE_EMAIL = 'koussema999@gmail.com';
const DEFAULT_INVITEE_PASSWORD = 'Oussema+123';

export const kineInviteeCredentials: KineCredentials = {
  email: process.env.KINE_INVITEE_EMAIL?.trim() || DEFAULT_INVITEE_EMAIL,
  password: process.env.KINE_INVITEE_PASSWORD?.trim() || DEFAULT_INVITEE_PASSWORD,
  phone: process.env.KINE_INVITEE_PHONE?.trim() || '',
  invalidPassword: process.env.KINE_INVITEE_PASSWORD_INVALID?.trim() || 'WrongP@ssword1!',
};

export function hasKineInviteeCredentials(): boolean {
  return Boolean(kineInviteeCredentials.email && kineInviteeCredentials.password);
}
