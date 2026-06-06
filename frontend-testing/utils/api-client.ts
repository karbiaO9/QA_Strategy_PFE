import { request, type APIRequestContext } from '@playwright/test';
import { API_ENDPOINTS } from '../constants/api.constants';

export async function createApiContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: API_ENDPOINTS.BASE_URL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

export async function postKineLogin(
  api: APIRequestContext,
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await api.post(API_ENDPOINTS.LOGIN.replace(API_ENDPOINTS.BASE_URL, ''), {
    data: { email, password },
  });

  if (!response.ok()) {
    throw new Error(`Login API failed: ${response.status()} ${await response.text()}`);
  }

  const body = (await response.json()) as { accessToken: string; refreshToken: string };
  return body;
}
