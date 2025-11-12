import { useQuery } from '@tanstack/react-query';
import { performanceService } from '@/services/performanceService';
import { logger } from '@/lib/logger';

interface UsePerformanceMetricsParams {
  startDate: Date;
  endDate: Date;
  metricName?: string;
  url?: string;
}

export function usePerformanceMetrics(params: UsePerformanceMetricsParams) {
  return useQuery({
    queryKey: ['performance-metrics', params],
    queryFn: async () => {
      try {
        return await performanceService.getMetrics(params);
      } catch (error) {
        logger.error('Failed to fetch performance metrics', error, params);
        throw error;
      }
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

export function usePerformanceSummary(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['performance-summary', startDate, endDate],
    queryFn: async () => {
      try {
        return await performanceService.getSummary({ startDate, endDate });
      } catch (error) {
        logger.error('Failed to fetch performance summary', error);
        throw error;
      }
    },
    refetchInterval: 30000,
  });
}

export function useSlowOperations(startDate: Date, endDate: Date, limit: number = 10) {
  return useQuery({
    queryKey: ['slow-operations', startDate, endDate, limit],
    queryFn: async () => {
      try {
        return await performanceService.getSlowest({ startDate, endDate, limit });
      } catch (error) {
        logger.error('Failed to fetch slow operations', error);
        throw error;
      }
    },
    refetchInterval: 30000,
  });
}
