/**
 * Journal API service.
 */

import { apiClient } from '@/shared/api/client';
import type { MealResponse } from '@/shared/types/api';

export async function fetchMealsByDate(date: string): Promise<MealResponse[]> {
  return apiClient.get<MealResponse[]>(`/meals?date=${date}`);
}

export async function deleteMeal(mealId: string): Promise<void> {
  return apiClient.delete(`/meals/${mealId}`);
}
