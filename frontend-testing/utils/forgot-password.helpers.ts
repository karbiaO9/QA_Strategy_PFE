import type { Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { isForgotPasswordRequest } from './network.helpers';

export function waitForForgotPasswordPost(page: Page) {
  return page.waitForResponse(
    (res) => res.request().method() === 'POST' && isForgotPasswordRequest(res.url())
  );
}

export async function waitForForgotPasswordOutcome(page: Page, email: string): Promise<void> {
  const verifyCodePattern = new RegExp(
    `${ROUTES.VERIFY_CODE}.*email=${encodeURIComponent(email)}`
  );

  await Promise.race([
    page.waitForURL(verifyCodePattern, { timeout: 25_000 }),
    page
      .getByRole('heading', { level: 2 })
      .filter({ hasText: /bo.te mail/i })
      .waitFor({ state: 'visible', timeout: 25_000 }),
  ]).catch(async () => {
    const redirected = verifyCodePattern.test(page.url());
    const successHeading = await page
      .getByRole('heading', { level: 2 })
      .filter({ hasText: /bo.te mail/i })
      .isVisible();
    if (!redirected && !successHeading) {
      throw new Error('Forgot-password success UI or verify-code redirect did not appear');
    }
  });
}
