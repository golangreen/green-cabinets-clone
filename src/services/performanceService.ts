/**
 * Performance Service
 * 
 * Handles storing and retrieving performance metrics from the database
 */

import { supabase } from '@/integrations/supabase/client';
import type { PerformanceMetric } from '@/lib/performance';

/**
 * Store a performance metric in the database
 */
export async function storePerformanceMetric(metric: PerformanceMetric) {
  try {
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        metric_name: metric.name,
        metric_value: metric.value,
        timestamp: new Date(metric.timestamp).toISOString(),
        url: metric.url,
        metadata: metric.metadata || {},
        connection_type: (navigator as any).connection?.effectiveType || null,
        device_memory: (navigator as any).deviceMemory || null,
        user_agent: navigator.userAgent,
      });

    if (error) {
      console.error('Failed to store performance metric:', error);
    }
  } catch (err) {
    console.error('Error storing performance metric:', err);
  }
}

/**
 * Get performance metrics for a specific time range
 */
export async function getPerformanceMetrics(
  startDate: Date,
  endDate: Date,
  metricNames?: string[]
) {
  try {
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (metricNames && metricNames.length > 0) {
      query = query.in('metric_name', metricNames);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching performance metrics:', err);
    return [];
  }
}

/**
 * Get average metrics for the last N days
 */
export async function getAverageMetrics(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('metric_name, metric_value')
      .gte('timestamp', startDate.toISOString());

    if (error) throw error;

    // Calculate averages by metric name
    const metricGroups = (data || []).reduce((acc, item) => {
      if (!acc[item.metric_name]) {
        acc[item.metric_name] = [];
      }
      acc[item.metric_name].push(item.metric_value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(metricGroups).map(([name, values]) => ({
      name,
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    }));
  } catch (err) {
    console.error('Error fetching average metrics:', err);
    return [];
  }
}

/**
 * Get metrics grouped by URL
 */
export async function getMetricsByUrl(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('url, metric_name, metric_value')
      .gte('timestamp', startDate.toISOString());

    if (error) throw error;

    // Group by URL
    const urlGroups = (data || []).reduce((acc, item) => {
      if (!acc[item.url]) {
        acc[item.url] = {};
      }
      if (!acc[item.url][item.metric_name]) {
        acc[item.url][item.metric_name] = [];
      }
      acc[item.url][item.metric_name].push(item.metric_value);
      return acc;
    }, {} as Record<string, Record<string, number[]>>);

    return Object.entries(urlGroups).map(([url, metrics]) => ({
      url,
      metrics: Object.entries(metrics).map(([name, values]) => ({
        name,
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
      })),
    }));
  } catch (err) {
    console.error('Error fetching metrics by URL:', err);
    return [];
  }
}

/**
 * Delete old performance metrics (cleanup)
 */
export async function cleanupOldMetrics(daysToKeep: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  try {
    const { error } = await supabase
      .from('performance_metrics')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());

    if (error) throw error;
  } catch (err) {
    console.error('Error cleaning up old metrics:', err);
  }
}
