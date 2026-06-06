import type { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig): Promise<void> {
  // Reserved for cleanup: test tenants, mail capture, shared fixtures.
  console.log('[global-teardown] Playwright run complete.');
}

export default globalTeardown;
