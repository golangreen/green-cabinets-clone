import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

      const { data, error } = await supabase
        .rpc('get_or_create_notification_settings', {
          p_user_id: user.id
        });

      if (error) throw error;
      return data?.[0] as NotificationSettings || null;
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<NotificationSettings>) => {
      if (!user?.id) throw new Error('No user ID');

      const { data, error } = await supabase
        .from('notification_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as NotificationSettings;
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
