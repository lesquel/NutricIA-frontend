/**
 * Scanner API service.
 */

import { apiClient } from '@/shared/api/client';
import { appendFileToFormData } from '@/shared/lib/form-data';
import type { ScanResult, MealResponse, MealType } from '@/shared/types/api';

type UploadImageResponse = {
  image_url: string;
};

export async function scanFood(imageUri: string): Promise<ScanResult> {
  const formData = new FormData();
  await appendFileToFormData(formData, 'file', imageUri, 'food.jpg', 'image/jpeg');

  return apiClient.upload<ScanResult>('/meals/scan', formData, {
    timeout: 45_000, // AI analysis can be slow
  });
}

export async function saveMeal(data: {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: MealType;
  confidence_score?: number;
  tags: string[];
  image_url?: string;
}): Promise<MealResponse> {
  let persistedImageUrl = data.image_url;

  if (
    persistedImageUrl &&
    (
      persistedImageUrl.startsWith('file://') ||
      persistedImageUrl.startsWith('content://') ||
      persistedImageUrl.startsWith('/') ||
      persistedImageUrl.startsWith('blob:') ||
      persistedImageUrl.startsWith('data:')
    )
  ) {
    const formData = new FormData();
    await appendFileToFormData(formData, 'file', persistedImageUrl, 'meal.jpg', 'image/jpeg');
    const uploaded = await apiClient.upload<UploadImageResponse>('/meals/upload-image', formData);
    persistedImageUrl = uploaded.image_url;
  }

  return apiClient.post<MealResponse>('/meals', {
    ...data,
    image_url: persistedImageUrl,
  });
}
