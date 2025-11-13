import { useQuery } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { logger } from '@/lib/logger';
import { QUERY_KEYS, FEATURE_STALE_TIMES } from '@/config';

interface UsePerformanceMetricsParams {
  startDate: Date;
  endDate: Date;
  metricName?: string;
  url?: string;
}

export function usePerformanceMetrics(params: UsePerformanceMetricsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE_METRICS(params),
    queryFn: async () => {
      try {
        return await performanceService.getMetrics(params);
      } catch (error) {
        logger.error('Failed to fetch performance metrics', error, params);
        throw error;
      }
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: FEATURE_STALE_TIMES.PERFORMANCE,
  });
}

export function usePerformanceSummary(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE_SUMMARY(startDate.toISOString(), endDate.toISOString()),
    queryFn: async () => {
      try {
        return await performanceService.getSummary({ startDate, endDate });
      } catch (error) {
        logger.error('Failed to fetch performance summary', error);
        throw error;
      }
    },
    refetchInterval: 30000,
    staleTime: FEATURE_STALE_TIMES.PERFORMANCE,
  });
}

export function useSlowOperations(startDate: Date, endDate: Date, limit: number = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.SLOW_OPERATIONS(startDate.toISOString(), endDate.toISOString(), limit),
    queryFn: async () => {
      try {
        return await performanceService.getSlowest({ startDate, endDate, limit });
      } catch (error) {
        logger.error('Failed to fetch slow operations', error);
        throw error;
      }
    },
    refetchInterval: 30000,
    staleTime: FEATURE_STALE_TIMES.PERFORMANCE,
  });
}
