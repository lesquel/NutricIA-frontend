/**
 * Settings React-Query hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserSettings,
  updateProfile,
  updateGoals,
  updateDietaryPreferences,
} from '../api/settings.service';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useUserSettings() {
  return useQuery({
    queryKey: ['users', 'settings'],
    queryFn: fetchUserSettings,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setUser(data);
      qc.invalidateQueries({ queryKey: ['users', 'settings'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useUpdateGoals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: updateGoals,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'settings'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useUpdateDietaryPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (preferences: string[]) => updateDietaryPreferences(preferences),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'settings'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
