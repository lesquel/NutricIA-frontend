/**
 * Planner API service.
 */

import { apiClient, ApiError } from '@/shared/api/client';
import type {
  MealPlan,
  PlannedMeal,
  GeneratePlanRequest,
  LogMealResponse,
} from '@/shared/types/api';

export type SwapMealBody = {
  recipe_name: string;
  recipe_ingredients: string[];
  calories: number;
  macros: { protein_g: number; carbs_g: number; fat_g: number };
  cook_time_minutes?: number | null;
  difficulty?: string | null;
  servings?: number;
};

async function getCurrent(): Promise<MealPlan | null> {
  try {
    return await apiClient.get<MealPlan>('/plans/current');
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

function generatePlan(req: GeneratePlanRequest): Promise<MealPlan> {
  return apiClient.post<MealPlan>('/plans/generate', req);
}

function swapMeal(planId: string, mealId: string, body: SwapMealBody): Promise<PlannedMeal> {
  return apiClient.patch<PlannedMeal>(`/plans/${planId}/meals/${mealId}`, body);
}

function logMeal(planId: string, mealId: string): Promise<LogMealResponse> {
  return apiClient.post<LogMealResponse>(`/plans/${planId}/meals/${mealId}/log`);
}

export const plannerService = {
  getCurrent,
  generatePlan,
  swapMeal,
  logMeal,
};
