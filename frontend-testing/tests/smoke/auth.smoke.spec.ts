import { test, expect, stcAnnotations } from '../../fixtures';
import { ROUTES } from '../../constants/routes.constants';
import { TEST_TAGS } from '../../constants/test-tags.constants';

test.describe('Smoke — Authentication routes', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    `Smoke — login page loads ${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-SMOKE-AUTH-001',
        module: 'Authentication — Smoke',
        priority: 'P0',
        testType: 'Smoke',
      }),
    },
    async ({ page, loginPage }) => {
      await loginPage.open();
      await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}`));
      await expect(loginPage.form.emailOrPhoneInput).toBeVisible();
      await expect(loginPage.form.passwordInput).toBeVisible();
    }
  );

  test(
    `Smoke — forgot-password route loads ${TEST_TAGS.SMOKE} ${TEST_TAGS.AUTH}`,
    {
      annotation: stcAnnotations({
        stcId: 'STC-SMOKE-AUTH-002',
        module: 'Authentication — Smoke',
        priority: 'P1',
        testType: 'Smoke',
      }),
    },
    async ({ page }) => {
      await page.goto(ROUTES.FORGOT_PASSWORD);
      await expect(page).toHaveURL(new RegExp(`${ROUTES.FORGOT_PASSWORD}`));
    }
  );
});
