import {
  test,
  expect,
  stcAnnotations,
  readAccessToken,
  loginViaUi,
  triggerSidebarLogout,
  triggerServerLogoutApi,
  clearAuthStorage,
} from '../../fixtures';
import { kineCredentials } from '../../data/auth/kine.credentials';
import { TEST_TAGS } from '../../constants/test-tags.constants';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { ROUTES } from '../../constants/routes.constants';
import { isLogoutRequest } from '../../utils/network.helpers';

test.describe('Authentication - Logout', () => {
  test.describe.configure({ project: 'chromium-guest', mode: 'serial' });
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test(
    `STC-AUTH-005/F Server logout API clears session ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-005/F',
        module: 'Authentication — Logout',
        priority: 'P0',
        testType: 'Frontend integration (positive)',
        endpoint: 'POST /api/v1/kine/auth/logout',
      }),
    },
    async ({ page }) => {
      test.info().annotations.push({
        type: 'note',
        description:
          'Sidebar uses client-only logoutUser(); this test exercises POST /logout as useLogoutMutation would.',
      });

      const tokens = await loginViaUi(page, kineCredentials.email, kineCredentials.password);
      expect(tokens?.accessToken).toBeTruthy();

      await triggerServerLogoutApi(page);
      expect(await readAccessToken(page)).toBeFalsy();

      await Promise.all([
        page.waitForURL(new RegExp(`${ROUTES.LOGIN}`)),
        page.goto(ROUTES.DASHBOARD),
      ]);
    }
  );

  test(
    `STC-AUTH-006/F Logout API failure handling ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-006/F',
        module: 'Authentication — Logout',
        priority: 'P1',
        testType: 'Frontend integration (negative)',
        endpoint: 'POST /api/v1/kine/auth/logout',
      }),
    },
    async ({ page }) => {
      const tokens = await loginViaUi(page, kineCredentials.email, kineCredentials.password);
      expect(tokens?.accessToken).toBeTruthy();

      await page.route('**/api/v1/kine/auth/logout', (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Logout failed' }),
        })
      );

      await page.evaluate(async (logoutUrl) => {
        const token = localStorage.getItem('pc_access_token');
        if (!token) return;
        await fetch(logoutUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }, API_ENDPOINTS.LOGOUT);

      const tokenAfterFailedLogout = await readAccessToken(page);
      expect(tokenAfterFailedLogout).toBeTruthy();
    }
  );

  test(
    `STC-AUTH-007/F Sidebar logout gap analysis ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-007/F',
        module: 'Authentication — Logout',
        priority: 'P2',
        testType: 'Frontend integration (observability)',
        endpoint: 'POST /api/v1/kine/auth/logout (expected when fully integrated)',
      }),
    },
    async ({ page, appShellPage }) => {
      const tokens = await loginViaUi(page, kineCredentials.email, kineCredentials.password);
      expect(tokens?.accessToken).toBeTruthy();
      await appShellPage.waitForSidebarReady();

      let logoutApiCalls = 0;
      page.on('request', (req) => {
        if (req.method() === 'POST' && isLogoutRequest(req.url())) {
          logoutApiCalls += 1;
        }
      });

      await appShellPage.logoutFromSidebar();

      expect(logoutApiCalls).toBe(0);
      expect(await readAccessToken(page)).toBeFalsy();
    }
  );

  test(
    `STC-AUTH-008/F Post-logout navigation ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-008/F',
        module: 'Authentication — Logout',
        priority: 'P1',
        testType: 'Frontend integration (navigation)',
        endpoint: 'N/A (client sidebar logout)',
      }),
    },
    async ({ page, appShellPage }) => {
      const tokens = await loginViaUi(page, kineCredentials.email, kineCredentials.password);
      expect(tokens?.accessToken).toBeTruthy();
      await appShellPage.waitForSidebarReady();

      await page.goto(ROUTES.CALENDAR);
      await expect(page).not.toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));

      await triggerSidebarLogout(page);

      await page.goto(ROUTES.CALENDAR);
      await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}`));

      await page.goto(ROUTES.LOGIN);
      await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));
    }
  );
});
