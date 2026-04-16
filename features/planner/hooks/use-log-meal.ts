import { useMutation, useQueryClient } from '@tanstack/react-query';
import { plannerService } from '../api/planner.service';
import { useToast } from '@/shared/hooks/use-toast';

/**
 * Mutation to mark a planned meal as logged.
 * Invalidates plan, meals, and analytics queries on success.
 */
export function useLogMeal() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ planId, mealId }: { planId: string; mealId: string }) =>
      plannerService.logMeal(planId, mealId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['plan', 'current'] });
      qc.invalidateQueries({ queryKey: ['meals'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
      if (data.already_logged) {
        toast.info('Esta comida ya estaba registrada');
      } else {
        toast.success('Comida marcada como consumida');
      }
    },
    onError: () => {
      toast.error('No se pudo registrar la comida. Intentá de nuevo.');
    },
  });
}
