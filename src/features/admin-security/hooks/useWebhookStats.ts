import { useQuery } from '@tanstack/react-query';
import { fetchWebhookEvents, fetchSecurityEvents } from '@/services';

export const useWebhookStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['webhook-stats'],
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
  });
};
