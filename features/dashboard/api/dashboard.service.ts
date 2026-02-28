/**
 * Dashboard API service.
 */

import { apiClient } from '@/shared/api/client';
import type { DailySummary, MealResponse } from '@/shared/types/api';

export async function fetchDailySummary(date: string): Promise<DailySummary> {
  return apiClient.get<DailySummary>(`/analytics/daily?date=${date}`);
}

export async function fetchDailyMeals(date: string): Promise<MealResponse[]> {
  return apiClient.get<MealResponse[]>(`/meals?date=${date}`);
}
