import { createServiceRoleClient, createAuthenticatedClient } from '../_shared/supabase.ts';
import { createLogger } from '../_shared/logger.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { ValidationError } from '../_shared/errors.ts';

const logger = createLogger({ functionName: 'check-email-health' });

interface EmailStats {
  total_sent: number;
  total_delivered: number;
  total_bounced: number;
  total_failed: number;
  bounce_rate: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new ValidationError('Authorization required');
    }

    // Check if this is a service role key (for automated calls) or user JWT
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const isServiceRole = authHeader === `Bearer ${serviceRoleKey}`;

    if (!isServiceRole) {
      // For user JWT, verify admin role
      const authSupabase = await createAuthenticatedClient(authHeader);
      const { data: { user }, error: authError } = await authSupabase.auth.getUser();

      if (authError || !user) {
        logger.error("Authentication failed", authError);
        throw new ValidationError('Authentication failed');
      }

      // Verify admin role
      const { data: isAdmin, error: roleError } = await authSupabase.rpc('has_role', { 
        _user_id: user.id, 
        _role: 'admin' 
      });

      if (roleError) {
        logger.error("Error checking admin role", roleError);
        throw new ValidationError('Role verification failed');
      }

      if (!isAdmin) {
        logger.warn("Unauthorized access attempt to check-email-health", { userId: user.id });
        throw new ValidationError('Admin access required');
      }

      logger.info('Admin access verified - checking email delivery health metrics', { userId: user.id });
    } else {
      logger.info('Service role access verified - checking email delivery health metrics (automated)');
    }
    
    // Use service role client for database operations
    const supabase = createServiceRoleClient();

    // Get email stats for last 24 hours
    const { data: stats, error: statsError } = await supabase
      .rpc('get_email_delivery_stats', { days_back: 1 });

    if (statsError) {
      logger.error('Failed to fetch email stats', statsError);
      throw statsError;
    }

    const emailStats = stats?.[0] as EmailStats;
    
    if (!emailStats || emailStats.total_sent === 0) {
      logger.info('No emails sent in last 24 hours, skipping health check');
      return new Response(
        JSON.stringify({ message: 'No emails to check' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bounceRate = emailStats.bounce_rate || 0;
    const failureCount = emailStats.total_failed || 0;
    const bouncedCount = emailStats.total_bounced || 0;
    
    logger.info('Email health metrics', {
      bounceRate,
      failureCount,
      bouncedCount,
      totalSent: emailStats.total_sent
    });

    const alerts: string[] = [];

    // Check bounce rate threshold (5%)
    if (bounceRate > 5) {
      const message = `⚠️ High bounce rate detected: ${bounceRate.toFixed(2)}% (${bouncedCount} bounces out of ${emailStats.total_sent} emails in last 24h)`;
      alerts.push(message);
      
      await supabase.from('alert_history').insert({
        alert_type: 'high_bounce_rate',
        details: {
          bounce_rate: bounceRate,
          bounced: bouncedCount,
          total_sent: emailStats.total_sent,
          threshold: 5
        }
      });
    }

    // Check for critical failures (more than 3 failures)
    if (failureCount > 3) {
      const message = `🚨 Critical delivery failures detected: ${failureCount} failed deliveries in last 24h`;
      alerts.push(message);
      
      await supabase.from('alert_history').insert({
        alert_type: 'critical_delivery_failures',
        details: {
          failed_count: failureCount,
          total_sent: emailStats.total_sent,
          threshold: 3
        }
      });
    }

    // Send alerts to admins if any issues detected
    if (alerts.length > 0) {
      logger.info('Sending email health alerts to admins', { alertCount: alerts.length });
      
      // Get all admin users
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminRoles && adminRoles.length > 0) {
        const adminIds = adminRoles.map(r => r.user_id);
        
        const { data: adminUsers } = await supabase.auth.admin.listUsers();
        const adminEmails = adminUsers.users
          .filter(u => adminIds.includes(u.id))
          .map(u => u.email)
          .filter(Boolean);

        // Send alert email to each admin
        for (const email of adminEmails) {
          try {
            await supabase.functions.invoke('send-security-alert', {
              body: {
                recipient_email: email,
                alert_type: 'email_delivery_issues',
                severity: bounceRate > 10 ? 'high' : 'medium',
                details: {
                  bounce_rate: bounceRate,
                  bounced: bouncedCount,
                  failed: failureCount,
                  total_sent: emailStats.total_sent,
                  alerts: alerts
                }
              }
            });
            logger.info('Alert sent to admin', { email });
          } catch (error) {
            logger.error('Failed to send alert email', error, { email });
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          alerts,
          stats: emailStats
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logger.info('Email health check passed - no issues detected');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email health check passed',
        stats: emailStats
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    logger.error('Error in check-email-health', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
