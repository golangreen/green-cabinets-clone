import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { applyCompatibilityOverrides } from '@/lib/estimator/compatibility';
import { compatibilityRulesService } from '@/services/compatibilityRulesService';

/**
 * Fetches compatibility rules from the DB and patches the in-memory rule
 * tables so the estimator picks them up without code changes.
 * Mount once near the app root.
 */
export function useCompatibilityRulesSync() {
  const query = useQuery({
    queryKey: ['compatibility-rules'],
    queryFn: () => compatibilityRulesService.list(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      applyCompatibilityOverrides(compatibilityRulesService.toOverrides(query.data));
    }
  }, [query.data]);

  return query;
}
