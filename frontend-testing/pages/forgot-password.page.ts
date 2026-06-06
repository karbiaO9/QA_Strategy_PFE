import type { Page, Response } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { waitForAuthPageReady } from '../utils/page-ready.helpers';
import { waitForForgotPasswordPost } from '../utils/forgot-password.helpers';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  readonly emailInput;
  readonly submitButton;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.submitButton = page.locator('form button[type="submit"]');
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.FORGOT_PASSWORD);
    await waitForAuthPageReady(this.page);
  }

  async submitEmail(email: string): Promise<Response> {
    const responsePromise = waitForForgotPasswordPost(this.page);
    await this.emailInput.fill(email);
    await this.submitButton.click();
    return responsePromise;
  }
}
