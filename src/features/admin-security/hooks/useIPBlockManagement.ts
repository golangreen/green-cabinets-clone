/**
 * useIPBlockManagement Hook
 * Manages IP blocking/unblocking operations with React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { blockIP, unblockIP, sendSecurityAlert } from '@/services/securityService';

export function useIPBlockManagement() {
  const queryClient = useQueryClient();

  const blockIPMutation = useMutation({
    mutationFn: async (params: {
      ipAddress: string;
      reason: string;
      durationHours: number;
    }) => {
      // Block the IP
      await blockIP(params.ipAddress, params.reason, params.durationHours);
      
      // Send notification
      try {
        const blockedUntil = new Date(
          Date.now() + params.durationHours * 60 * 60 * 1000
        ).toISOString();
        
        await sendSecurityAlert({
          type: 'ip_blocked',
          ipAddress: params.ipAddress,
          reason: params.reason,
          blockedUntil
        });
      } catch (emailError) {
        logger.error('Failed to send email notification', {
          component: 'useIPBlockManagement',
          error: emailError
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('IP blocked successfully');
    },
    onError: (error: any) => {
      logger.error('Failed to block IP', {
        component: 'useIPBlockManagement',
        error
      });
      toast.error(`Failed to block IP: ${error.message}`);
    },
  });

  const unblockIPMutation = useMutation({
    mutationFn: async (params: {
      ipAddress: string;
      reason?: string;
    }) => {
      // Unblock the IP
      await unblockIP(params.ipAddress, params.reason);
      
      // Send notification
      try {
        await sendSecurityAlert({
          type: 'ip_unblocked',
          ipAddress: params.ipAddress,
          reason: params.reason || 'Manual unblock from admin dashboard'
        });
      } catch (emailError) {
        logger.error('Failed to send email notification', {
          component: 'useIPBlockManagement',
          error: emailError
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      toast.success('IP unblocked successfully');
    },
    onError: (error: any) => {
      logger.error('Failed to unblock IP', {
        component: 'useIPBlockManagement',
        error
      });
      toast.error(`Failed to unblock IP: ${error.message}`);
    },
  });

  return {
    blockIP: blockIPMutation.mutate,
    unblockIP: unblockIPMutation.mutate,
    isBlocking: blockIPMutation.isPending,
    isUnblocking: unblockIPMutation.isPending,
  };
}
