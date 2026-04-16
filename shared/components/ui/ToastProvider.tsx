import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast, type ToastItem, type ToastVariant } from './Toast';

const MAX_TOASTS = 3;

interface ShowOptions {
  message: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  show: (options: ShowOptions) => string;
  hide: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('ToastProvider not found in component tree');
  }
  return ctx;
}

let idCounter = 0;
function generateId(): string {
  return `toast-${Date.now()}-${idCounter++}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();

  const show = useCallback((options: ShowOptions): string => {
    const id = generateId();
    const item: ToastItem = {
      id,
      message: options.message,
      variant: options.variant ?? 'info',
    };

    setToasts((prev) => {
      const next = [...prev, item];
      // If over limit, remove oldest
      if (next.length > MAX_TOASTS) {
        return next.slice(next.length - MAX_TOASTS);
      }
      return next;
    });

    return id;
  }, []);

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      <View style={[styles.container, { top: insets.top + 12 }]} pointerEvents="box-none">
        {toasts.map((item) => (
          <Toast key={item.id} item={item} onDismiss={hide} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
});
