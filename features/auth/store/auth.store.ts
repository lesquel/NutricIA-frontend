/**
 * Auth Zustand store — persists onboarding flag manually via expo-secure-store.
 * We avoid zustand/middleware persist because its ESM build uses import.meta
 * which Metro does not support.
 */

import { create } from 'zustand';
import { storage } from '@/shared/lib/storage';
import type { UserProfile } from '@/shared/types/api';

const ONBOARDED_KEY = 'nutricia-has-onboarded';
const CONFIGURED_KEY = 'nutricia-has-configured-profile';

type AuthState = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  /** True once the user has completed the post-signup configuration flow. */
  hasConfiguredProfile: boolean;
  /** True once the persisted value has been read from disk. */
  _hydrated: boolean;
  setUser: (user: UserProfile | null) => void;
  clearAuth: () => void;
  completeOnboarding: () => void;
  completeProfileConfig: () => void;
  resetProfileConfig: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  hasOnboarded: false,
  hasConfiguredProfile: false,
  _hydrated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearAuth: () => {
    storage.deleteItem('auth_token').catch(() => {});
    storage.deleteItem('refresh_token').catch(() => {});
    set({ user: null, isAuthenticated: false });
  },
  completeOnboarding: () => {
    storage.setItem(ONBOARDED_KEY, '1').catch(() => {});
    set({ hasOnboarded: true });
  },
  completeProfileConfig: () => {
    storage.setItem(CONFIGURED_KEY, '1').catch(() => {});
    set({ hasConfiguredProfile: true });
  },
  resetProfileConfig: () => {
    storage.deleteItem(CONFIGURED_KEY).catch(() => {});
    set({ hasConfiguredProfile: false });
  },
}));

/** Call once at app startup to rehydrate persisted flags. */
export async function hydrateAuthStore() {
  try {
    const [onboarded, configured] = await Promise.all([
      storage.getItem(ONBOARDED_KEY),
      storage.getItem(CONFIGURED_KEY),
    ]);
    const hasOnboarded = onboarded === '1';
    // Existing users (hasOnboarded=true from a prior version) are treated as
    // already configured so we don't block them with a new onboarding step
    // on upgrade. Only genuinely new users see the profile config flow.
    const hasConfiguredProfile = configured === '1' || hasOnboarded;
    useAuthStore.setState({
      hasOnboarded,
      hasConfiguredProfile,
      _hydrated: true,
    });
  } catch {
    useAuthStore.setState({ _hydrated: true });
  }
}
