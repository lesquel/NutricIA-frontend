/**
 * Generic SSE stream consumer.
 *
 * Handles TCP chunking by maintaining a line buffer that reassembles partial
 * events. SSE format: events delimited by double-newline (\n\n), each event
 * as one or more `data: <json>` lines.
 *
 * Uses ReadableStream.getReader() where available (native with Hermes ≥ 0.73,
 * web). Falls back to polling response.text() for older React Native versions.
 */

import { useRef, useState } from 'react';
import { Platform } from 'react-native';
import { storage } from '@/shared/lib/storage';
import { API_BASE_URL } from '@/constants/api';

export type SSEStatus = 'idle' | 'streaming' | 'done' | 'error';

export interface SSEStreamHook<T> {
  start: (path: string, body: Record<string, unknown>) => void;
  stop: () => void;
  events: T[];
  status: SSEStatus;
  error: string | null;
}

function parseSSEChunk<T>(chunk: string, onEvent: (event: T) => void): void {
  // Split on double-newline to get individual events
  const rawEvents = chunk.split(/\n\n/);
  for (const rawEvent of rawEvents) {
    const lines = rawEvent.split('\n');
    let data = '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        data += line.slice(6);
      }
    }
    if (!data.trim()) continue;
    try {
      const parsed = JSON.parse(data) as T;
      onEvent(parsed);
    } catch {
      // Partial or non-JSON data — ignore
    }
  }
}

export function useSSEStream<T>(): SSEStreamHook<T> {
  const [events, setEvents] = useState<T[]>([]);
  const [status, setStatus] = useState<SSEStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
  }

  function start(path: string, body: Record<string, unknown>) {
    // Cancel any in-flight request
    stop();

    setEvents([]);
    setError(null);
    setStatus('streaming');

    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const token = await storage.getItem('auth_token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${path}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const addEvent = (event: T) => {
          setEvents((prev) => [...prev, event]);
        };

        // React Native's fetch exposes response.body with a getReader() on
        // Hermes, but reads can hang indefinitely on Android. Use the streaming
        // path only on web where it's reliable, and fall back to text() on
        // native — the full response arrives at once instead of token-by-token,
        // which is acceptable and at least actually works.
        const canStream =
          Platform.OS === 'web' &&
          !!response.body &&
          typeof response.body.getReader === 'function';

        if (canStream) {
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // Process complete events (terminated by \n\n)
            const parts = buffer.split(/(?<=\n\n)/);
            // Keep the last part (possibly incomplete)
            buffer = parts.pop() ?? '';
            for (const part of parts) {
              parseSSEChunk<T>(part, addEvent);
            }
          }
          // Flush any remaining buffer
          if (buffer.trim()) {
            parseSSEChunk<T>(buffer, addEvent);
          }
        } else {
          // Fallback: accumulate full text (no token-by-token animation, but
          // works reliably on React Native where streaming readers are flaky).
          const text = await response.text();
          parseSSEChunk<T>(text, addEvent);
        }

        setStatus('done');
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus('idle');
          return;
        }
        const message = err instanceof Error ? err.message : 'SSE stream error';
        setError(message);
        setStatus('error');
      }
    })();
  }

  // Cleanup on unmount is handled by the caller via stop() or component unmount
  // (React's useEffect cleanup should call stop())

  return { start, stop, events, status, error };
}
