import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAlertHistory = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['alert-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_history')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled,
  });
};
