import { useQuery } from '@tanstack/react-query';
import { fetchWebhookEvents, fetchSecurityEvents } from '@/services';
import { QUERY_KEYS, FEATURE_STALE_TIMES } from '@/config';

export const useWebhookStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.WEBHOOK_STATS,
    queryFn: async () => {
      const [webhookEvents, securityEvents] = await Promise.all([
        fetchWebhookEvents(100),
        fetchSecurityEvents(60 * 24 * 7, undefined, undefined, 'resend-webhook')
      ]);

      return {
        webhookEvents: webhookEvents || [],
        securityEvents: securityEvents || [],
      };
    },
    enabled,
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });
};
