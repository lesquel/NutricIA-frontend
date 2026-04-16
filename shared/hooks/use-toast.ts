import { useToastContext } from '@/shared/components/ui/ToastProvider';
import type { ToastVariant } from '@/shared/components/ui/Toast';

interface ToastHelpers {
  show: (options: { message: string; variant?: ToastVariant }) => string;
  hide: (id: string) => void;
  success: (message: string) => string;
  error: (message: string) => string;
  info: (message: string) => string;
  warning: (message: string) => string;
}

/**
 * Hook to show/hide toast notifications.
 * Must be used inside a <ToastProvider>.
 * Throws "ToastProvider not found in component tree" if provider is missing.
 */
export function useToast(): ToastHelpers {
  const ctx = useToastContext();

  return {
    show: ctx.show,
    hide: ctx.hide,
    success: (message: string) => ctx.show({ message, variant: 'success' }),
    error: (message: string) => ctx.show({ message, variant: 'error' }),
    info: (message: string) => ctx.show({ message, variant: 'info' }),
    warning: (message: string) => ctx.show({ message, variant: 'warning' }),
  };
}
