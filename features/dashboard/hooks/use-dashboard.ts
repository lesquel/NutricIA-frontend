/**
 * Dashboard React-Query hooks.
 */

import { useQuery } from '@tanstack/react-query';
import { useDateStore, formatDateParam } from '@/shared/store/date.store';
import { fetchDailySummary, fetchDailyMeals } from '../api/dashboard.service';

export function useDailySummary() {
  const selectedDate = useDateStore((s) => s.selectedDate);
  const dateStr = formatDateParam(selectedDate);

  return useQuery({
    queryKey: ['analytics', 'daily', dateStr],
    queryFn: () => fetchDailySummary(dateStr),
  });
}

export function useDailyMeals() {
  const selectedDate = useDateStore((s) => s.selectedDate);
  const dateStr = formatDateParam(selectedDate);

  return useQuery({
    queryKey: ['meals', 'daily', dateStr],
    queryFn: () => fetchDailyMeals(dateStr),
    select: (data) => data.meals,
  });
}
