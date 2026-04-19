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
    try {
      abortRef.current?.abort();
    } catch {
      /* noop — xhr already torn down */
    }
    abortRef.current = null;
  }

  function start(path: string, body: Record<string, unknown>) {
    // Cancel any in-flight request
    stop();

    setEvents([]);
    setError(null);
    setStatus('streaming');

    if (Platform.OS === 'web') {
      _startWithFetch(path, body);
    } else {
      _startWithXHR(path, body);
    }
  }

  // ── Web path: native fetch + ReadableStream ─────────────────────────────
  function _startWithFetch(path: string, body: Record<string, unknown>) {
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

        if (response.body && typeof response.body.getReader === 'function') {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split(/(?<=\n\n)/);
            buffer = parts.pop() ?? '';
            for (const part of parts) {
              parseSSEChunk<T>(part, addEvent);
            }
          }
          if (buffer.trim()) {
            parseSSEChunk<T>(buffer, addEvent);
          }
        } else {
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

  // ── Native path: XMLHttpRequest with progressive onprogress parsing ─────
  //
  // React Native's fetch on Android does not reliably expose streamed bodies
  // for text/event-stream and `await response.text()` can return empty. XHR
  // with `responseType: 'text'` plus the `progress` event gives us the
  // accumulated responseText at each chunk, which parses cleanly as SSE.
  function _startWithXHR(path: string, body: Record<string, unknown>) {
    (async () => {
      try {
        const token = await storage.getItem('auth_token');

        const xhr = new XMLHttpRequest();
        // Hijack stop(): abort tears down the xhr.
        abortRef.current = {
          abort: () => xhr.abort(),
        } as unknown as AbortController;

        let processedLen = 0;
        const addEvent = (event: T) => {
          setEvents((prev) => [...prev, event]);
        };

        const drain = (final: boolean) => {
          const text = xhr.responseText ?? '';
          if (text.length <= processedLen) return;
          const chunk = text.slice(processedLen);
          // Split on \n\n — keep the trailing partial for the next tick.
          const parts = chunk.split('\n\n');
          const lastPartial = final ? '' : parts.pop() ?? '';
          for (const part of parts) {
            if (part.trim()) parseSSEChunk<T>(part, addEvent);
          }
          processedLen = text.length - lastPartial.length;
        };

        xhr.open('POST', `${API_BASE_URL}${path}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'text/event-stream');
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.onprogress = () => drain(false);
        xhr.onload = () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            setError(`HTTP ${xhr.status}`);
            setStatus('error');
            return;
          }
          drain(true);
          setStatus('done');
        };
        xhr.onerror = () => {
          setError('Network error');
          setStatus('error');
        };
        xhr.onabort = () => {
          setStatus('idle');
        };

        xhr.send(JSON.stringify(body));
      } catch (err: unknown) {
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
