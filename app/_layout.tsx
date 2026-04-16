import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/api/query-client';
import { useAuthStore, hydrateAuthStore } from '@/features/auth/store/auth.store';
import { ErrorBoundary } from '@/shared/components/error-boundary';
import { useCurrentUser } from '@/features/auth/hooks/use-auth';
import { ToastProvider } from '@/shared/components/ui/ToastProvider';

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
  const hydrated = useAuthStore((s) => s._hydrated);

  // Try to restore session on mount
  const { isLoading: checkingAuth, isError } = useCurrentUser();

  // Hydrate persisted flags from SecureStore on mount
  useEffect(() => {
    hydrateAuthStore();
  }, []);

  // Route guard — don't wait for checkingAuth if we already have a user
  const ready = hydrated && (isAuthenticated || !checkingAuth);

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'welcome';

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
  }, [ready, isAuthenticated, hasOnboarded, segments]);

  // Show loading while hydrating store + checking token (skip if already authenticated)
  if (!ready) {
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
        <Stack.Screen name="forgot-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false, animation: 'slide_from_right' }} />

        {/* App screens */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="planner"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <RootNavigator />
          </ToastProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
