import type { APIRequestContext, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AUTH_STORAGE } from '../constants/auth.constants';
import { fetchLatestOtp, getMailboxConfig } from './mailbox.helpers';

const OTP_SENDER = process.env.OTP_SENDER ?? 'it.purasolutions@gmail.com';
const CACHE_TTL_MS = 8 * 60_000;
const MOCK_RESET_TOKEN = 'e2e-mock-reset-token';

export interface RecoveryCredentials {
  verificationCode: string;
  resetToken: string;
  mocked?: boolean;
}

interface RecoveryFile extends Partial<RecoveryCredentials> {
  email?: string;
  updatedAt?: string;
}

function readRecoveryFile(): RecoveryFile | null {
  try {
    return JSON.parse(fs.readFileSync(AUTH_STORAGE.RECOVERY_PATH, 'utf-8')) as RecoveryFile;
  } catch {
    return null;
  }
}

function writeRecoveryFile(data: RecoveryFile): void {
  fs.mkdirSync(path.dirname(AUTH_STORAGE.RECOVERY_PATH), { recursive: true });
  fs.writeFileSync(AUTH_STORAGE.RECOVERY_PATH, JSON.stringify(data, null, 2));
}

function isFresh(entry: RecoveryFile | null, email: string): boolean {
  if (!entry || entry.email !== email || !entry.updatedAt) {
    return false;
  }
  return Date.now() - new Date(entry.updatedAt).getTime() < CACHE_TTL_MS;
}

async function postForgotPassword(
  request: APIRequestContext,
  email: string
): Promise<void> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await request.post(API_ENDPOINTS.FORGOT_PASSWORD, {
      data: { email },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    if (response.status() === 429) {
      await new Promise((resolve) => setTimeout(resolve, 15_000 * (attempt + 1)));
      continue;
    }

    if (!response.ok()) {
      throw new Error(
        `forgot-password failed (${response.status()}): ${await response.text()}`
      );
    }

    return;
  }

  throw new Error('forgot-password rate-limited after retries');
}

export function installRecoveryApiMocks(page: Page): void {
  page.route('**/api/v1/kine/auth/verify-code', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resetToken: MOCK_RESET_TOKEN }),
    });
  });

  page.route('**/api/v1/kine/auth/reset-password', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Password updated' }),
    });
  });
}

export async function issueVerificationCode(
  request: APIRequestContext,
  email: string,
  page?: Page
): Promise<string> {
  const manual = process.env.VERIFICATION_CODE?.trim();
  if (manual) {
    return manual;
  }

  const cached = readRecoveryFile();
  if (isFresh(cached, email) && cached?.verificationCode) {
    return cached.verificationCode;
  }

  const mailbox = getMailboxConfig();
  if (!mailbox) {
    if (page) {
      installRecoveryApiMocks(page);
      return '123456';
    }
    throw new Error(
      'Set VERIFICATION_CODE in .env, configure GMAIL_USER + GMAIL_APP_PASSWORD, or pass page for UI mock fallback.'
    );
  }

  const requestedAt = new Date(Date.now() - 10_000);
  await postForgotPassword(request, email);

  const code = await fetchLatestOtp(mailbox, {
    fromContains: OTP_SENDER,
    receivedAfter: requestedAt,
    timeoutMs: 90_000,
  });

  writeRecoveryFile({
    email,
    verificationCode: code,
    updatedAt: new Date().toISOString(),
  });

  return code;
}

export async function verifyCodeViaApi(
  request: APIRequestContext,
  email: string,
  code: string
): Promise<string> {
  const manualToken = process.env.RESET_TOKEN?.trim();
  if (manualToken) {
    return manualToken;
  }

  if (code === '123456') {
    return MOCK_RESET_TOKEN;
  }

  const response = await request.post(API_ENDPOINTS.VERIFY_CODE, {
    data: { email, code },
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  if (!response.ok()) {
    throw new Error(`verify-code failed (${response.status()}): ${await response.text()}`);
  }

  const body = (await response.json()) as { resetToken?: string };
  if (!body.resetToken) {
    throw new Error('verify-code response missing resetToken');
  }

  writeRecoveryFile({
    email,
    verificationCode: code,
    resetToken: body.resetToken,
    updatedAt: new Date().toISOString(),
  });

  return body.resetToken;
}

export async function obtainResetToken(
  request: APIRequestContext,
  email: string,
  page?: Page
): Promise<string> {
  const manual = process.env.RESET_TOKEN?.trim();
  if (manual) {
    return manual;
  }

  const cached = readRecoveryFile();
  if (isFresh(cached, email) && cached?.resetToken) {
    return cached.resetToken;
  }

  const code = await issueVerificationCode(request, email, page);
  return verifyCodeViaApi(request, email, code);
}
