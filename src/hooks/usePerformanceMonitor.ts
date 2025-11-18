/**
 * usePerformanceMonitor Hook
 * 
 * React hook for initializing and managing performance monitoring
 */

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/performance';
import { storePerformanceMetric } from '@/services/performanceService';

/**
 * Initialize performance monitoring for the application
 * Tracks Core Web Vitals and stores them in the database
 */
export function usePerformanceMonitor() {
  useEffect(() => {
    // Initialize Web Vitals tracking
    initWebVitals((metric) => {
      // Store metric in database
      storePerformanceMetric(metric);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
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
