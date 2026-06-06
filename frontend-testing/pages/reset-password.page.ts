import type { Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { waitForAuthPageReady } from '../utils/page-ready.helpers';
import { BasePage } from './base.page';

export class ResetPasswordPage extends BasePage {
  readonly passwordInput;
  readonly confirmPasswordInput;
  readonly submitButton;

  constructor(page: Page) {
    super(page);
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.submitButton = page.locator('form button[type="submit"]');
  }

  async openWithParams(email: string, token: string): Promise<void> {
    await this.goto(
      `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
    );
    await waitForAuthPageReady(this.page);
  }

  async openWithoutParams(): Promise<void> {
    await this.goto(ROUTES.RESET_PASSWORD);
    await waitForAuthPageReady(this.page).catch(() => undefined);
  }

  async resetPassword(password: string, confirmPassword: string): Promise<void> {
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
  }
}
