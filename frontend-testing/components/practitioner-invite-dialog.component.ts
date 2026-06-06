import type { Locator, Page } from '@playwright/test';
import type { TargetProfileType } from '../utils/types';

/**
 * "Ajouter un praticien" dialog on /practitioners (Kine admin only).
 * Drives POST /api/v1/kine/auth/invitations.
 */
export class PractitionerInviteDialog {
  readonly page: Page;
  readonly openTrigger: Locator;
  readonly dialog: Locator;
  readonly firstNameInput: Locator;
  readonly emailInput: Locator;
  readonly profileTypeTrigger: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openTrigger = page.getByRole('button', { name: /ajouter un praticien/i });
    this.dialog = page.getByRole('dialog');
    this.firstNameInput = this.dialog.locator('#firstName');
    this.emailInput = this.dialog.locator('#email');
    this.profileTypeTrigger = this.dialog.getByRole('combobox');
    this.confirmButton = this.dialog.getByRole('button', { name: /ajouter praticien/i });
    this.cancelButton = this.dialog.getByRole('button', { name: /annuler/i });
  }

  async open(): Promise<void> {
    await this.openTrigger.click();
    await this.dialog.waitFor({ state: 'visible' });
  }

  async selectProfileType(type: TargetProfileType): Promise<void> {
    await this.profileTypeTrigger.click();
    const label =
      type === 'ASSISTANT'
        ? /assistant/i
        : /kin[ée]sith[ée]rapeute dans un cabinet de groupe/i;
    await this.page.getByRole('option', { name: label }).click();
  }

  async fill(firstName: string, email: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.emailInput.fill(email);
  }

  async submit(): Promise<void> {
    await this.confirmButton.click();
  }

  /** Field-level zod error rendered as <p class="text-red-500">. */
  fieldError(message: string | RegExp): Locator {
    return this.dialog.locator('p.text-red-500', { hasText: message });
  }
}
