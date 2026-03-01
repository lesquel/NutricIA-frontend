/**
 * API configuration for connecting to the NutricIA backend.
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const API_TIMEOUT = 30_000; // 30 seconds (AI scan can be slow)
