import type { Locator, Page } from '@playwright/test';
import { waitForAuthPageReady } from '../utils/page-ready.helpers';

export class LoginFormComponent {
  readonly page: Page;
  readonly form: Locator;
  readonly emailOrPhoneInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly rememberMeCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('form').filter({ has: page.locator('#emailOrPhone') });
    this.emailOrPhoneInput = page.locator('#emailOrPhone');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.getByRole('button', { name: /se connecter|connexion en cours/i });
    this.rememberMeCheckbox = page.locator('input[type="checkbox"]').first();
  }

  async waitForReady(): Promise<void> {
    await waitForAuthPageReady(this.page);
  }

  async fillCredentials(emailOrPhone: string, password: string): Promise<void> {
    await this.emailOrPhoneInput.fill(emailOrPhone);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.waitForReady();
    await this.submitButton.click();
  }

  async isSubmitDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled();
  }
}
