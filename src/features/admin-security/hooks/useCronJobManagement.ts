/**
 * useCronJobManagement Hook
 * Manages cron job operations with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { fetchCronJobs, triggerRoleExpirationCheck } from '@/services/securityService';
import { QUERY_KEYS } from '@/config/queryKeys';
import { FEATURE_STALE_TIMES } from '@/config/reactQuery';

export function useCronJobManagement() {
  const queryClient = useQueryClient();

  // Fetch cron jobs
  const { data: cronJobs, isLoading } = useQuery({
    queryKey: QUERY_KEYS.CRON_JOBS,
    queryFn: fetchCronJobs,
    staleTime: FEATURE_STALE_TIMES.CRON_JOBS,
  });

  // Manual trigger mutation
  const triggerCheckMutation = useMutation({
    mutationFn: triggerRoleExpirationCheck,
    onSuccess: () => {
      toast.success('Role expiration check completed successfully');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLE_CHANGE_AUDIT });
    },
    onError: (error: any) => {
      logger.edgeFunctionError('check-role-expiration', error, {
        component: 'useCronJobManagement'
      });
      toast.error(error.message || 'Failed to run check');
    },
  });

  return {
    cronJobs,
    isLoading,
    triggerCheck: triggerCheckMutation.mutate,
    isTriggering: triggerCheckMutation.isPending,
  };
}
