import type { Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { BasePage } from './base.page';

export class SelectProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.SELECT_PROFILE);
  }
}
