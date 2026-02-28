/**
 * Cross-platform key-value storage.
 *
 * - Native (iOS/Android): uses expo-secure-store (encrypted).
 * - Web: uses localStorage (expo-secure-store is a no-op on web).
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage full or blocked — silently fail
    }
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const storage = { getItem, setItem, deleteItem };
