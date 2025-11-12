/**
 * Performance Monitoring Library
 * Tracks Web Vitals and custom performance marks
 */

import { onCLS, onFID, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { performanceService } from '@/services/performanceService';
import { logger } from '@/lib/logger';
import type { WebVitalsMetric, CustomMark } from '@/types/performance';

const performanceLogger = logger.createLogger('performance');

// Performance budgets (in milliseconds, except CLS which is unitless)
export const PERFORMANCE_BUDGETS = {
  LCP: 2500,  // Good: < 2.5s
  FID: 100,   // Good: < 100ms
  CLS: 0.1,   // Good: < 0.1
  TTFB: 800,  // Good: < 800ms
  INP: 200,   // Good: < 200ms
};

/**
 * Get performance rating based on metric value
 */
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const budget = PERFORMANCE_BUDGETS[name as keyof typeof PERFORMANCE_BUDGETS];
  if (!budget) return 'good';
  
  if (name === 'CLS') {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }
  
  if (value <= budget) return 'good';
  if (value <= budget * 1.5) return 'needs-improvement';
  return 'poor';
}

/**
 * Handle Web Vitals metric
 */
function handleMetric(metric: Metric) {
  const webVitalsMetric: WebVitalsMetric = {
    name: metric.name as any,
    value: metric.value,
    rating: getMetricRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
  };

  performanceLogger.info('Web Vitals metric collected', {
    metric: webVitalsMetric,
    url: window.location.href,
  });

  // Send to backend (non-blocking)
  performanceService.recordMetric({
    metric_name: metric.name,
    metric_value: metric.value,
    url: window.location.href,
    user_agent: navigator.userAgent,
    connection_type: (navigator as any).connection?.effectiveType,
    device_memory: (navigator as any).deviceMemory,
    timestamp: new Date().toISOString(),
    metadata: {
      rating: webVitalsMetric.rating,
      id: metric.id,
    },
  }).catch(error => {
    performanceLogger.error('Failed to record metric', { error, metric: metric.name });
  });
}

/**
 * Initialize Web Vitals tracking
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  try {
    onCLS(handleMetric);
    onFID(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);

    performanceLogger.info('Performance monitoring initialized');
  } catch (error) {
    performanceLogger.error('Failed to initialize performance monitoring', { error });
  }
}

/**
 * Create custom performance mark
 */
export function markPerformance(name: string, metadata?: Record<string, any>): CustomMark {
  const startTime = performance.now();
  performance.mark(name);

  const mark: CustomMark = {
    name,
    startTime,
    metadata,
  };

  performanceLogger.debug('Performance mark created', { mark });
  return mark;
}

/**
 * Measure duration between two marks
 */
export function measurePerformance(
  name: string,
  startMark: string,
  endMark?: string,
  metadata?: Record<string, any>
): number {
  try {
    if (!endMark) {
      performance.mark(`${startMark}-end`);
      endMark = `${startMark}-end`;
    }

    const measure = performance.measure(name, startMark, endMark);
    const duration = measure.duration;

    performanceLogger.info('Performance measured', {
      name,
      duration,
      metadata,
    });

    // Record custom metric (non-blocking)
    performanceService.recordMetric({
      metric_name: `custom_${name}`,
      metric_value: duration,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      metadata,
    }).catch(error => {
      performanceLogger.error('Failed to record custom metric', { error, name });
    });

    return duration;
  } catch (error) {
    performanceLogger.error('Failed to measure performance', { error, name });
    return 0;
  }
}

/**
 * Wrap async operation with performance tracking
 */
export async function trackOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startMark = `${operationName}-start`;
  markPerformance(startMark, metadata);

  try {
    const result = await operation();
    measurePerformance(operationName, startMark, undefined, {
      ...metadata,
      success: true,
    });
    return result;
  } catch (error) {
    measurePerformance(operationName, startMark, undefined, {
      ...metadata,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Get navigation timing metrics
 */
export function getNavigationMetrics() {
  if (typeof window === 'undefined' || !window.performance) return null;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return null;

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    load: navigation.loadEventEnd - navigation.loadEventStart,
    total: navigation.loadEventEnd - navigation.fetchStart,
  };
}
