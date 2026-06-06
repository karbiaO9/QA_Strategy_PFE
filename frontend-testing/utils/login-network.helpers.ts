import type { Page, Response } from '@playwright/test';
import { isLoginRequest } from './network.helpers';

export function waitForLoginPost(page: Page): Promise<Response> {
  return page.waitForResponse(
    (res) => res.request().method() === 'POST' && isLoginRequest(res.url())
  );
}

export function waitForLoginRequest(page: Page) {
  return page.waitForRequest(
    (req) => req.method() === 'POST' && isLoginRequest(req.url())
  );
}
