import type { Page } from '@playwright/test';
import { AuthRegisterForm } from '../components/auth-register-form.component';

/** Wrapper for invitation register / complete-profile forms. */
export class InvitationFormPage {
  readonly form: AuthRegisterForm;

  constructor(page: Page) {
    this.form = new AuthRegisterForm(page);
  }
}
