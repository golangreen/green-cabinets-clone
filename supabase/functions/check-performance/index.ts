import { createServiceRoleClient } from '../_shared/supabase.ts';
import { createLogger } from '../_shared/logger.ts';
import { withErrorHandling } from '../_shared/errors.ts';

const logger = createLogger('check-performance');

// Performance budgets (in milliseconds for timing metrics)
const PERFORMANCE_BUDGETS = {
  LCP: 2500,    // Largest Contentful Paint
  CLS: 0.1,     // Cumulative Layout Shift (unitless)
  INP: 200,     // Interaction to Next Paint
  TTFB: 800,    // Time to First Byte
  'checkout-create': 3000,  // Checkout operation
  'product-catalog-fetch': 2000,
  'cart-add-item': 1000,
} as const;

interface PerformanceViolation {
  metric_name: string;
  average_value: number;
  budget: number;
  violation_percentage: number;
  sample_count: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = logger.generateRequestId();
  logger.info('Starting performance check', { requestId });

  try {
    const supabase = createServiceRoleClient();

    // Query performance metrics from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: metrics, error } = await supabase
      .from('performance_metrics')
      .select('metric_name, metric_value')
      .gte('timestamp', oneHourAgo);

    if (error) {
      logger.error('Failed to fetch performance metrics', { error, requestId });
      throw error;
    }

    if (!metrics || metrics.length === 0) {
      logger.info('No performance metrics found in the last hour', { requestId });
      return new Response(
        JSON.stringify({ 
          message: 'No metrics to check',
          checked_at: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Group metrics by name and calculate averages
    const metricGroups = metrics.reduce((acc, metric) => {
      if (!acc[metric.metric_name]) {
        acc[metric.metric_name] = [];
      }
      acc[metric.metric_name].push(metric.metric_value);
      return acc;
    }, {} as Record<string, number[]>);

    const violations: PerformanceViolation[] = [];

    // Check each metric against its budget
    Object.entries(metricGroups).forEach(([metricName, values]) => {
      const budget = PERFORMANCE_BUDGETS[metricName as keyof typeof PERFORMANCE_BUDGETS];
      
      if (!budget) {
        return; // Skip metrics without defined budgets
      }

      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      if (average > budget) {
        const violationPercentage = ((average - budget) / budget) * 100;
        violations.push({
          metric_name: metricName,
          average_value: average,
          budget,
          violation_percentage: violationPercentage,
          sample_count: values.length,
        });
      }
    });

    logger.info('Performance check completed', { 
      requestId, 
      totalMetrics: metrics.length,
      violations: violations.length 
    });

    // Send alerts if violations found
    if (violations.length > 0) {
      logger.warn('Performance budget violations detected', { 
        requestId, 
        violations 
      });

      // Call send-security-alert function
      const alertResponse = await supabase.functions.invoke('send-security-alert', {
        body: {
          alert_type: 'performance_degradation',
          severity: 'high',
          details: {
            violations,
            check_period: '1 hour',
            checked_at: new Date().toISOString(),
          },
        },
      });

      if (alertResponse.error) {
        logger.error('Failed to send performance alert', { 
          error: alertResponse.error, 
          requestId 
        });
      } else {
        logger.info('Performance alert sent successfully', { requestId });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked_at: new Date().toISOString(),
        metrics_analyzed: metrics.length,
        violations_found: violations.length,
        violations: violations.length > 0 ? violations : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    logger.error('Performance check failed', { error, requestId });
    throw error;
  }
};

Deno.serve(withErrorHandling(handler));
