/**
 * Auth Zustand store — persists onboarding flag via AsyncStorage.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '@/shared/types/api';

type AuthState = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  setUser: (user: UserProfile | null) => void;
  clearAuth: () => void;
  completeOnboarding: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasOnboarded: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
      completeOnboarding: () => set({ hasOnboarded: true }),
    }),
    {
      name: 'nutricia-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hasOnboarded: state.hasOnboarded }),
    },
  ),
);
