import type { Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { BasePage } from './base.page';

export class AppShellPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async waitForSidebarReady(): Promise<void> {
    await this.page.locator('aside nav').waitFor({ state: 'visible', timeout: 25_000 });
  }

  private sidebarFooter() {
    return this.page.locator('aside').filter({ has: this.page.locator('nav') });
  }

  async openProfileMenu(): Promise<void> {
    const footer = this.sidebarFooter();
    const profileTrigger = footer.locator('.cursor-pointer').last();
    const namedProfile = footer.locator('p').filter({ hasText: /\S/ }).last();

    if (await profileTrigger.isVisible().catch(() => false)) {
      await profileTrigger.click();
    } else {
      await namedProfile.click();
    }

    await this.page.getByRole('menu').waitFor({ state: 'visible', timeout: 10_000 });
  }

  private async confirmLogoutDialogIfPresent(): Promise<void> {
    const prompt = this.page.getByText(/vouloir vous .*connecter/i);
    const hasDialog = await prompt.isVisible({ timeout: 5_000 }).catch(() => false);
    if (!hasDialog) {
      return;
    }

    await this.page
      .getByRole('button', { name: /connexion/i })
      .filter({ hasNotText: /rester|non/i })
      .click();
  }

  async logoutFromSidebar(): Promise<void> {
    await this.waitForSidebarReady();
    await this.openProfileMenu();

    await this.page.getByRole('menuitem', { name: /connexion/i }).click();
    await this.confirmLogoutDialogIfPresent();

    await this.page.waitForFunction(
      (key) => !localStorage.getItem(key),
      STORAGE_KEYS.ACCESS_TOKEN,
      { timeout: 20_000 }
    );
    await this.page.waitForURL((url) => url.pathname.includes(ROUTES.LOGIN), { timeout: 20_000 });
  }
}
