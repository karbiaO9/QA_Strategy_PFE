import type { Locator, Page } from '@playwright/test';

/** Profile switcher control in the authenticated app shell. */
export class ProfileSwitcherPage {
  readonly page: Page;
  readonly trigger: Locator;

  constructor(page: Page) {
    this.page = page;
    this.trigger = page.getByRole('button', { name: /profil|compte/i }).first();
  }

  async open(): Promise<void> {
    await this.trigger.click().catch(() => undefined);
  }
}
