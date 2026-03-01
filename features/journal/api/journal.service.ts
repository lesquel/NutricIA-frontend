/**
 * Journal API service.
 */

import { apiClient } from '@/shared/api/client';
import type { MealListResponse } from '@/shared/types/api';

export type MealCalendarResponse = {
  month: string;
  registered_dates: string[];
};

export async function fetchMealsByDate(date: string): Promise<MealListResponse> {
  return apiClient.get<MealListResponse>(`/meals?target_date=${date}`);
}

export async function fetchMealCalendar(month: string): Promise<MealCalendarResponse> {
  return apiClient.get<MealCalendarResponse>(`/meals/calendar?month=${month}`);
}

export async function deleteMeal(mealId: string): Promise<void> {
  return apiClient.delete(`/meals/${mealId}`);
}
