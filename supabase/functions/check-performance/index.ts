import { createServiceRoleClient, createAuthenticatedClient } from '../_shared/supabase.ts';
import { createLogger, generateRequestId } from '../_shared/logger.ts';
import { withErrorHandling, ValidationError } from '../_shared/errors.ts';

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

  const requestId = generateRequestId();
  const logger = createLogger({ functionName: 'check-performance', requestId });
  logger.info('Starting performance check');

  try {
    // Check for service role or admin authentication
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Allow service role for cron jobs
    const isServiceRole = authHeader?.includes(serviceRoleKey || 'invalid');
    
    let supabase;
    
    if (isServiceRole) {
      // Service role call (from cron)
      supabase = createServiceRoleClient();
      logger.info('Service role authentication verified');
    } else {
      // User call - must be admin
      if (!authHeader) {
        throw new ValidationError('Authorization required');
      }
      
      supabase = await createAuthenticatedClient(authHeader);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        logger.warn('Authentication failed', { authError });
        throw new ValidationError('Invalid authentication');
      }
      
      // Verify admin role
      const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (roleError || !isAdmin) {
        logger.warn('Admin authorization failed', { userId: user.id, roleError });
        throw new ValidationError('Admin access required');
      }
      
      logger.info('Admin authentication verified', { userId: user.id });
    }

    // Query performance metrics from the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: metrics, error } = await supabase
      .from('performance_metrics')
      .select('metric_name, metric_value')
      .gte('timestamp', oneHourAgo);

    if (error) {
      logger.error('Failed to fetch performance metrics', error);
      throw error;
    }

    if (!metrics || metrics.length === 0) {
      logger.info('No performance metrics found in the last hour');
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
      totalMetrics: metrics.length,
      violations: violations.length 
    });

    // Send alerts if violations found
    if (violations.length > 0) {
      logger.warn('Performance budget violations detected', { 
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
        logger.error('Failed to send performance alert', alertResponse.error);
      } else {
        logger.info('Performance alert sent successfully');
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
    const logger = createLogger({ functionName: 'check-performance' });
    logger.error('Performance check failed', error);
    throw error;
  }
};

Deno.serve(withErrorHandling(handler));
