/**
 * Auth React-Query hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  loginWithOAuth,
  loginWithEmail,
  registerWithEmail,
  fetchCurrentUser,
  logout,
} from '../api/auth.service';
import { useAuthStore } from '../store/auth.store';

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const user = await fetchCurrentUser();
      setUser(user);
      return user;
    },
    retry: false,
  });
}

// ── Email / Password ────────────────────────

export function useRegister() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      registerWithEmail(email, password, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useEmailLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginWithEmail(email, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

// ── OAuth ───────────────────────────────────

export function useOAuthLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ provider, token }: { provider: 'google' | 'apple'; token: string }) =>
      loginWithOAuth(provider, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

// ── Logout ──────────────────────────────────

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      qc.clear();
    },
  });
}
