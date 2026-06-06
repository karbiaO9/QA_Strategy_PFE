import fs from 'fs';
import path from 'path';
import type { Page } from '@playwright/test';
import { authenticateKineViaApi } from './auth-api';
import { API_ENDPOINTS } from '../constants/api.constants';
import { AUTH_STORAGE } from '../constants/auth.constants';
import { ROUTES } from '../constants/routes.constants';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { LoginPage } from '../pages/login.page';
import { AppShellPage } from '../pages/app-shell.page';
import { isLogoutRequest } from './network.helpers';
import type { AuthTokens } from './types';

export async function clearAuthStorage(page: Page): Promise<void> {
  await page.goto(ROUTES.LOGIN);
  await page.evaluate((key) => {
    localStorage.removeItem(key);
    sessionStorage.clear();
  }, STORAGE_KEYS.ACCESS_TOKEN);
}

export async function readAccessToken(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.ACCESS_TOKEN);
}

export async function setAccessToken(page: Page, token: string): Promise<void> {
  await page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [STORAGE_KEYS.ACCESS_TOKEN, token] as const
  );
}

function readStoredTokens(): AuthTokens | null {
  try {
    const raw = fs.readFileSync(AUTH_STORAGE.KINE_TOKENS_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<AuthTokens>;
    if (parsed.accessToken) {
      return {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken ?? '',
      };
    }
  } catch {
    // fall through to storage-state file
  }

  try {
    const raw = fs.readFileSync(AUTH_STORAGE.KINE_STATE_PATH, 'utf-8');
    const state = JSON.parse(raw) as {
      origins?: { localStorage?: { name: string; value: string }[] }[];
    };
    for (const origin of state.origins ?? []) {
      const entry = origin.localStorage?.find((e) => e.name === STORAGE_KEYS.ACCESS_TOKEN);
      if (entry?.value) {
        return { accessToken: entry.value, refreshToken: '' };
      }
    }
  } catch {
    // no stored session
  }

  return null;
}

async function isAccessTokenValid(page: Page, accessToken: string): Promise<boolean> {
  try {
    const res = await page.request.get(API_ENDPOINTS.ME, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok();
  } catch {
    return false;
  }
}

async function injectSession(page: Page, accessToken: string): Promise<void> {
  await page.goto(ROUTES.LOGIN, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ([key, token]) => {
      localStorage.setItem(key, token);
    },
    [STORAGE_KEYS.ACCESS_TOKEN, accessToken] as const
  );
  await page.goto(ROUTES.DASHBOARD, { waitUntil: 'domcontentloaded' });
}

export async function loginViaApi(
  page: Page,
  email: string,
  password: string
): Promise<AuthTokens> {
  const tokens = await authenticateKineViaApi({ email, password });
  await injectSession(page, tokens.accessToken);
  await page.waitForURL((url) => !url.pathname.includes(ROUTES.LOGIN), { timeout: 25_000 });
  return tokens;
}

/**
 * Reuses the session from global-setup when still valid; otherwise logs in via API
 * (one call per test instead of a full UI login — avoids identity API rate limits).
 */
export async function seedAuthSession(
  page: Page,
  email: string,
  password: string
): Promise<AuthTokens | null> {
  let session = readStoredTokens();

  if (session && (await isAccessTokenValid(page, session.accessToken))) {
    await injectSession(page, session.accessToken);
    return session;
  }

  try {
    return await loginViaApi(page, email, password);
  } catch {
    return null;
  }
}

/**
 * Preferred helper for tests that need an authenticated session but do not assert the login UI.
 */
export async function ensureAuthSession(
  page: Page,
  email: string,
  password: string
): Promise<AuthTokens> {
  const seeded = await seedAuthSession(page, email, password);
  if (seeded) {
    return seeded;
  }

  const ui = await loginViaUi(page, email, password);
  if (ui) {
    return ui;
  }

  return loginViaApi(page, email, password);
}

async function loginViaUiOnce(
  page: Page,
  email: string,
  password: string
): Promise<AuthTokens | null> {
  const loginPage = new LoginPage(page);
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes('/auth/login') && res.request().method() === 'POST'
  );

  await loginPage.open();
  await loginPage.form.fillCredentials(email, password);
  await loginPage.form.submit();

  const response = await responsePromise.catch(() => null);
  if (!response?.ok()) {
    return null;
  }

  const body = (await response.json()) as AuthTokens & { user?: unknown };

  await page.waitForFunction(
    ([key, token]) => localStorage.getItem(key) === token,
    [STORAGE_KEYS.ACCESS_TOKEN, body.accessToken] as const,
    { timeout: 15_000 }
  );

  await page.waitForURL((url) => !url.pathname.includes(ROUTES.LOGIN), { timeout: 25_000 });

  return { accessToken: body.accessToken, refreshToken: body.refreshToken };
}

export async function loginViaUi(
  page: Page,
  email: string,
  password: string
): Promise<AuthTokens | null> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) {
      await page.waitForTimeout(1_500 * attempt);
    }
    const tokens = await loginViaUiOnce(page, email, password);
    if (tokens) {
      return tokens;
    }
  }
  return null;
}

/**
 * Authenticated session for the cabinet-admin Kine account (invitation
 * creation). Does not reuse the member storageState; logs in via the
 * identity API and injects the token. Returns null when credentials
 * are missing or rejected so specs can `test.skip()` instead of erroring.
 */
export async function ensureKineAdminSession(
  page: Page,
  email: string,
  password: string
): Promise<AuthTokens | null> {
  if (!email || !password) {
    return null;
  }
  try {
    const tokens = await authenticateKineViaApi({ email, password });
    fs.mkdirSync(path.dirname(AUTH_STORAGE.ADMIN_TOKENS_PATH), { recursive: true });
    fs.writeFileSync(
      AUTH_STORAGE.ADMIN_TOKENS_PATH,
      JSON.stringify({ ...tokens, email, savedAt: new Date().toISOString() }, null, 2)
    );
    await injectSession(page, tokens.accessToken);
    await page.waitForURL((url) => !url.pathname.includes(ROUTES.LOGIN), { timeout: 25_000 });
    return tokens;
  } catch {
    return null;
  }
}

export async function triggerSidebarLogout(page: Page): Promise<void> {
  const shell = new AppShellPage(page);
  await shell.logoutFromSidebar();
}

export async function triggerServerLogoutApi(page: Page): Promise<void> {
  const responsePromise = page.waitForResponse(
    (res) => res.request().method() === 'POST' && isLogoutRequest(res.url())
  );

  await page.evaluate(async (logoutUrl) => {
    const token = localStorage.getItem('pc_access_token');
    if (!token) {
      return;
    }
    await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    localStorage.removeItem('pc_access_token');
  }, API_ENDPOINTS.LOGOUT);

  await responsePromise;
}

export async function persistRefreshTokenForReload(page: Page, refreshToken: string): Promise<void> {
  await page.evaluate(
    ([key, value]) => {
      sessionStorage.setItem(key, value);
    },
    ['e2e_refresh_token', refreshToken] as const
  );
}

export function acceptNextDialog(page: Page): void {
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });
}
