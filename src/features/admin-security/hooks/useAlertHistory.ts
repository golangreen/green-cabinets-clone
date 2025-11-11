import { useQuery } from '@tanstack/react-query';
import { fetchAlertHistory } from '@/services';

export const useAlertHistory = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['alert-history'],
    queryFn: () => fetchAlertHistory(20),
    enabled,
  });
};
