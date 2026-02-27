/**
 * API configuration for connecting to the NutricIA backend.
 */

// In dev, use local IP. In production, use your deployed URL.
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'
  : 'https://api.nutricia.app/api/v1';

export const API_TIMEOUT = 30_000; // 30 seconds (AI scan can be slow)
