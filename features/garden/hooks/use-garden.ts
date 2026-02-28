/**
 * Garden React-Query hooks — habits & water.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDateStore, formatDateParam } from '@/shared/store/date.store';
import {
  fetchHabits,
  createHabit,
  checkInHabit,
  fetchWaterLog,
  logWater,
} from '../api/garden.service';

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createHabit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  });
}

export function useCheckInHabit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (habitId: string) => checkInHabit(habitId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  });
}

export function useWaterLog() {
  const selectedDate = useDateStore((s) => s.selectedDate);
  const dateStr = formatDateParam(selectedDate);

  return useQuery({
    queryKey: ['water', dateStr],
    queryFn: () => fetchWaterLog(dateStr),
  });
}

export function useLogWater() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (cups: number) => logWater(cups),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['water'] }),
  });
}
