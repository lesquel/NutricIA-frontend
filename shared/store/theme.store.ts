/**
 * Theme Zustand store — allows user to override system theme.
 * Preference persisted via expo-secure-store (can be swapped to AsyncStorage).
 */

import { create } from 'zustand';
import { ColorSchemeName } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeStore = {
  /** User preference: system | light | dark */
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  preference: 'system',
  setPreference: (preference) => set({ preference }),
}));

/**
 * Resolve the effective color scheme from user preference + system.
 */
export function resolveColorScheme(
  preference: ThemePreference,
  systemScheme: ColorSchemeName,
): 'light' | 'dark' {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return preference;
}
