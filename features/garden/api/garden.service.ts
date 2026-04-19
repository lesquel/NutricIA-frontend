/**
 * Garden API service — habits & water tracking.
 */

import { apiClient } from '@/shared/api/client';
import type { HabitResponse, HabitCheckInResponse, WaterLogResponse } from '@/shared/types/api';

export async function fetchHabits(): Promise<HabitResponse[]> {
  return apiClient.get<HabitResponse[]>('/habits');
}

export async function createHabit(data: {
  name: string;
  description?: string;
  frequency_days?: number;
  plant_type?: string;
}): Promise<HabitResponse> {
  return apiClient.post<HabitResponse>('/habits', data);
}

export async function checkInHabit(habitId: string): Promise<HabitCheckInResponse> {
  return apiClient.post<HabitCheckInResponse>(`/habits/${habitId}/check-in`);
}

export async function deleteHabit(habitId: string): Promise<void> {
  await apiClient.delete<void>(`/habits/${habitId}`);
}

export async function fetchWaterLog(date: string): Promise<WaterLogResponse> {
  return apiClient.get<WaterLogResponse>(`/habits/water?target_date=${date}`);
}

export async function logWater(cups: number, targetDate: string): Promise<WaterLogResponse> {
  return apiClient.post<WaterLogResponse>('/habits/water', {
    cups,
    target_date: targetDate,
  });
}
