/**
 * Auth React-Query hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loginWithOAuth, fetchCurrentUser, logout } from '../api/auth.service';
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
