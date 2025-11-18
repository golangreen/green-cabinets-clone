/**
 * useRealtimeWebhookEvents Hook
 * Manages realtime subscriptions to webhook_events table
 */

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { WebhookEvent } from '@/types/security';

interface UseRealtimeWebhookEventsOptions {
  channelName: string;
  queryKey: string[];
  onEvent?: (event: WebhookEvent) => void;
  showToast?: boolean;
  toastCondition?: (event: WebhookEvent) => boolean;
  toastTitle?: string;
  toastDescription?: (event: WebhookEvent) => string;
  toastVariant?: (event: WebhookEvent) => 'default' | 'destructive';
}

export function useRealtimeWebhookEvents({
  channelName,
  queryKey,
  onEvent,
  showToast = false,
  toastCondition,
  toastTitle,
  toastDescription,
  toastVariant,
}: UseRealtimeWebhookEventsOptions) {
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
          table: 'webhook_events'
        },
        (payload) => {
          const event = payload.new as WebhookEvent;
          
          // Call custom event handler if provided
          if (onEvent) {
            onEvent(event);
          }

          // Show toast notification if enabled and conditions are met
          if (showToast && toastCondition && toastCondition(event)) {
            toast({
              title: toastTitle || 'Webhook Event',
              description: toastDescription ? toastDescription(event) : 'New webhook event detected',
              variant: toastVariant ? toastVariant(event) : 'default',
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
  }, [channelName, queryKey, queryClient]);

  return { isConnected };
}
