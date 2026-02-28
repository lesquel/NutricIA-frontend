import { useColorScheme as useSystemScheme } from 'react-native';
import { useThemeStore, resolveColorScheme } from '@/shared/store/theme.store';

export function useColorScheme() {
  const systemScheme = useSystemScheme();
  const preference = useThemeStore((s) => s.preference);
  return resolveColorScheme(preference, systemScheme);
}
