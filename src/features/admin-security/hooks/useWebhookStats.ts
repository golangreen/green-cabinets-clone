import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWebhookStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['webhook-stats'],
    queryFn: async () => {
      const { data: webhookEvents, error: webhookError } = await supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (webhookError) throw webhookError;

      const { data: securityEvents, error: securityError } = await supabase
        .from('security_events')
        .select('*')
        .eq('function_name', 'resend-webhook')
        .order('created_at', { ascending: false })
        .limit(100);

      if (securityError) throw securityError;

      return {
        webhookEvents: webhookEvents || [],
        securityEvents: securityEvents || [],
      };
    },
    enabled,
  });
};
