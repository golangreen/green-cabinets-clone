/**
 * Performance Monitoring Library
 * 
 * Tracks Core Web Vitals and custom performance metrics
 * using the web-vitals library and Performance API
 */

import { onCLS, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

/**
 * Core Web Vitals thresholds
 * Based on Google's recommendations
 */
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
};

/**
 * Performance metric with metadata
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  metadata?: Record<string, any>;
}

/**
 * Callback type for performance metric reporting
 */
type MetricCallback = (metric: PerformanceMetric) => void;

/**
 * Initialize Core Web Vitals tracking
 * 
 * @param callback - Function to call when a metric is recorded
 */
export function initWebVitals(callback: MetricCallback) {
  const reportMetric = (metric: Metric) => {
    callback({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.pathname,
      metadata: {
        id: metric.id,
        navigationType: metric.navigationType,
      },
    });
  };

  // Track Core Web Vitals
  onCLS(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
}

/**
 * Get performance rating based on value and thresholds
 */
export function getPerformanceRating(
  metricName: keyof typeof PERFORMANCE_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = PERFORMANCE_THRESHOLDS[metricName];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Custom performance marks for tracking specific operations
 */
export class PerformanceTracker {
  private marks: Map<string, number> = new Map();

  /**
   * Start tracking an operation
   */
  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  /**
   * End tracking and get duration
   */
  measure(name: string): number | null {
    const startTime = this.marks.get(name);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    this.marks.delete(name);
    return duration;
  }

  /**
   * Track an async operation
   */
  async trackAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.mark(name);
    try {
      const result = await operation();
      const duration = this.measure(name);
      if (duration !== null) {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
      return result;
    } catch (error) {
      this.measure(name); // Clean up mark
      throw error;
    }
  }
}

/**
 * Get connection information
 */
export function getConnectionInfo() {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection ? {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  } : null;
}

/**
 * Get device memory (if available)
 */
export function getDeviceMemory(): number | null {
  return (navigator as any).deviceMemory || null;
}

/**
 * Estimate current bundle size from loaded resources
 */
export function estimateBundleSize(): { js: number; css: number; total: number } {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  let jsSize = 0;
  let cssSize = 0;

  resources.forEach((resource) => {
    const size = resource.encodedBodySize || resource.transferSize || 0;
    if (resource.name.endsWith('.js')) {
      jsSize += size;
    } else if (resource.name.endsWith('.css')) {
      cssSize += size;
    }
  });

  return {
    js: jsSize,
    css: cssSize,
    total: jsSize + cssSize,
  };
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Global performance tracker instance
 */
export const performanceTracker = new PerformanceTracker();
