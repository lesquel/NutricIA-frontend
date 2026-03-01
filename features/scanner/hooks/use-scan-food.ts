/**
 * Scanner React-Query hooks.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scanFood, saveMeal } from '../api/scanner.service';
import type { MealType } from '@/shared/types/api';

export function useScanFood() {
  return useMutation({
    mutationFn: (imageUri: string) => scanFood(imageUri),
  });
}

export function useSaveMeal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      meal_type: MealType;
      confidence_score?: number;
      tags: string[];
      image_url?: string;
    }) => saveMeal(data),
    onSuccess: () => {
      // Invalidate meals + analytics so dashboard/journal refresh
      qc.invalidateQueries({ queryKey: ['meals'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
