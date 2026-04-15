/**
 * Google OAuth hook using expo-auth-session.
 *
 * Requires EXPO_PUBLIC_GOOGLE_CLIENT_ID env var (web client ID).
 * Android/iOS native client IDs are optional (for bare workflow).
 * When no client IDs are configured, the hook returns a no-op so the
 * app can still run without Google OAuth.
 */

import { useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useOAuthLogin } from './use-auth';
import { useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

/** True when the required client ID for the current platform is present. */
const isConfigured =
  (Platform.OS === 'android' && !!GOOGLE_ANDROID_CLIENT_ID) ||
  (Platform.OS === 'ios' && !!GOOGLE_IOS_CLIENT_ID) ||
  (Platform.OS === 'web' && !!GOOGLE_WEB_CLIENT_ID);

export function useGoogleAuth() {
  const oauthLogin = useOAuthLogin();
  const router = useRouter();

  const [request, _response, promptAsync] = Google.useAuthRequest(
    isConfigured
      ? {
          webClientId: GOOGLE_WEB_CLIENT_ID,
          androidClientId: GOOGLE_ANDROID_CLIENT_ID,
          iosClientId: GOOGLE_IOS_CLIENT_ID,
        }
      : // Provide a dummy config with all platform IDs so the hook never
        // throws validation errors during bundle initialization.
        {
          webClientId: 'not-configured',
          androidClientId: 'not-configured',
          iosClientId: 'not-configured',
        },
  );

  const loginWithGoogle = useCallback(async () => {
    if (!isConfigured) {
      Alert.alert('Config Error', 'Google Client ID not configured for this platform.');
      return;
    }

    try {
      const result = await promptAsync();

      if (result.type === 'success') {
        const token =
          result.authentication?.idToken ?? result.authentication?.accessToken;

        if (!token) {
          Alert.alert('Error', 'No token received from Google.');
          return;
        }

        oauthLogin.mutate(
          { provider: 'google', token },
          {
            onSuccess: () => router.replace('/(tabs)'),
            onError: (err: any) => {
              const detail = err?.body?.detail ?? 'Google sign-in failed.';
              Alert.alert('Login Failed', detail);
            },
          },
        );
      } else if (result.type === 'error') {
        Alert.alert('Error', result.error?.message ?? 'Google sign-in failed.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Google sign-in failed.');
    }
  }, [promptAsync, oauthLogin, router]);

  return {
    loginWithGoogle,
    isReady: !!request,
    isPending: oauthLogin.isPending,
  };
}
