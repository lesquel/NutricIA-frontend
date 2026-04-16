import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../api/auth.service';

/**
 * TanStack Query mutation for POST /auth/forgot-password.
 * Backend contract: body { email: string }, response 200 with generic message.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}
