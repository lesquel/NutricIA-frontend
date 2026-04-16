import { useMutation, useQueryClient } from '@tanstack/react-query';
import { plannerService, type SwapMealBody } from '../api/planner.service';
import { useToast } from '@/shared/hooks/use-toast';

/**
 * Mutation to swap a planned meal with different recipe details.
 * Invalidates the current plan query on success.
 */
export function useSwapMeal() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ planId, mealId, body }: { planId: string; mealId: string; body: SwapMealBody }) =>
      plannerService.swapMeal(planId, mealId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan', 'current'] });
    },
    onError: () => {
      toast.error('No se pudo reemplazar la comida. Intentá de nuevo.');
    },
  });
}
