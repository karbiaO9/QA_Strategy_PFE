import { API_ENDPOINTS } from '../constants/api.constants';
import type { AuthTokens } from './types';

interface LoginPayload {
  email: string;
  password: string;
}

export interface KineProfileSummary {
  id: string;
  isActive?: boolean;
  profileType?: string;
  cabinetName?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: unknown;
  profiles?: KineProfileSummary[];
  lastProfileId?: string;
}

export async function loginKine(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Kine login failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as LoginResponse;

  if (!data.accessToken || !data.refreshToken) {
    throw new Error('Login response missing accessToken or refreshToken');
  }

  return data;
}

export async function authenticateKineViaApi(payload: LoginPayload): Promise<AuthTokens> {
  const data = await loginKine(payload);
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}
