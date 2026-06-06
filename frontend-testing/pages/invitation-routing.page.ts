import type { Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { BasePage } from './base.page';

/**
 * Public deep-link /invitation/:id — preview then route to register/attach/login.
 */
export class InvitationRoutingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(invitationId: string): Promise<void> {
    await this.goto(ROUTES.INVITATION(invitationId));
  }

  loadingMessage() {
    return this.page.getByText(/vérification de votre invitation/i);
  }

  invalidInvitationMessage() {
    return this.page.getByText(/invitation invalide|expirée/i);
  }
}
