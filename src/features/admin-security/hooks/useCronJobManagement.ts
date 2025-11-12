/**
 * useCronJobManagement Hook
 * Manages cron job operations with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { fetchCronJobs, triggerRoleExpirationCheck } from '@/services/securityService';

export function useCronJobManagement() {
  const queryClient = useQueryClient();

  // Fetch cron jobs
  const { data: cronJobs, isLoading } = useQuery({
    queryKey: ['cron-jobs'],
    queryFn: fetchCronJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Manual trigger mutation
  const triggerCheckMutation = useMutation({
    mutationFn: triggerRoleExpirationCheck,
    onSuccess: () => {
      toast.success('Role expiration check completed successfully');
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['role-change-audit'] });
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
