/**
 * API configuration for connecting to the NutricIA backend.
 *
 * Web defaults to localhost.
 * Native dev clients try to derive the host machine IP from Expo's hostUri,
 * and Android emulators fall back to 10.0.2.2 when needed.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '8000';
const API_PATH = '/api/v1';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

const LOCAL_API_URL = `http://localhost:${API_PORT}${API_PATH}`;
const ANDROID_EMULATOR_API_URL = `http://10.0.2.2:${API_PORT}${API_PATH}`;

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getExpoDevHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
  }

  const [host] = hostUri.split(':');
  return host || null;
}

function resolveApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';
  const parsedConfiguredUrl = configuredUrl ? parseUrl(configuredUrl) : null;
  const configuredHost = parsedConfiguredUrl?.hostname ?? null;
  const isNative = Platform.OS !== 'web';

  if (
    configuredUrl &&
    (!isNative || (configuredHost !== null && !LOCAL_HOSTS.has(configuredHost)))
  ) {
    return configuredUrl;
  }

  if (isNative) {
    const expoDevHost = getExpoDevHost();

    if (expoDevHost && !LOCAL_HOSTS.has(expoDevHost)) {
      return `http://${expoDevHost}:${API_PORT}${API_PATH}`;
    }

    if (Platform.OS === 'android') {
      return ANDROID_EMULATOR_API_URL;
    }
  }

  return configuredUrl || LOCAL_API_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const API_TIMEOUT = 30_000; // 30 seconds (AI scan can be slow)
