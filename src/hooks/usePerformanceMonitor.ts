/**
 * usePerformanceMonitor Hook
 * 
 * React hook for initializing and managing performance monitoring
 */

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/performance';

/**
 * Initialize performance monitoring for the application
 * Tracks Core Web Vitals. Writing them to the performance_metrics table is
 * off by default: anonymous inserts are refused by the table's row-level
 * security (HTTP 401 on every page view), so the beacon only cost a
 * Supabase request. Set VITE_PERF_BEACON=true once the table accepts
 * anonymous inserts (or an edge function takes them) to turn it back on.
 */
const BEACON_ON = import.meta.env.VITE_PERF_BEACON === 'true';

export function usePerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals tracking
    initWebVitals((metric) => {
      if (BEACON_ON) void import('@/services/performanceService').then((m) => m.storePerformanceMetric(metric));

      // Log to console in development
      if (import.meta.env.DEV) {
        console.log('[Performance]', {
          name: metric.name,
          value: metric.value.toFixed(2),
          rating: metric.rating,
          url: metric.url,
        });
      }
    });
  }, []);
}
