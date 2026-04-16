import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../api/auth.service';

/**
 * TanStack Query mutation for POST /auth/reset-password.
 * Backend contract: body { token: string, new_password: string }, response 200.
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword(token, newPassword),
  });
}
