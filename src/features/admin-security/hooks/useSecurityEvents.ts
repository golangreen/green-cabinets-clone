import { useQuery } from '@tanstack/react-query';
import { fetchSecurityEvents } from '@/services';

export const useSecurityEvents = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['security-events'],
    queryFn: () => fetchSecurityEvents(60 * 24 * 7), // Last 7 days
    enabled,
  });
};
