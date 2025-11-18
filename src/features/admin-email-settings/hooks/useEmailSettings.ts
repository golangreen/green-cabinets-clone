import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailConfigService } from '@/services/emailConfigService';
import { toast } from '@/hooks/useToast';
import { QUERY_KEYS, FEATURE_STALE_TIMES } from '@/config';

export const useEmailSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.EMAIL_SETTINGS,
    queryFn: () => emailConfigService.fetchEmailSettings(),
    staleTime: FEATURE_STALE_TIMES.EMAIL_SETTINGS,
  });

  const updateMutation = useMutation({
    mutationFn: ({ senderEmail, senderName }: { senderEmail: string; senderName: string }) =>
      emailConfigService.updateEmailSettings(senderEmail, senderName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMAIL_SETTINGS });
      toast({
        title: 'Success',
        description: 'Email sender configuration updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update email settings',
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};
