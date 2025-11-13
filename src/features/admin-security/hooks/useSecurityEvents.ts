import { useQuery } from '@tanstack/react-query';
import { fetchSecurityEvents } from '@/services';
import { QUERY_KEYS, FEATURE_STALE_TIMES } from '@/config';

export const useSecurityEvents = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.SECURITY_EVENTS,
    queryFn: () => fetchSecurityEvents(60 * 24 * 7), // Last 7 days
    enabled,
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });
};
