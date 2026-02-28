import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/api/query-client';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';

// Custom themes matching NutricIA palette
const NutricIALight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

const NutricIADark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

/** Inner component that can use auth hooks (inside QueryClientProvider). */
function RootNavigator() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  const [hydrated, setHydrated] = useState(false);

  // Try to restore session on mount
  const { isLoading: checkingAuth, isError } = useCurrentUser();

  // Wait for Zustand persist hydration
  useEffect(() => {
    // Zustand persist rehydration fires synchronously after first render
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (no persisted data/web)
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsubscribe;
  }, []);

  // Route guard
  useEffect(() => {
    if (!hydrated || checkingAuth) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'welcome';
    const inAppGroup = segments[0] === '(tabs)' || segments[0] === 'settings';

    if (!hasOnboarded) {
      // First-time user → onboarding
      if (segments[0] !== 'welcome') {
        router.replace('/welcome');
      }
    } else if (!isAuthenticated) {
      // Onboarded but not logged in → login
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else {
      // Authenticated → go to app
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [hydrated, checkingAuth, isAuthenticated, hasOnboarded, segments]);

  // Show loading while hydrating store + checking token
  if (!hydrated || checkingAuth) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors[colorScheme ?? 'light'].background }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? NutricIADark : NutricIALight}>
      <Stack>
        {/* Auth screens */}
        <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="register" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* App screens */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
