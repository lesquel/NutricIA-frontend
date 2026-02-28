/**
 * Journal React-Query hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDateStore, formatDateParam } from '@/shared/store/date.store';
import { fetchMealsByDate, deleteMeal } from '../api/journal.service';
import type { MealResponse, MealType } from '@/shared/types/api';

export type MealSection = {
  title: string;
  mealType: MealType;
  icon: string;
  meals: MealResponse[];
  totalKcal: number;
};

const SECTION_ORDER: { title: string; mealType: MealType; icon: string }[] = [
  { title: 'Breakfast', mealType: 'breakfast', icon: 'wb-sunny' },
  { title: 'Lunch', mealType: 'lunch', icon: 'light-mode' },
  { title: 'Snacks', mealType: 'snack', icon: 'cookie' },
  { title: 'Dinner', mealType: 'dinner', icon: 'nightlight-round' },
];

function groupMealsIntoSections(meals: MealResponse[]): MealSection[] {
  return SECTION_ORDER.map(({ title, mealType, icon }) => {
    const sectionMeals = meals.filter((m) => m.meal_type === mealType);
    return {
      title,
      mealType,
      icon,
      meals: sectionMeals,
      totalKcal: sectionMeals.reduce((sum, m) => sum + m.calories, 0),
    };
  });
}

export function useJournalMeals() {
  const selectedDate = useDateStore((s) => s.selectedDate);
  const dateStr = formatDateParam(selectedDate);

  return useQuery({
    queryKey: ['meals', 'daily', dateStr],
    queryFn: () => fetchMealsByDate(dateStr),
    select: (data) => ({
      sections: groupMealsIntoSections(data),
      totalCalories: data.reduce((s, m) => s + m.calories, 0),
    }),
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (mealId: string) => deleteMeal(mealId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meals'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
