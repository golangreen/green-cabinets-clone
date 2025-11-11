import { useQuery } from '@tanstack/react-query';
import { fetchBlockedIPs } from '@/services';

export const useBlockedIPs = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['blocked-ips'],
    queryFn: fetchBlockedIPs,
    enabled,
  });
};
