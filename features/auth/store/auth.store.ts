/**
 * Auth Zustand store — persists onboarding flag manually via expo-secure-store.
 * We avoid zustand/middleware persist because its ESM build uses import.meta
 * which Metro does not support.
 */

import { create } from 'zustand';
import { storage } from '@/shared/lib/storage';
import type { UserProfile } from '@/shared/types/api';

const ONBOARDED_KEY = 'nutricia-has-onboarded';

type AuthState = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  /** True once the persisted value has been read from disk. */
  _hydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  clearAuth: () => void;
  completeOnboarding: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  hasOnboarded: false,
  _hydrated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
  completeOnboarding: () => {
    storage.setItem(ONBOARDED_KEY, '1').catch(() => {});
    set({ hasOnboarded: true });
  },
}));

/** Call once at app startup to rehydrate persisted flags. */
export async function hydrateAuthStore() {
  try {
    const value = await storage.getItem(ONBOARDED_KEY);
    useAuthStore.setState({ hasOnboarded: value === '1', _hydrated: true });
  } catch {
    useAuthStore.setState({ _hydrated: true });
  }
}
