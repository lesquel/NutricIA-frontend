/**
 * WeekGrid — renders all 7 DayCards for a meal plan in a scrollable list.
 */

import React from 'react';
import { ScrollView } from 'react-native';
import { DayCard } from './DayCard';
import type { MealPlan, PlannedMeal } from '@/shared/types/api';

export interface WeekGridProps {
  plan: MealPlan;
  onMealPress: (meal: PlannedMeal) => void;
}

export function WeekGrid({ plan, onMealPress }: WeekGridProps) {
  // week_start is an ISO date string like "2024-04-15"
  const weekStart = new Date(plan.week_start + 'T00:00:00');

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {Array.from({ length: 7 }, (_, dayIndex) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayIndex);

        const dayMeals = plan.meals.filter((m) => m.day_of_week === dayIndex);

        return (
          <DayCard
            key={dayIndex}
            date={date}
            dayOfWeek={dayIndex}
            meals={dayMeals}
            targetCalories={plan.target_calories}
            targetMacros={plan.target_macros}
            onMealPress={onMealPress}
          />
        );
      })}
    </ScrollView>
  );
}
