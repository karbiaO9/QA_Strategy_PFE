import { expect, type Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { waitForAuthPageReady } from '../utils/page-ready.helpers';
import { BasePage } from './base.page';

export class VerifyCodePage extends BasePage {
  readonly form;
  readonly digitInputs;
  readonly submitButton;
  readonly resendButton;
  readonly errorMessage;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('form').filter({ has: page.locator('input[inputmode="numeric"]') });
    this.digitInputs = page.locator('input[inputmode="numeric"]');
    this.submitButton = this.form.locator('button[type="submit"]');
    this.resendButton = this.form.getByRole('button', { name: /Renvoyer code|Envoi\.\.\./i });
    this.errorMessage = page.locator('p.text-red-500');
  }

  async openWithEmail(email: string): Promise<void> {
    await this.goto(`${ROUTES.VERIFY_CODE}?email=${encodeURIComponent(email)}`);
    await waitForAuthPageReady(this.page);
  }

  async enterCode(code: string): Promise<void> {
    const digits = code.replace(/\D/g, '').slice(0, 6);
    for (let i = 0; i < digits.length; i += 1) {
      await this.digitInputs.nth(i).fill(digits[i]);
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async resendCode(): Promise<void> {
    await this.resendButton.click();
  }

  async expectAllDigitsEmpty(): Promise<void> {
    const count = await this.digitInputs.count();
    for (let i = 0; i < count; i += 1) {
      await expect(this.digitInputs.nth(i)).toHaveValue('');
    }
  }
}
