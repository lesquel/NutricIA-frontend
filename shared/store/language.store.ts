/**
 * Language Zustand store — persists user's language preference.
 * Mirrors the auth/theme store pattern (manual hydrate to avoid Metro ESM issues).
 */

import { create } from 'zustand';

import i18n, {
  SUPPORTED_LANGUAGES,
  resolveDeviceLanguage,
  type SupportedLanguage,
} from '@/shared/i18n';
import { storage } from '@/shared/lib/storage';

const LANGUAGE_KEY = 'nutricia-language';

type LanguageState = {
  language: SupportedLanguage;
  _hydrated: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
};

export const useLanguageStore = create<LanguageState>()((set) => ({
  language: resolveDeviceLanguage(),
  _hydrated: false,
  setLanguage: (language) => {
    i18n.changeLanguage(language);
    storage.setItem(LANGUAGE_KEY, language).catch(() => {});
    set({ language });
  },
}));

function isSupported(value: string | null): value is SupportedLanguage {
  return value !== null && (SUPPORTED_LANGUAGES as string[]).includes(value);
}

export async function hydrateLanguageStore(): Promise<void> {
  try {
    const stored = await storage.getItem(LANGUAGE_KEY);
    if (isSupported(stored)) {
      i18n.changeLanguage(stored);
      useLanguageStore.setState({ language: stored, _hydrated: true });
      return;
    }
  } catch {
    // fall through to default
  }
  useLanguageStore.setState({ _hydrated: true });
}
