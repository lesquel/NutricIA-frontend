/**
 * Apple OAuth hook using expo-apple-authentication.
 *
 * Apple Sign-In is only available on iOS and macOS.
 */

import { useCallback, useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useOAuthLogin } from './use-auth';
import { useRouter } from 'expo-router';

export function useAppleAuth() {
  const oauthLogin = useOAuthLogin();
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAvailable);
    }
  }, []);

  const loginWithApple = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Sign-In is only available on iOS.');
      return;
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const token = credential.identityToken;

      if (!token) {
        Alert.alert('Error', 'No token received from Apple.');
        return;
      }

      oauthLogin.mutate(
        { provider: 'apple', token },
        {
          onSuccess: () => router.replace('/(tabs)'),
          onError: (err: any) => {
            const detail = err?.body?.detail ?? 'Apple sign-in failed.';
            Alert.alert('Login Failed', detail);
          },
        },
      );
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled — do nothing
        return;
      }
      Alert.alert('Error', err?.message ?? 'Apple sign-in failed.');
    }
  }, [oauthLogin, router]);

  return {
    loginWithApple,
    isAvailable,
    isPending: oauthLogin.isPending,
  };
}
