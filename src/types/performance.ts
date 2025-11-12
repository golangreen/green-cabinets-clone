/**
 * Performance Monitoring Types
 */

export type MetricName = 
  | 'LCP'  // Largest Contentful Paint
  | 'FID'  // First Input Delay
  | 'CLS'  // Cumulative Layout Shift
  | 'TTFB' // Time to First Byte
  | 'INP'  // Interaction to Next Paint
  | 'custom'; // Custom performance marks

export interface PerformanceMetric {
  id?: string;
  user_id?: string;
  metric_name: string;
  metric_value: number;
  url: string;
  user_agent?: string;
  connection_type?: string;
  device_memory?: number;
  timestamp: string;
  metadata?: Record<string, any> | null;
  created_at?: string;
}

export interface WebVitalsMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export interface CustomMark {
  name: string;
  startTime: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceBudget {
  LCP: number;
  FID: number;
  CLS: number;
  TTFB: number;
  INP: number;
}

export interface PerformanceReport {
  period: string;
  metrics: {
    [key: string]: {
      avg: number;
      p50: number;
      p75: number;
      p95: number;
      count: number;
    };
  };
  regressions: Array<{
    metric: string;
    change: number;
    threshold: number;
  }>;
}
