/**
 * Scanner API service.
 */

import { apiClient } from '@/shared/api/client';
import type { ScanResult, MealResponse, MealType } from '@/shared/types/api';

export async function scanFood(imageUri: string): Promise<ScanResult> {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'food.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  return apiClient.upload<ScanResult>('/meals/scan', formData, {
    timeout: 45_000, // AI analysis can be slow
  });
}

export async function saveMeal(data: {
  food_name: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  meal_type: MealType;
  tags: string[];
  image_url?: string;
}): Promise<MealResponse> {
  return apiClient.post<MealResponse>('/meals', data);
}
