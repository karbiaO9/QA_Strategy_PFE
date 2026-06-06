import type { Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { AuthRegisterForm } from '../components/auth-register-form.component';
import { BasePage } from './base.page';

export class CreateProfilePage extends BasePage {
  readonly form: AuthRegisterForm;

  constructor(page: Page) {
    super(page);
    this.form = new AuthRegisterForm(page);
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.CREATE_PROFILE);
  }
}
