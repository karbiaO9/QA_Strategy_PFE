import { chromium, request as playwrightRequest, type FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { authenticateKineViaApi } from './utils/auth-api';
import { kineCredentials } from './data/auth/kine.credentials';
import { kineAdminCredentials } from './data/auth/kine-admin.credentials';
import { AUTH_STORAGE } from './constants/auth.constants';
import { STORAGE_KEYS } from './constants/storage.constants';
import { getMailboxConfig } from './utils/mailbox.helpers';
import { issueVerificationCode } from './utils/password-recovery.helpers';

async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = process.env.BASE_URL ?? config.projects[0]?.use?.baseURL ?? 'https://kine.physio.agregatech.com';
  const authDir = path.dirname(AUTH_STORAGE.KINE_STATE_PATH);

  fs.mkdirSync(authDir, { recursive: true });

  const email = kineCredentials.email;
  const password = kineCredentials.password;

  if (!email || !password) {
    console.warn('[global-setup] Kine credentials missing — skipping auth storageState.');
    const empty = JSON.stringify({ cookies: [], origins: [] }, null, 2);
    fs.writeFileSync(AUTH_STORAGE.KINE_STATE_PATH, empty);
    fs.writeFileSync(AUTH_STORAGE.ADMIN_STATE_PATH, empty);
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const tokens = await authenticateKineViaApi({ email, password });

    fs.writeFileSync(
      AUTH_STORAGE.KINE_TOKENS_PATH,
      JSON.stringify(
        {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          email,
          savedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(
      ([key, token]) => {
        localStorage.setItem(key, token);
      },
      [STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken] as const
    );

    await context.storageState({ path: AUTH_STORAGE.KINE_STATE_PATH });
    console.log(`[global-setup] Auth storage saved: ${AUTH_STORAGE.KINE_STATE_PATH}`);

    // Optional cabinet-admin storageState for the invitation suite.
    const adminEmail = kineAdminCredentials.email;
    const adminPassword = kineAdminCredentials.password;
    if (adminEmail && adminPassword) {
      try {
        const adminTokens = await authenticateKineViaApi({
          email: adminEmail,
          password: adminPassword,
        });
        const adminContext = await browser.newContext();
        const adminPage = await adminContext.newPage();
        await adminPage.goto(baseURL, { waitUntil: 'domcontentloaded' });
        await adminPage.evaluate(
          ([key, token]) => localStorage.setItem(key, token),
          [STORAGE_KEYS.ACCESS_TOKEN, adminTokens.accessToken] as const
        );
        await adminContext.storageState({ path: AUTH_STORAGE.ADMIN_STATE_PATH });
        fs.writeFileSync(
          AUTH_STORAGE.ADMIN_TOKENS_PATH,
          JSON.stringify({ ...adminTokens, email: adminEmail, savedAt: new Date().toISOString() }, null, 2)
        );
        await adminContext.close();
        console.log(`[global-setup] Admin storage saved: ${AUTH_STORAGE.ADMIN_STATE_PATH}`);
      } catch (adminError) {
        console.warn('[global-setup] Admin storageState skipped:', adminError);
        fs.writeFileSync(
          AUTH_STORAGE.ADMIN_STATE_PATH,
          JSON.stringify({ cookies: [], origins: [] }, null, 2)
        );
      }
    } else {
      fs.writeFileSync(
        AUTH_STORAGE.ADMIN_STATE_PATH,
        JSON.stringify({ cookies: [], origins: [] }, null, 2)
      );
    }

    if (getMailboxConfig() && !process.env.VERIFICATION_CODE?.trim()) {
      const api = await playwrightRequest.newContext({
        baseURL: process.env.API_BASE_URL ?? 'https://identity.physio.agregatech.com',
      });
      try {
        const code = await issueVerificationCode(api, email);
        process.env.VERIFICATION_CODE = code;
        console.log('[global-setup] VERIFICATION_CODE prefetched for STC-AUTH-013/F');
      } catch (prefetchError) {
        console.warn('[global-setup] OTP prefetch skipped:', prefetchError);
      } finally {
        await api.dispose();
      }
    }
  } catch (error) {
    console.error('[global-setup] Failed to create auth storageState:', error);
    const empty = JSON.stringify({ cookies: [], origins: [] }, null, 2);
    fs.writeFileSync(AUTH_STORAGE.KINE_STATE_PATH, empty);
    if (!fs.existsSync(AUTH_STORAGE.ADMIN_STATE_PATH)) {
      fs.writeFileSync(AUTH_STORAGE.ADMIN_STATE_PATH, empty);
    }
    if (process.env.CI === 'true') {
      throw error;
    }
  } finally {
    await browser.close();
  }
}

export default globalSetup;
