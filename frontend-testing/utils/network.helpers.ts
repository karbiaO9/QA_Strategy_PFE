import type { Page, Route } from '@playwright/test';

export function isLoginRequest(url: string): boolean {
  return url.includes('/auth/login') && !url.includes('refresh');
}

export function isLogoutRequest(url: string): boolean {
  return url.includes('/auth/logout');
}

export function isForgotPasswordRequest(url: string): boolean {
  return url.includes('/auth/forgot-password');
}

export function isVerifyCodeRequest(url: string): boolean {
  return url.includes('/auth/verify-code');
}

export function isResetPasswordRequest(url: string): boolean {
  return url.includes('/auth/reset-password');
}

export function isMeRequest(url: string): boolean {
  return /\/api\/v1\/kine\/me(\?|$)/.test(url);
}

export function isRefreshRequest(url: string): boolean {
  return url.includes('/auth/refresh-token');
}

/** POST /api/v1/kine/auth/invitations — create invitation (excludes /preview and /attach) */
export function isCreateInvitationRequest(url: string): boolean {
  return /\/auth\/invitations(\?|$)/.test(url);
}

export function isPreviewInvitationRequest(url: string): boolean {
  return url.includes('/auth/invitations/preview');
}

export function isAttachInvitationRequest(url: string): boolean {
  return url.includes('/auth/invitations/attach');
}

export function isAcceptInvitationRequest(url: string): boolean {
  return url.includes('/auth/accept-invitation');
}

export function isSelectProfileRequest(url: string): boolean {
  return url.includes('/auth/select-profile');
}

/** POST /api/v1/kine/profiles — add profile (not the auth-scoped paths) */
export function isCreateProfileRequest(url: string): boolean {
  return /\/api\/v1\/kine\/profiles(\?|$)/.test(url);
}

export async function countMatchingRequests(
  page: Page,
  predicate: (url: string, method: string) => boolean
): Promise<{ count: number; stop: () => void }> {
  let count = 0;
  const handler = (request: { url: () => string; method: () => string }) => {
    if (predicate(request.url(), request.method())) {
      count += 1;
    }
  };
  page.on('request', handler);
  return {
    count: 0,
    stop: () => page.off('request', handler),
    getCount: () => count,
  } as { count: number; stop: () => void; getCount: () => number };
}

export async function mockJsonRoute(
  page: Page,
  urlPattern: string | RegExp,
  handler: (route: Route, callIndex: number) => Promise<void> | void
): Promise<() => Promise<void>> {
  let callIndex = 0;
  await page.route(urlPattern, async (route) => {
    callIndex += 1;
    await handler(route, callIndex);
  });
  return async () => page.unroute(urlPattern);
}

export function requestHasBearer(route: Route): boolean {
  const auth = route.request().headers()['authorization'] ?? '';
  return auth.toLowerCase().startsWith('bearer ');
}
