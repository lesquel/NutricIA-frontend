import { useMutation, useQueryClient } from '@tanstack/react-query';
import { plannerService } from '../api/planner.service';
import { useToast } from '@/shared/hooks/use-toast';
import type { GeneratePlanRequest } from '@/shared/types/api';

/**
 * Mutation to generate a new meal plan.
 * Invalidates the current plan query on success.
 */
export function useGeneratePlan() {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (req: GeneratePlanRequest) => plannerService.generatePlan(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan', 'current'] });
      toast.success('Plan generado exitosamente');
    },
    onError: () => {
      toast.error('No se pudo generar el plan. Intentá de nuevo.');
    },
  });
}
