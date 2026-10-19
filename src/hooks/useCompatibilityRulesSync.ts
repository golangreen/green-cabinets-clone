import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { applyCompatibilityOverrides } from '@/lib/estimator/compatibility';
import { compatibilityRulesService } from '@/services/compatibilityRulesService';

/**
 * Fetches compatibility rules from the DB and patches the in-memory rule
 * tables so the estimator picks them up without code changes.
 * Called by the estimator components that read the rules (FinishPicker,
 * OrderStep) rather than at the app root, so marketing pages make no
 * Supabase request. React Query shares one fetch between callers.
 */
export function useCompatibilityRulesSync() {
  const query = useQuery({
    queryKey: ['compatibility-rules'],
    queryFn: () => compatibilityRulesService.list(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Patch the tables before this render reads them (idempotent per data set).
  const applied = useRef<unknown>(null);
  if (query.data && applied.current !== query.data) {
    applied.current = query.data;
    applyCompatibilityOverrides(compatibilityRulesService.toOverrides(query.data));
  }

  return query;
}
