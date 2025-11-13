import { useQuery } from '@tanstack/react-query';
import { fetchAlertHistory } from '@/services';
import { QUERY_KEYS, FEATURE_STALE_TIMES } from '@/config';

export const useAlertHistory = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.ALERT_HISTORY,
    queryFn: () => fetchAlertHistory(20),
    enabled,
    staleTime: FEATURE_STALE_TIMES.SECURITY,
  });
};
