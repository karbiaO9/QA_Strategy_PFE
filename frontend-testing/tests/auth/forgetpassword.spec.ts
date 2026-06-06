import { test, expect, stcAnnotations, clearAuthStorage } from '../../fixtures';
import { kineCredentials } from '../../data/auth/kine.credentials';
import { TEST_TAGS } from '../../constants/test-tags.constants';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { ROUTES } from '../../constants/routes.constants';
import { isForgotPasswordRequest } from '../../utils/network.helpers';

const FORGOT_ROUTE = '**/api/v1/kine/auth/forgot-password';

test.describe('Authentication - Forgot password', () => {
  test.describe.configure({ project: 'chromium-guest' });
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test(
    `STC-AUTH-009/F Forgot password success ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-009/F',
        module: 'Authentication — Forgot password',
        priority: 'P0',
        testType: 'Frontend integration (positive)',
        endpoint: 'POST /api/v1/kine/auth/forgot-password',
      }),
    },
    async ({ page, forgotPasswordPage }) => {
      await forgotPasswordPage.open();

      const forgotRequest = page.waitForRequest(
        (req) => req.method() === 'POST' && isForgotPasswordRequest(req.url())
      );
      await forgotPasswordPage.submitEmail(kineCredentials.email);

      const request = await forgotRequest;
      expect(request.postDataJSON()).toEqual({ email: kineCredentials.email });

      const onVerifyCode = new RegExp(
        `${ROUTES.VERIFY_CODE}.*email=${encodeURIComponent(kineCredentials.email)}`
      );
      const redirected = onVerifyCode.test(page.url());
      const obfuscatedSuccess = await page.getByText(/bo.te mail/i).isVisible();
      expect(redirected || obfuscatedSuccess).toBeTruthy();
    }
  );

  test(
    `STC-AUTH-010/F Forgot password validation ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-010/F',
        module: 'Authentication — Forgot password',
        priority: 'P1',
        testType: 'Frontend integration (validation)',
        endpoint: 'POST /api/v1/kine/auth/forgot-password (must not fire when invalid)',
      }),
    },
    async ({ page, forgotPasswordPage }) => {
      let postCount = 0;
      page.on('request', (req) => {
        if (req.method() === 'POST' && isForgotPasswordRequest(req.url())) {
          postCount += 1;
        }
      });

      await forgotPasswordPage.open();
      await forgotPasswordPage.submitButton.click();
      await expect(page.getByText(/obligatoire|email valide/i)).toBeVisible();
      expect(postCount).toBe(0);

      await forgotPasswordPage.emailInput.fill('not-an-email');
      await forgotPasswordPage.submitButton.click();
      await expect(page.getByText(/email valide/i)).toBeVisible();
      expect(postCount).toBe(0);

      const forgotRequest = page.waitForRequest(
        (req) => req.method() === 'POST' && isForgotPasswordRequest(req.url())
      );
      await forgotPasswordPage.submitEmail(kineCredentials.email);
      await forgotRequest;
      expect(postCount).toBeGreaterThanOrEqual(1);
    }
  );

  test(
    `STC-AUTH-011/F Forgot password API error obfuscation ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-011/F',
        module: 'Authentication — Forgot password',
        priority: 'P1',
        testType: 'Frontend integration (negative / security UX)',
        endpoint: 'POST /api/v1/kine/auth/forgot-password',
      }),
    },
    async ({ page, forgotPasswordPage }) => {
      await page.route(FORGOT_ROUTE, (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal error' }),
        })
      );

      await forgotPasswordPage.open();
      await forgotPasswordPage.submitEmail(kineCredentials.email);

      await expect(page.getByText(/bo.te mail|r.initialisation/i)).toBeVisible();
    }
  );

  test(
    `STC-AUTH-012/F Forgot password double submit ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-012/F',
        module: 'Authentication — Forgot password',
        priority: 'P2',
        testType: 'Frontend integration (edge)',
        endpoint: 'POST /api/v1/kine/auth/forgot-password',
      }),
    },
    async ({ page, forgotPasswordPage }) => {
      let inFlight = 0;
      let maxInFlight = 0;

      await page.route(FORGOT_ROUTE, async (route) => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((r) => setTimeout(r, 800));
        inFlight -= 1;
        await route.continue();
      });

      await forgotPasswordPage.open();
      const forgotRequest = page.waitForRequest(
        (req) => req.method() === 'POST' && isForgotPasswordRequest(req.url())
      );
      await forgotPasswordPage.emailInput.fill(kineCredentials.email);
      await forgotPasswordPage.submitButton.click();

      await expect(forgotPasswordPage.emailInput).toBeDisabled();
      await expect(forgotPasswordPage.submitButton).toBeDisabled();

      await forgotPasswordPage.submitButton.click({ force: true }).catch(() => undefined);
      await forgotRequest;

      expect(maxInFlight).toBeLessThanOrEqual(1);
    }
  );
});
