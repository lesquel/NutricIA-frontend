/**
 * Google OAuth hook using expo-auth-session.
 *
 * Requires EXPO_PUBLIC_GOOGLE_CLIENT_ID env var (web client ID).
 * Android/iOS native client IDs are optional (for bare workflow).
 */

import { useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useOAuthLogin } from './use-auth';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function useGoogleAuth() {
  const oauthLogin = useOAuthLogin();
  const router = useRouter();

  const [request, _response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });

  const loginWithGoogle = useCallback(async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      Alert.alert('Config Error', 'Google Client ID not configured.');
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
