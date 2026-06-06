import type { InvitationPayload, TargetProfileType } from '../../utils/types';
import { kineInviteeCredentials } from '../auth/kine-invitee.credentials';

/**
 * Email that receives the invitation (STC-INVIT-GEN-003/B → ACCEPT-004/B).
 * Defaults to the invitee Kine account inbox.
 */
export function invitationRecipientEmail(): string {
  return (
    process.env.INVITATION_RECIPIENT_EMAIL?.trim() ||
    process.env.KINE_INVITEE_EMAIL?.trim() ||
    kineInviteeCredentials.email
  );
}

/**
 * Generates a unique, routable test email so repeated runs against the
 * LIVE backend never collide on an already-invited address.
 * When INVITATION_RECIPIENT_EMAIL / KINE_INVITEE_EMAIL is set, uses that
 * address so the accept flow can read the mail in the same inbox.
 */
export function uniqueInviteEmail(prefix = 'pc-invite'): string {
  const explicit = invitationRecipientEmail();
  if (explicit && !process.env.FORCE_UNIQUE_INVITE_EMAIL) {
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
    if (explicit.includes('@')) {
      const [local, domain] = explicit.split('@');
      return `${local}+${prefix}-${stamp}@${domain}`;
    }
  }

  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
  const base = process.env.KINE_EMAIL;
  if (base && base.includes('@')) {
    const [local, domain] = base.split('@');
    return `${local}+${prefix}-${stamp}@${domain}`;
  }
  return `${prefix}-${stamp}@example.com`;
}

export function validInvitation(
  targetProfileType: TargetProfileType = 'MEMBER',
  overrides: Partial<InvitationPayload> = {}
): InvitationPayload {
  return {
    targetProfileType,
    firstName: 'Test',
    email: uniqueInviteEmail(),
    ...overrides,
  };
}

/**
 * Malformed inputs for negative testing. `expectedMessage` is matched
 * (case-insensitive) against the client-side validation text rendered
 * by the practitioner dialog (zod: practitionerFormSchema).
 */
export const invalidInvitationCases: ReadonlyArray<{
  id: string;
  firstName: string;
  email: string;
  expectedMessage: RegExp;
}> = [
  {
    id: 'empty-first-name',
    firstName: '',
    email: 'valid@example.com',
    expectedMessage: /obligatoire/i,
  },
  {
    id: 'empty-email',
    firstName: 'Test',
    email: '',
    expectedMessage: /obligatoire/i,
  },
  {
    id: 'email-no-at',
    firstName: 'Test',
    email: 'not-an-email',
    expectedMessage: /email valide/i,
  },
  {
    id: 'email-no-domain',
    firstName: 'Test',
    email: 'broken@',
    expectedMessage: /email valide/i,
  },
  {
    id: 'email-spaces',
    firstName: 'Test',
    email: 'a b@c.d',
    expectedMessage: /email valide/i,
  },
];

/**
 * Server-side rejection scenarios for the create-invitation flow.
 * Used to assert UI error handling without simulating success.
 */
export const invitationServerErrors = {
  insufficientRole: { status: 403, message: 'Rôle insuffisant' },
  invitationConsumed: { status: 409, message: 'Invitation déjà utilisée' },
  badPassword: { status: 401, message: 'Mot de passe incorrect' },
} as const;
