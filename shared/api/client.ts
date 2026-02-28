/**
 * Shared HTTP client with auth interceptor.
 *
 * Wraps `fetch` with baseURL, JWT injection, timeout, and error handling.
 */

import { storage } from '@/shared/lib/storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';
const API_TIMEOUT = 30_000;

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `API Error ${status}`);
    this.name = 'ApiError';
  }
}

async function getToken(): Promise<string | null> {
  try {
    return await storage.getItem('auth_token');
  } catch {
    return null;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  timeout?: number;
  skipAuth?: boolean;
};

async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, timeout = API_TIMEOUT, skipAuth = false, ...init } = options;

  const headers = new Headers(init.headers);

  // Inject JWT
  if (!skipAuth) {
    const token = await getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // JSON body
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new ApiError(response.status, errorBody);
    }

    // 204 No Content
    if (response.status === 204) return undefined as T;

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  get: <T = unknown>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'GET' }),

  post: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),

  patch: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),

  put: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),

  delete: <T = unknown>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'DELETE' }),

  /** Upload a file (multipart/form-data). */
  upload: async <T = unknown>(
    path: string,
    formData: FormData,
    opts?: Omit<RequestOptions, 'body'>,
  ): Promise<T> => {
    const token = await getToken();
    const headers = new Headers(opts?.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    // Don't set Content-Type — browser/RN sets boundary automatically

    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      opts?.timeout ?? API_TIMEOUT,
    );

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new ApiError(response.status, errorBody);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  },
};
