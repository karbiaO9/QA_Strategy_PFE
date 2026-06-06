import type { Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectAuthenticated(): Promise<void> {
    await this.page.waitForURL((url) => !url.pathname.includes(ROUTES.LOGIN));
  }

  async isOnDashboard(): Promise<boolean> {
    const url = this.page.url();
    return url.endsWith(ROUTES.DASHBOARD) || !url.includes(ROUTES.LOGIN);
  }
}
