import { test, expect, stcAnnotations, acceptNextDialog, clearAuthStorage } from '../../fixtures';
import { kineCredentials, passwordRecoveryData } from '../../data/auth/kine.credentials';
import { TEST_TAGS } from '../../constants/test-tags.constants';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { ROUTES } from '../../constants/routes.constants';
import { isResetPasswordRequest } from '../../utils/network.helpers';

const NEW_PASSWORD = 'QaTest123!';
const RESET_ROUTE = '**/api/v1/kine/auth/reset-password';

test.describe('Authentication - Reset password', () => {
  test.describe.configure({ project: 'chromium-guest' });
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test(
    `STC-AUTH-017/F Reset password success ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-017/F',
        module: 'Authentication — Reset password',
        priority: 'P0',
        testType: 'Frontend integration (positive)',
        endpoint: 'POST /api/v1/kine/auth/reset-password',
      }),
    },
    async ({ page, resetPasswordPage }) => {
      test.skip(
        !passwordRecoveryData.resetToken,
        'Set RESET_TOKEN in .env (from verify-code flow)'
      );

      acceptNextDialog(page);

      const resetRequest = page.waitForRequest(
        (req) => req.method() === 'POST' && isResetPasswordRequest(req.url())
      );

      await resetPasswordPage.openWithParams(
        kineCredentials.email,
        passwordRecoveryData.resetToken
      );
      await resetPasswordPage.resetPassword(NEW_PASSWORD, NEW_PASSWORD);

      const request = await resetRequest;
      expect(request.postDataJSON()).toMatchObject({
        email: kineCredentials.email,
        resetToken: passwordRecoveryData.resetToken,
        newPassword: NEW_PASSWORD,
      });

      await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));
    }
  );

  test(
    `STC-AUTH-018/F Reset password missing params ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-018/F',
        module: 'Authentication — Reset password',
        priority: 'P1',
        testType: 'Frontend integration (edge)',
        endpoint: 'POST /api/v1/kine/auth/reset-password (must not fire)',
      }),
    },
    async ({ page, resetPasswordPage }) => {
      let resetCalls = 0;
      page.on('request', (req) => {
        if (req.method() === 'POST' && isResetPasswordRequest(req.url())) {
          resetCalls += 1;
        }
      });

      await resetPasswordPage.openWithoutParams();
      await expect(page).toHaveURL(new RegExp(`${ROUTES.FORGOT_PASSWORD}`));
      expect(resetCalls).toBe(0);
    }
  );

  test(
    `STC-AUTH-019/F Reset password validation and API error ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-019/F',
        module: 'Authentication — Reset password',
        priority: 'P1',
        testType: 'Frontend integration (negative)',
        endpoint: 'POST /api/v1/kine/auth/reset-password',
      }),
    },
    async ({ page, resetPasswordPage }) => {
      const token = passwordRecoveryData.resetToken || 'test-reset-token';

      let resetCalls = 0;
      page.on('request', (req) => {
        if (req.method() === 'POST' && isResetPasswordRequest(req.url())) {
          resetCalls += 1;
        }
      });

      await resetPasswordPage.openWithParams(kineCredentials.email, token);
      await resetPasswordPage.resetPassword('123', '123');
      await expect(
        page.locator('p.text-destructive').filter({ hasText: /6 caract/i })
      ).toBeVisible();
      expect(resetCalls).toBe(0);

      await resetPasswordPage.resetPassword(NEW_PASSWORD, 'DifferentPass1!');
      await expect(
        page.locator('p.text-destructive').filter({ hasText: /ne correspondent pas/i })
      ).toBeVisible();
      expect(resetCalls).toBe(0);

      acceptNextDialog(page);
      await page.route(RESET_ROUTE, (route) =>
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Token invalide' }),
        })
      );

      await resetPasswordPage.resetPassword(NEW_PASSWORD, NEW_PASSWORD);
      await expect(resetPasswordPage.passwordInput).toBeEnabled();
    }
  );

  test(
    `STC-AUTH-020/F Reset password loading state ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-020/F',
        module: 'Authentication — Reset password',
        priority: 'P2',
        testType: 'Frontend integration (UX)',
        endpoint: 'POST /api/v1/kine/auth/reset-password',
      }),
    },
    async ({ page, resetPasswordPage }) => {
      const token = passwordRecoveryData.resetToken || 'test-reset-token';

      await page.route(RESET_ROUTE, async (route) => {
        await new Promise((r) => setTimeout(r, 700));
        await route.continue();
      });

      await resetPasswordPage.openWithParams(kineCredentials.email, token);
      await resetPasswordPage.passwordInput.fill(NEW_PASSWORD);
      await resetPasswordPage.confirmPasswordInput.fill(NEW_PASSWORD);
      await resetPasswordPage.submitButton.click();

      await expect(resetPasswordPage.passwordInput).toBeDisabled();
      await expect(resetPasswordPage.confirmPasswordInput).toBeDisabled();
    }
  );
});
