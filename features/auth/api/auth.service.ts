/**
 * Auth API service.
 */

import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@/shared/api/client';
import type { TokenResponse, UserProfile } from '@/shared/types/api';

export async function loginWithOAuth(
  provider: 'google' | 'apple',
  token: string,
): Promise<TokenResponse> {
  const data = await apiClient.post<TokenResponse>(
    '/auth/oauth',
    { provider, token },
    { skipAuth: true },
  );

  // Persist JWT
  await SecureStore.setItemAsync('auth_token', data.access_token);
  return data;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  return apiClient.get<UserProfile>('/auth/me');
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('auth_token');
}
