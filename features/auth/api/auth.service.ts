/**
 * Auth API service.
 */

import { storage } from '@/shared/lib/storage';
import { apiClient } from '@/shared/api/client';
import type { TokenResponse, UserProfile } from '@/shared/types/api';
import { useAuthStore } from '../store/auth.store';

// ── Email / Password ────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<TokenResponse> {
  const data = await apiClient.post<TokenResponse>(
    '/auth/register',
    { email, password, name },
    { skipAuth: true },
  );

  await storage.setItem('auth_token', data.access_token);
  if (data.refresh_token) {
    await storage.setItem('refresh_token', data.refresh_token);
  }
  useAuthStore.getState().setUser(data.user);
  return data;
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const data = await apiClient.post<TokenResponse>(
    '/auth/login',
    { email, password },
    { skipAuth: true },
  );

  await storage.setItem('auth_token', data.access_token);
  if (data.refresh_token) {
    await storage.setItem('refresh_token', data.refresh_token);
  }
  useAuthStore.getState().setUser(data.user);
  return data;
}

// ── OAuth ───────────────────────────────────

export async function loginWithOAuth(
  provider: 'google' | 'apple',
  token: string,
): Promise<TokenResponse> {
  const data = await apiClient.post<TokenResponse>(
    '/auth/oauth',
    { provider, token },
    { skipAuth: true },
  );

  await storage.setItem('auth_token', data.access_token);
  if (data.refresh_token) {
    await storage.setItem('refresh_token', data.refresh_token);
  }
  useAuthStore.getState().setUser(data.user);
  return data;
}

// ── Current User / Logout ───────────────────

export async function fetchCurrentUser(): Promise<UserProfile> {
  return apiClient.get<UserProfile>('/auth/me');
}

export async function logout(): Promise<void> {
  await storage.deleteItem('auth_token');
  await storage.deleteItem('refresh_token');
}
