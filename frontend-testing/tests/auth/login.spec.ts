import {
  test,
  expect,
  readAccessToken,
  stcAnnotations,
  acceptNextDialog,
  clearAuthStorage,
} from '../../fixtures';
import { kineCredentials } from '../../data/auth/kine.credentials';
import { TEST_TAGS } from '../../constants/test-tags.constants';
import { API_ENDPOINTS } from '../../constants/api.constants';
import { ROUTES } from '../../constants/routes.constants';
import { isLoginRequest } from '../../utils/network.helpers';
import { waitForLoginPost, waitForLoginRequest } from '../../utils/login-network.helpers';

const LOGIN_ROUTE = '**/api/v1/kine/auth/login';

test.describe('Authentication — Login', () => {
  test.describe.configure({ project: 'chromium-guest' });
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await clearAuthStorage(page);
  });

  test(
    `STC-AUTH-001/F Successful login ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-001/F',
        module: 'Authentication — Login',
        priority: 'P0',
        testType: 'Frontend integration (positive)',
        endpoint: 'POST https://identity.physio.agregatech.com/api/v1/kine/auth/login',
      }),
    },
    async ({ page, loginPage, dashboardPage }) => {
      // Step 1: Open /login
      const loginRequest = waitForLoginRequest(page);
      await loginPage.open();

      // Step 2–3: Enter valid credentials and submit
      await loginPage.form.fillCredentials(kineCredentials.email, kineCredentials.password);
      await loginPage.form.submit();

      // Step 4–5: POST login with expected body; successful response
      const request = await loginRequest;
      expect(request.postDataJSON()).toMatchObject({
        email: kineCredentials.email,
        password: kineCredentials.password,
      });
      const response = await waitForLoginPost(page);
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.accessToken).toBeTruthy();

      // Step 6–7: Redirect off /login; pc_access_token set
      await dashboardPage.expectAuthenticated();
      const token = await readAccessToken(page);
      expect(token).toBe(body.accessToken);

      // Step 8: Protected route stays authenticated
      await page.goto(ROUTES.DASHBOARD);
      await expect(page).not.toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));
    }
  );

  test(
    `STC-AUTH-002/F Login failure ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-002/F',
        module: 'Authentication — Login',
        priority: 'P0',
        testType: 'Frontend integration (negative)',
        endpoint: 'POST /api/v1/kine/auth/login',
      }),
    },
    async ({ page, loginPage }) => {
      acceptNextDialog(page);

      // Step 1: Open /login
      const loginRequest = waitForLoginRequest(page);
      await loginPage.open();

      // Step 2–3: Valid-format email, wrong password, submit
      await loginPage.form.fillCredentials(kineCredentials.email, kineCredentials.invalidPassword);
      await loginPage.form.submit();

      // Step 4–5: POST sent; backend rejects
      const response = await waitForLoginPost(page);
      await loginRequest;
      expect(response.ok()).toBeFalsy();

      // Step 6–7: No token; remain on login
      await loginPage.expectOnLoginPage();
      expect(await readAccessToken(page)).toBeFalsy();

      // Step 8: Protected URL redirects to login
      await page.goto(ROUTES.DASHBOARD);
      await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}`));
    }
  );

  test(
    `STC-AUTH-003/F Client validation blocks API ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-003/F',
        module: 'Authentication — Login',
        priority: 'P1',
        testType: 'Frontend integration (validation)',
        endpoint: 'POST /api/v1/kine/auth/login (must not fire when invalid)',
      }),
    },
    async ({ page, loginPage }) => {
      let loginCalls = 0;
      page.on('request', (req) => {
        if (req.method() === 'POST' && isLoginRequest(req.url())) {
          loginCalls += 1;
        }
      });

      await loginPage.open();

      // Step 2: Empty submit — required messages, no API
      await loginPage.form.submit();
      await expect(page.getByText(/obligatoire/i).first()).toBeVisible();
      expect(loginCalls).toBe(0);

      // Step 3: Invalid email/phone — no API
      await loginPage.form.fillCredentials('not-valid', '123456');
      await loginPage.form.submit();
      await expect(page.getByText(/email ou un numéro de téléphone valide/i)).toBeVisible();
      expect(loginCalls).toBe(0);

      // Step 4: Valid email, password < 6 — no API
      await loginPage.form.fillCredentials(kineCredentials.email, '12345');
      await loginPage.form.submit();
      await expect(page.getByText(/au moins 6 caractères/i)).toBeVisible();
      expect(loginCalls).toBe(0);

      // Step 5: Valid fields — one login request
      await loginPage.form.fillCredentials(kineCredentials.email, kineCredentials.password);
      await loginPage.form.submit();
      await waitForLoginRequest(page);
      expect(loginCalls).toBe(1);
    }
  );

  test(
    `STC-AUTH-004/F Login loading and 5xx resilience ${TEST_TAGS.INTEGRATION} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-AUTH-004/F',
        module: 'Authentication — Login',
        priority: 'P1',
        testType: 'Frontend integration (UX + error handling)',
        endpoint: 'POST /api/v1/kine/auth/login',
      }),
    },
    async ({ page, loginPage }) => {
      let callCount = 0;

      // Step 1: Valid credentials on /login
      acceptNextDialog(page);
      await loginPage.open();
      await loginPage.form.fillCredentials(kineCredentials.email, kineCredentials.password);

      // Steps 2–4: Slow 5xx then re-enabled inputs
      await page.route(LOGIN_ROUTE, async (route) => {
        callCount += 1;
        await new Promise((r) => setTimeout(r, 600));
        if (callCount === 1) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Erreur serveur' }),
          });
          return;
        }
        await route.continue();
      });

      const firstSubmit = loginPage.form.submit();
      await expect(loginPage.form.emailOrPhoneInput).toBeDisabled();
      await expect(loginPage.form.passwordInput).toBeDisabled();
      await firstSubmit;
      await expect(loginPage.form.emailOrPhoneInput).toBeEnabled();

      // Step 6: Retry succeeds
      acceptNextDialog(page);
      const successResponse = waitForLoginPost(page);
      await loginPage.form.submit();
      const response = await successResponse;
      expect(response.ok()).toBeTruthy();
      await expect(page).not.toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));
    }
  );
});
