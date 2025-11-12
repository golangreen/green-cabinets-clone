/**
 * Performance Service
 * Handles storing and retrieving performance metrics
 */

import { supabase } from '@/integrations/supabase/client';
import type { PerformanceMetric, PerformanceReport } from '@/types/performance';
import { logger } from '@/lib/logger';

class PerformanceService {
  /**
   * Record a performance metric
   */
  async recordMetric(metric: Omit<PerformanceMetric, 'id'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('performance_metrics')
        .insert({
          ...metric,
          user_id: user?.id,
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to record metric', { error, metric });
      throw error;
    }
  }

  /**
   * Get performance metrics for a time period
   */
  async getMetrics(params: {
    startDate: Date;
    endDate: Date;
    metricName?: string;
    url?: string;
  }): Promise<PerformanceMetric[]> {
    try {
      let query = supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', params.startDate.toISOString())
        .lte('timestamp', params.endDate.toISOString())
        .order('timestamp', { ascending: false });

      if (params.metricName) {
        query = query.eq('metric_name', params.metricName);
      }

      if (params.url) {
        query = query.eq('url', params.url);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as PerformanceMetric[];
    } catch (error) {
      logger.error('Failed to get metrics', { error, params });
      throw error;
    }
  }

  /**
   * Get performance summary statistics
   */
  async getSummary(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<PerformanceReport> {
    try {
      const metrics = await this.getMetrics(params);
      
      const grouped = metrics.reduce((acc, metric) => {
        if (!acc[metric.metric_name]) {
          acc[metric.metric_name] = [];
        }
        acc[metric.metric_name].push(metric.metric_value);
        return acc;
      }, {} as Record<string, number[]>);

      const report: PerformanceReport = {
        period: `${params.startDate.toISOString()} - ${params.endDate.toISOString()}`,
        metrics: {},
        regressions: [],
      };

      Object.entries(grouped).forEach(([name, values]) => {
        const sorted = [...values].sort((a, b) => a - b);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        
        report.metrics[name] = {
          avg,
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p75: sorted[Math.floor(sorted.length * 0.75)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          count: values.length,
        };
      });

      return report;
    } catch (error) {
      logger.error('Failed to get summary', { error, params });
      throw error;
    }
  }

  /**
   * Get slowest operations
   */
  async getSlowest(params: {
    startDate: Date;
    endDate: Date;
    limit?: number;
  }): Promise<PerformanceMetric[]> {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', params.startDate.toISOString())
        .lte('timestamp', params.endDate.toISOString())
        .order('metric_value', { ascending: false })
        .limit(params.limit || 10);

      if (error) throw error;
      return (data || []) as PerformanceMetric[];
    } catch (error) {
      logger.error('Failed to get slowest operations', { error, params });
      throw error;
    }
  }

  /**
   * Delete old metrics (cleanup)
   */
  async cleanupOldMetrics(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error, count } = await supabase
        .from('performance_metrics')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (error) throw error;

      logger.info('Cleaned up old metrics', { count, daysToKeep });
      return count || 0;
    } catch (error) {
      logger.error('Failed to cleanup old metrics', { error, daysToKeep });
      throw error;
    }
  }
}

export const performanceService = new PerformanceService();
