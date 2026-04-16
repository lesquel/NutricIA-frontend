import { useQuery } from '@tanstack/react-query';
import { plannerService } from '../api/planner.service';

/**
 * Fetches the user's current active meal plan.
 * Returns null when no plan exists (404).
 */
export function useCurrentPlan() {
  return useQuery({
    queryKey: ['plan', 'current'],
    queryFn: plannerService.getCurrent,
    staleTime: 60_000,
  });
}
