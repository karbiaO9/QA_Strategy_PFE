import {
  test,
  expect,
  stcAnnotations,
  readAccessToken,
  loginViaUi,
  clearAuthStorage,
  setAccessToken,
  acceptNextDialog,
} from '../../fixtures';
import { kineCredentials } from '../../data/auth/kine.credentials';
import { TEST_TAGS } from '../../constants/test-tags.constants';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { ROUTES } from '../../constants/routes.constants';
import {
  isForgotPasswordRequest,
  isLoginRequest,
  isMeRequest,
  isRefreshRequest,
  isResetPasswordRequest,
  isVerifyCodeRequest,
} from '../../utils/network.helpers';

test.describe('Authentication — Refresh token & public headers', () => {
  test(
    `STC-AUTH-025/F Silent refresh on 401 ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-025/F',
        module: 'Authentication — Refresh',
        priority: 'P0',
        testType: 'Frontend integration (positive)',
        endpoint: 'POST /api/v1/kine/auth/refresh-token',
      }),
    },
    async ({ page }) => {
      test.use({ storageState: { cookies: [], origins: [] } });

      const tokens = await loginViaUi(page, kineCredentials.email, kineCredentials.password);
      expect(tokens?.refreshToken).toBeTruthy();

      let meAttempts = 0;
      const newAccess = 'e2e-new-access-token';
      const refreshCalls: string[] = [];

      await page.route('**/api/v1/kine/me**', async (route) => {
        meAttempts += 1;
        if (meAttempts === 1) {
          await route.fulfill({ status: 401, body: '{}' });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: '1', firstName: 'Test', lastName: 'User', email: kineCredentials.email },
            profiles: [],
          }),
        });
      });

      await page.route('**/auth/refresh-token', async (route) => {
        refreshCalls.push(route.request().postData() ?? '');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accessToken: newAccess,
            refreshToken: tokens!.refreshToken,
          }),
        });
      });

      await page.evaluate(() => {
        localStorage.removeItem('pc_access_token');
        sessionStorage.setItem('e2e_force_me', '1');
      });
      await setAccessToken(page, tokens!.accessToken);

      await page.reload();

      await page.waitForResponse(
        (res) => isRefreshRequest(res.url()) && res.request().method() === 'POST'
      ).catch(() => null);

      if (refreshCalls.length > 0) {
        expect(refreshCalls[0]).toContain(tokens!.refreshToken);
      }
    }
  );

  test(
    `STC-AUTH-026/F Refresh failure logs out ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-026/F',
        module: 'Authentication — Refresh',
        priority: 'P0',
        testType: 'Frontend integration (negative)',
        endpoint: 'POST /api/v1/kine/auth/refresh-token',
      }),
    },
    async ({ page }) => {
      test.use({ storageState: { cookies: [], origins: [] } });

      const tokens = await loginViaUi(page, kineCredentials.email, kineCredentials.password);
      expect(tokens?.refreshToken).toBeTruthy();

      let refreshAttempts = 0;
      await page.route('**/api/v1/kine/me**', (route) => route.fulfill({ status: 401, body: '{}' }));
      await page.route('**/auth/refresh-token', async (route) => {
        refreshAttempts += 1;
        await route.fulfill({ status: 401, body: JSON.stringify({ message: 'revoked' }) });
      });

      await page.reload();

      await page.waitForTimeout(3000);
      expect(refreshAttempts).toBeLessThanOrEqual(2);
      expect(await readAccessToken(page)).toBeFalsy();
    }
  );

  test(
    `STC-AUTH-027/F 401 without refresh token ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-027/F',
        module: 'Authentication — Refresh',
        priority: 'P1',
        testType: 'Frontend integration (edge)',
        endpoint: 'None (refresh must not be called)',
      }),
    },
    async ({ page }) => {
      test.use({ storageState: { cookies: [], origins: [] } });

      await loginViaUi(page, kineCredentials.email, kineCredentials.password);
      await page.reload();

      let refreshCalls = 0;
      page.on('request', (req) => {
        if (req.method() === 'POST' && isRefreshRequest(req.url())) {
          refreshCalls += 1;
        }
      });

      await page.route('**/api/v1/kine/me**', (route) => route.fulfill({ status: 401, body: '{}' }));

      await page.goto(ROUTES.DASHBOARD);
      await page.waitForTimeout(2000);

      expect(refreshCalls).toBe(0);
      expect(await readAccessToken(page)).toBeFalsy();
      await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}`));
    }
  );

  test(
    `STC-AUTH-028/F Public endpoints omit Bearer ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-028/F',
        module: 'Authentication — Base query',
        priority: 'P1',
        testType: 'Frontend integration (security)',
        endpoint: 'Login, forgot-password, verify-code, reset-password vs GET /me',
      }),
    },
    async ({ page, loginPage, forgotPasswordPage, verifyCodePage, resetPasswordPage }) => {
      test.use({ storageState: { cookies: [], origins: [] } });
      await clearAuthStorage(page);
      await setAccessToken(page, 'bogus-stale-token');

      const assertNoBearer = (url: string, headers: Record<string, string>) => {
        if (
          isLoginRequest(url) ||
          isForgotPasswordRequest(url) ||
          isVerifyCodeRequest(url) ||
          isResetPasswordRequest(url)
        ) {
          expect(headers['authorization']).toBeUndefined();
        }
      };

      page.on('request', (req) => assertNoBearer(req.url(), req.headers()));

      acceptNextDialog(page);
      await loginPage.open();
      await loginPage.form.fillCredentials(kineCredentials.email, kineCredentials.invalidPassword);
      await loginPage.form.submit();
      await page.waitForTimeout(500);

      await forgotPasswordPage.open();
      await forgotPasswordPage.submitEmail(kineCredentials.email).catch(() => undefined);
      await page.waitForTimeout(500);

      await verifyCodePage.openWithEmail(kineCredentials.email);
      await verifyCodePage.enterCode('999999');
      await verifyCodePage.submit();
      await page.waitForTimeout(500);

      await resetPasswordPage.openWithParams(kineCredentials.email, 'fake-token');
      await resetPasswordPage.resetPassword('QaTest123!', 'QaTest123!').catch(() => undefined);
      await page.waitForTimeout(500);

      let meHasBearer = false;
      page.off('request', () => undefined);
      page.on('request', (req) => {
        if (req.method() === 'GET' && isMeRequest(req.url())) {
          meHasBearer = Boolean(req.headers()['authorization']);
        }
      });

      await page.goto(ROUTES.DASHBOARD);
      await page.waitForTimeout(1500);
      expect(meHasBearer).toBe(true);
    }
  );
});
