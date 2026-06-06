import type { Page } from '@playwright/test';
import { ROUTES } from '../constants/routes.constants';
import { PractitionerInviteDialog } from '../components/practitioner-invite-dialog.component';
import { BasePage } from './base.page';

/**
 * /practitioners — cabinet-admin "kinés" management screen.
 * Hosts the "Ajouter un praticien" dialog that creates invitations.
 */
export class PractitionersPage extends BasePage {
  readonly inviteDialog: PractitionerInviteDialog;

  constructor(page: Page) {
    super(page);
    this.inviteDialog = new PractitionerInviteDialog(page);
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.PRACTITIONERS);
    await this.inviteDialog.openTrigger.waitFor({ state: 'visible', timeout: 25_000 });
  }

  async isOnPractitioners(): Promise<boolean> {
    return this.page.url().includes(ROUTES.PRACTITIONERS);
  }
}
