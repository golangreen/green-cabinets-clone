import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotificationSettings, upsertNotificationSettings } from '@/services';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationSettings {
  id: string;
  user_id: string;
  webhook_security_enabled: boolean;
  rate_limit_enabled: boolean;
  webhook_retry_enabled: boolean;
  webhook_duplicate_enabled: boolean;
  severity_threshold: 'low' | 'medium' | 'high' | 'critical';
  retry_threshold: number;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotificationSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const data = await fetchNotificationSettings(user.id);
      return data as NotificationSettings || null;
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<NotificationSettings>) => {
      if (!user?.id) throw new Error('No user ID');

      await upsertNotificationSettings(user.id, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings', user?.id] });
    },
  });

  const shouldShowNotification = (
    eventType: 'webhook_security' | 'rate_limit' | 'webhook_retry' | 'webhook_duplicate',
    severity?: 'low' | 'medium' | 'high' | 'critical',
    retryCount?: number
  ): boolean => {
    if (!settings) return true; // Show by default if no settings

    // Check if event type is enabled
    const eventTypeEnabled = {
      webhook_security: settings.webhook_security_enabled,
      rate_limit: settings.rate_limit_enabled,
      webhook_retry: settings.webhook_retry_enabled,
      webhook_duplicate: settings.webhook_duplicate_enabled,
    }[eventType];

    if (!eventTypeEnabled) return false;

    // Check severity threshold
    if (severity) {
      const severityLevels = { low: 0, medium: 1, high: 2, critical: 3 };
      const thresholdLevels = { low: 0, medium: 1, high: 2, critical: 3 };
      
      if (severityLevels[severity] < thresholdLevels[settings.severity_threshold]) {
        return false;
      }
    }

    // Check retry threshold
    if (eventType === 'webhook_retry' && retryCount !== undefined) {
      if (retryCount < settings.retry_threshold) {
        return false;
      }
    }

    return true;
  };

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
    shouldShowNotification,
  };
}
