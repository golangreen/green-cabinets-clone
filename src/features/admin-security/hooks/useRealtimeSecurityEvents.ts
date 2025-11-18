/**
 * useRealtimeSecurityEvents Hook
 * Manages realtime subscriptions to security_events table
 */

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/useToast';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { SecurityEvent, SecuritySeverity } from '@/types/security';

interface UseRealtimeSecurityEventsOptions {
  channelName: string;
  queryKey: readonly string[];
  eventTypeFilter?: string;
  functionNameFilter?: string;
  onEvent?: (event: SecurityEvent) => void;
  notificationType?: 'webhook_security' | 'rate_limit';
  showToast?: boolean;
}

export function useRealtimeSecurityEvents({
  channelName,
  queryKey,
  eventTypeFilter,
  functionNameFilter,
  onEvent,
  notificationType,
  showToast = true,
}: UseRealtimeSecurityEventsOptions) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const { shouldShowNotification } = useNotificationSettings();

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_events',
          ...(eventTypeFilter && { filter: `event_type=eq.${eventTypeFilter}` }),
          ...(functionNameFilter && { filter: `function_name=eq.${functionNameFilter}` }),
        },
        (payload) => {
          const event = payload.new as SecurityEvent;
          
          // Call custom event handler if provided
          if (onEvent) {
            onEvent(event);
          }

          // Show toast notification if enabled
          if (showToast && notificationType && shouldShowNotification(notificationType, event.severity as SecuritySeverity)) {
            const eventTypeDisplay = event.event_type.replace(/_/g, ' ').toUpperCase();
            
            toast({
              title: notificationType === 'rate_limit' ? '⚠️ Rate Limit Exceeded' : '🚨 Webhook Security Event',
              description: `${eventTypeDisplay} - IP: ${event.client_ip} (Severity: ${event.severity})`,
              variant: event.severity === 'high' || event.severity === 'critical' ? 'destructive' : 'default',
            });
          }
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      setIsConnected(false);
      supabase.removeChannel(channel);
    };
  }, [channelName, queryKey, eventTypeFilter, functionNameFilter, queryClient]);

  return { isConnected };
}
