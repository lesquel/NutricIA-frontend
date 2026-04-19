/**
 * i18next initialization for NutricIA.
 *
 * Default language is resolved from device locale (expo-localization) and
 * then overridden by any persisted user preference (see language.store).
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import es from './locales/es.json';

export type SupportedLanguage = 'en' | 'es';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'es'];

export function resolveDeviceLanguage(): SupportedLanguage {
  try {
    const primary = getLocales()[0]?.languageCode?.toLowerCase() ?? 'en';
    return primary.startsWith('es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: resolveDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
    compatibilityJSON: 'v3',
  });

export default i18n;
