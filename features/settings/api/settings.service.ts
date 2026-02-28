/**
 * Settings API service.
 */

import { apiClient } from '@/shared/api/client';
import { appendFileToFormData } from '@/shared/lib/form-data';
import type { UserProfile } from '@/shared/types/api';

export async function fetchUserSettings(): Promise<UserProfile> {
  return apiClient.get<UserProfile>('/users/me');
}

export async function updateProfile(data: {
  name?: string;
  avatar_url?: string;
}): Promise<UserProfile> {
  return apiClient.patch<UserProfile>('/users/me', data);
}

export async function uploadAvatar(imageUri: string): Promise<UserProfile> {
  const formData = new FormData();
  await appendFileToFormData(formData, 'file', imageUri, 'avatar.jpg', 'image/jpeg');

  return apiClient.upload<UserProfile>('/users/me/avatar', formData);
}

export async function deleteAvatar(): Promise<UserProfile> {
  return apiClient.delete<UserProfile>('/users/me/avatar');
}

export async function updateGoals(data: {
  calorie_goal?: number;
  water_goal_ml?: number;
}): Promise<UserProfile> {
  return apiClient.patch<UserProfile>('/users/me/goals', data);
}

export async function updateDietaryPreferences(
  preferences: string[],
): Promise<UserProfile> {
  return apiClient.patch<UserProfile>('/users/me/diet', { preferences });
}

export async function deleteAccount(): Promise<void> {
  return apiClient.delete<void>('/users/me');
}
