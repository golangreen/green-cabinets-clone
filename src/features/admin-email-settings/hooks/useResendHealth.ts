import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ResendDomainRecord {
  record: string;
  name: string;
  type: string;
  value: string;
  status: string;
}

export interface ResendDomain {
  id: string;
  name: string;
  status: string;
  region: string;
  created_at: string;
  records: ResendDomainRecord[];
}

export interface ResendHealthData {
  success: boolean;
  domains: ResendDomain[];
  stats: {
    total_sent: number;
    total_delivered: number;
    total_bounced: number;
    total_failed: number;
    total_complained: number;
    delivery_rate: number;
  };
  api_key_configured: boolean;
  webhook_configured: boolean;
}

export const useResendHealth = () => {
  return useQuery({
    queryKey: ['resend-health'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-resend-health');
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch Resend health');
      
      return data as ResendHealthData;
    },
  });
};
