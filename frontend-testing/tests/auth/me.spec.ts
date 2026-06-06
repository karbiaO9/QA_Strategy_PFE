import {
  test,
  expect,
  stcAnnotations,
  readAccessToken,
  loginViaUi,
  setAccessToken,
  clearAuthStorage,
} from '../../fixtures';
import { kineCredentials } from '../../data/auth/kine.credentials';
import { TEST_TAGS } from '../../constants/test-tags.constants';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { ROUTES } from '../../constants/routes.constants';
import { isMeRequest } from '../../utils/network.helpers';

test.describe('Authentication — Session / GET me', () => {
  test(
    `STC-AUTH-021/F Session bootstrap via GET me ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-021/F',
        module: 'Authentication — Me',
        priority: 'P0',
        testType: 'Frontend integration (positive)',
        endpoint: 'GET /api/v1/kine/me',
      }),
    },
    async ({ page }) => {
      test.skip(
        test.info().project.name !== 'chromium-auth',
        'Requires storageState from global-setup'
      );

      const meRequest = page
        .waitForRequest((req) => req.method() === 'GET' && isMeRequest(req.url()))
        .catch(() => null);

      await page.goto(ROUTES.DASHBOARD);
      const request = await meRequest;

      if (request) {
        expect(request.headers()['authorization']?.toLowerCase()).toMatch(/^bearer /);
      }

      await expect(page).not.toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));
    }
  );

  test(
    `STC-AUTH-022/F Invalid token clears session ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-022/F',
        module: 'Authentication — Me',
        priority: 'P0',
        testType: 'Frontend integration (negative)',
        endpoint: 'GET /api/v1/kine/me',
      }),
    },
    async ({ page }) => {
      test.use({ storageState: { cookies: [], origins: [] } });
      await clearAuthStorage(page);

      await page.goto(ROUTES.LOGIN);
      await setAccessToken(page, 'invalid.jwt.token.value');

      const meResponse = page.waitForResponse(
        (res) => res.request().method() === 'GET' && isMeRequest(res.url())
      );

      await page.goto(ROUTES.DASHBOARD);
      const response = await meResponse;
      expect([401, 403]).toContain(response.status());

      expect(await readAccessToken(page)).toBeFalsy();
      await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}`));
    }
  );

  test(
    `STC-AUTH-023/F getMe skip after login ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-023/F',
        module: 'Authentication — Me',
        priority: 'P2',
        testType: 'Frontend integration (edge)',
        endpoint: 'GET /api/v1/kine/me',
      }),
    },
    async ({ page }) => {
      test.use({ storageState: { cookies: [], origins: [] } });

      let meCalls = 0;
      page.on('request', (req) => {
        if (req.method() === 'GET' && isMeRequest(req.url())) {
          meCalls += 1;
        }
      });

      await loginViaUi(page, kineCredentials.email, kineCredentials.password);
      await page.waitForTimeout(1500);

      expect(meCalls).toBeLessThanOrEqual(1);
    }
  );

  test(
    `STC-AUTH-024/F GET me 5xx graceful degradation ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-024/F',
        module: 'Authentication — Me',
        priority: 'P1',
        testType: 'Frontend integration (negative)',
        endpoint: 'GET /api/v1/kine/me',
      }),
    },
    async ({ page }) => {
      test.use({ storageState: { cookies: [], origins: [] } });
      await clearAuthStorage(page);

      const tokens = await loginViaUi(page, kineCredentials.email, kineCredentials.password);
      expect(tokens?.accessToken).toBeTruthy();

      await page.route('**/api/v1/kine/me**', (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Server error' }),
        })
      );

      await page.reload();
      await expect(page.locator('.animate-spin').first()).toBeHidden({ timeout: 15_000 });

      expect(await readAccessToken(page)).toBeFalsy();
      await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}`));
    }
  );
});
