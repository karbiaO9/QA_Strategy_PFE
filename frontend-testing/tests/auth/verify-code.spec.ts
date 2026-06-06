import { test, expect, stcAnnotations, acceptNextDialog, clearAuthStorage } from '../../fixtures';
import { kineCredentials, passwordRecoveryData } from '../../data/auth/kine.credentials';
import { TEST_TAGS } from '../../constants/test-tags.constants';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { ROUTES } from '../../constants/routes.constants';
import { isForgotPasswordRequest, isVerifyCodeRequest } from '../../utils/network.helpers';

test.describe('Authentication — Verify code', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test(
    `STC-AUTH-013/F Verify code success ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-013/F',
        module: 'Authentication — Verify code',
        priority: 'P0',
        testType: 'Frontend integration (positive)',
        endpoint: 'POST /api/v1/kine/auth/verify-code',
      }),
    },
    async ({ page, verifyCodePage }) => {
      test.skip(
        !passwordRecoveryData.verificationCode,
        'Set VERIFICATION_CODE in .env (from mail capture or backend seed)'
      );

      const verifyRequest = page.waitForRequest(
        (req) => req.method() === 'POST' && isVerifyCodeRequest(req.url())
      );

      await verifyCodePage.openWithEmail(kineCredentials.email);
      await verifyCodePage.enterCode(passwordRecoveryData.verificationCode);
      await verifyCodePage.submit();

      const request = await verifyRequest;
      expect(request.postDataJSON()).toMatchObject({
        email: kineCredentials.email,
        code: passwordRecoveryData.verificationCode,
      });

      await expect(page).toHaveURL(new RegExp(`${ROUTES.RESET_PASSWORD}`));
      await expect(page).toHaveURL(new RegExp('email='));
      await expect(page).toHaveURL(new RegExp('token='));
    }
  );

  test(
    `STC-AUTH-014/F Verify code incomplete blocked ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-014/F',
        module: 'Authentication — Verify code',
        priority: 'P1',
        testType: 'Frontend integration (validation)',
        endpoint: 'POST /api/v1/kine/auth/verify-code',
      }),
    },
    async ({ page, verifyCodePage }) => {
      let verifyCalls = 0;
      page.on('request', (req) => {
        if (req.method() === 'POST' && isVerifyCodeRequest(req.url())) {
          verifyCalls += 1;
        }
      });

      await verifyCodePage.openWithEmail(kineCredentials.email);
      await verifyCodePage.enterCode('12345');
      await expect(verifyCodePage.submitButton).toBeDisabled();

      await verifyCodePage.submitButton.click({ force: true }).catch(() => undefined);
      expect(verifyCalls).toBe(0);

      await verifyCodePage.enterCode('6');
      await expect(verifyCodePage.submitButton).toBeEnabled();

      await verifyCodePage.submit();
      await page.waitForRequest(
        (req) => req.method() === 'POST' && isVerifyCodeRequest(req.url())
      ).catch(() => undefined);
    }
  );

  test(
    `STC-AUTH-015/F Verify code wrong code ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-015/F',
        module: 'Authentication — Verify code',
        priority: 'P0',
        testType: 'Frontend integration (negative)',
        endpoint: 'POST /api/v1/kine/auth/verify-code',
      }),
    },
    async ({ page, verifyCodePage }) => {
      await verifyCodePage.openWithEmail(kineCredentials.email);
      await verifyCodePage.enterCode(passwordRecoveryData.invalidOtp);
      await verifyCodePage.submit();

      await expect(verifyCodePage.errorMessage).toBeVisible();
      await expect(page).not.toHaveURL(new RegExp(`${ROUTES.RESET_PASSWORD}`));
      await expect(verifyCodePage.digitInputs.first()).toBeEnabled();
    }
  );

  test(
    `STC-AUTH-016/F Resend code ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-016/F',
        module: 'Authentication — Verify code',
        priority: 'P1',
        testType: 'Frontend integration (multi-call)',
        endpoint: 'POST /api/v1/kine/auth/forgot-password (resend)',
      }),
    },
    async ({ page, verifyCodePage }) => {
      acceptNextDialog(page);

      const resendRequest = page.waitForRequest(
        (req) => req.method() === 'POST' && isForgotPasswordRequest(req.url())
      );

      await verifyCodePage.openWithEmail(kineCredentials.email);
      await verifyCodePage.enterCode('123456');
      await verifyCodePage.resendCode();

      const request = await resendRequest;
      expect(request.postDataJSON()).toEqual({ email: kineCredentials.email });

      await expect(verifyCodePage.digitInputs.first()).toHaveValue('');
    }
  );
});
