import { useQuery } from '@tanstack/react-query';
import { fetchBlockedIPs } from '@/services';
import { QUERY_KEYS, FEATURE_STALE_TIMES } from '@/config';

export const useBlockedIPs = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.BLOCKED_IPS,
    queryFn: fetchBlockedIPs,
    enabled,
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });
};
