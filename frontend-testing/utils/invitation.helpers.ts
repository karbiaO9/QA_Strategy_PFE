import type { APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { AUTH_STORAGE } from '../constants/auth.constants';
import { API_ENDPOINTS } from '../constants/api.constants';
import { fetchLatestEmailMatch, getMailboxConfig } from './mailbox.helpers';

const OTP_SENDER = process.env.OTP_SENDER ?? 'it.purasolutions@gmail.com';
const INVITATION_ID_PATTERN = /\/invitation\/([a-f0-9]{24})/i;
const INVITATION_URL_PATTERN =
  /https?:\/\/[^\s"'<>]+\/invitation\/[a-f0-9]{24}/i;

export interface InvitationChainState {
  invitationId: string;
  invitationUrl?: string;
  inviteeEmail: string;
  createdAt: string;
}

export interface CreateInvitationResponse {
  invitationId?: string;
  invitationUrl?: string;
  invitationToken?: string;
  emailDelivered?: boolean;
  expiresAt?: string;
  cabinetName?: string;
  targetProfileType?: string;
}

export function readInvitationChain(): InvitationChainState | null {
  try {
    return JSON.parse(
      fs.readFileSync(AUTH_STORAGE.INVITATION_CHAIN_PATH, 'utf-8')
    ) as InvitationChainState;
  } catch {
    return null;
  }
}

export function writeInvitationChain(state: InvitationChainState): void {
  fs.mkdirSync(path.dirname(AUTH_STORAGE.INVITATION_CHAIN_PATH), { recursive: true });
  fs.writeFileSync(AUTH_STORAGE.INVITATION_CHAIN_PATH, JSON.stringify(state, null, 2));
}

export function resolveInvitationId(
  body: CreateInvitationResponse,
  invitationUrl?: string
): string {
  if (body.invitationId) {
    return body.invitationId;
  }
  const url = invitationUrl ?? body.invitationUrl ?? '';
  const fromUrl = url.match(INVITATION_ID_PATTERN);
  if (fromUrl?.[1]) {
    return fromUrl[1];
  }
  throw new Error('Create-invitation response missing invitationId and invitationUrl');
}

export function buildInvitationPath(invitationId: string): string {
  return `/invitation/${invitationId}`;
}

export async function verifyInvitationPersisted(
  request: APIRequestContext,
  invitationId: string
): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await request.post(API_ENDPOINTS.INVITATIONS_PREVIEW, {
    data: { invitationId },
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  });

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status(), body };
}

/**
 * Reads the invitation deep-link from the invitee mailbox (same approach as OTP capture).
 */
export async function fetchInvitationLinkFromMail(
  receivedAfter: Date
): Promise<{ invitationId: string; invitationUrl: string }> {
  const mailbox = getMailboxConfig();
  if (!mailbox) {
    throw new Error(
      'Configure GMAIL_USER + GMAIL_APP_PASSWORD (invitee inbox) or set INVITATION_ID in .env'
    );
  }

  const invitationUrl = await fetchLatestEmailMatch(mailbox, {
    fromContains: OTP_SENDER,
    receivedAfter,
    bodyPattern: INVITATION_URL_PATTERN,
    timeoutMs: 120_000,
  });

  const idMatch = invitationUrl.match(INVITATION_ID_PATTERN);
  if (!idMatch?.[1]) {
    throw new Error(`Invitation URL found but id could not be parsed: ${invitationUrl}`);
  }

  return { invitationId: idMatch[1], invitationUrl };
}

export async function resolveInvitationIdForAccept(
  chain: InvitationChainState | null,
  receivedAfter?: Date
): Promise<string> {
  const manual = process.env.INVITATION_ID?.trim();
  if (manual) {
    return manual;
  }

  if (!chain?.invitationId) {
    throw new Error('No invitation context: run STC-INVIT-GEN-003/B first or set INVITATION_ID');
  }

  const mailbox = getMailboxConfig();
  if (mailbox && receivedAfter) {
    try {
      const mail = await fetchInvitationLinkFromMail(receivedAfter);
      return mail.invitationId;
    } catch {
      return chain.invitationId;
    }
  }

  return chain.invitationId;
}
