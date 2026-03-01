/**
 * Dashboard API service.
 */

import { apiClient } from '@/shared/api/client';
import type { DailySummary, MealListResponse } from '@/shared/types/api';

export async function fetchDailySummary(date: string): Promise<DailySummary> {
  return apiClient.get<DailySummary>(`/analytics/daily?target_date=${date}`);
}

export async function fetchDailyMeals(date: string): Promise<MealListResponse> {
  return apiClient.get<MealListResponse>(`/meals?target_date=${date}`);
}
