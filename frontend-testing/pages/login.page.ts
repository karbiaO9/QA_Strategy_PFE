import type { Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { LoginFormComponent } from '../components/login-form.component';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly form: LoginFormComponent;

  constructor(page: Page) {
    super(page);
    this.form = new LoginFormComponent(page);
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.LOGIN);
    await this.form.waitForReady();
  }

  async login(emailOrPhone: string, password: string): Promise<void> {
    await this.form.fillCredentials(emailOrPhone, password);
    await this.form.submit();
  }

  async expectOnLoginPage(): Promise<void> {
    await this.page.waitForURL(new RegExp(`${ROUTES.LOGIN}$`));
  }
}
