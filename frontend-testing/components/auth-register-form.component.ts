import type { Locator, Page } from '@playwright/test';

/**
 * Shared form driver for every screen wrapped in <AuthRegisterLayout>:
 *  - /invitation/register/practitioner   (POST /accept-invitation)
 *  - /invitation/register/assistant
 *  - /invitation/complete-profile/assistant   (POST /invitations/attach)
 *  - /invitation/complete-profile/practitioner
 *  - /create-profile                     (POST /api/v1/kine/profiles)
 *
 * The submit button lives in the layout (type="submit" form="register-form")
 * and reads "Chargement..." while the mutation is in flight.
 */
export class AuthRegisterForm {
  readonly page: Page;
  readonly form: Locator;
  readonly submitButton: Locator;
  readonly cguCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator('#register-form');
    this.submitButton = page.locator('button[type="submit"][form="register-form"]');
    this.cguCheckbox = page
      .locator('label')
      .filter({ hasText: /accepter conditions/i })
      .locator('input[type="checkbox"]');
  }

  async waitForReady(): Promise<void> {
    await this.submitButton.waitFor({ state: 'visible' });
  }

  field(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  /** Fills only the ids present in `values`; skips read-only/prefilled fields. */
  async fill(values: Record<string, string>): Promise<void> {
    for (const [id, value] of Object.entries(values)) {
      const input = this.field(id);
      if (await input.isEditable().catch(() => false)) {
        await input.fill(value);
      }
    }
  }

  async acceptCgu(): Promise<void> {
    if (!(await this.cguCheckbox.isChecked())) {
      await this.cguCheckbox.check();
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  fieldError(message: string | RegExp): Locator {
    return this.form.locator('p.text-red-500', { hasText: message });
  }

  async readonlyValue(id: string): Promise<string> {
    return this.field(id).inputValue();
  }
}
