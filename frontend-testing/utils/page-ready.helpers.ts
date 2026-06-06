import type { Page } from '@playwright/test';

/**
 * Waits for Next.js client hydration on auth forms so submit uses React
 * handleSubmit instead of a native GET navigation.
 */
export async function waitForAuthPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.locator('form button[type="submit"]').first().waitFor({
    state: 'visible',
    timeout: 20_000,
  });
}
