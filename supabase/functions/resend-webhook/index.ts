import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceRoleClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';
import { withErrorHandling, ValidationError } from '../_shared/errors.ts';
import { checkRateLimit, logSecurityEvent } from '../_shared/security.ts';
import { getClientIP } from '../_shared/supabase.ts';

// Svix webhook signature verification
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  msgId: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  
  // The signed content is: svix-id.svix-timestamp.payload
  const signedContent = `${msgId}.${timestamp}.${payload}`;
  
  // Import the secret as a crypto key
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Generate the expected signature
  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedContent)
  );
  
  // Convert to base64
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
  
  // Svix sends signatures in format: "v1,signature1 v1,signature2"
  // We need to check if any of them match
  const signatures = signature.split(' ').map(s => {
    const parts = s.split(',');
    return parts.length === 2 ? parts[1] : null;
  }).filter(Boolean);
  
  // Check if any signature matches (constant-time comparison)
  for (const sig of signatures) {
    if (sig === expectedSignature) {
      return true;
    }
  }
  
  return false;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger({ functionName: 'resend-webhook' });
  const supabase = createServiceRoleClient();
  const clientIP = getClientIP(req);

  try {
    // Rate limiting: 30 requests per minute per IP
    const isRateLimited = checkRateLimit(clientIP, 30, 60000);
    
    if (isRateLimited) {
      logger.warn('Rate limit exceeded for webhook', { clientIP });
      
      await logSecurityEvent(supabase, {
        eventType: 'rate_limit_exceeded',
        clientIP,
        functionName: 'resend-webhook',
        severity: 'medium',
        details: { limit: 30, window: '60s' }
      });
      
      throw new ValidationError('Rate limit exceeded. Please try again later.');
    }

    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('RESEND_WEBHOOK_SECRET not configured');
    }

    // Get webhook signature headers
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');
    const svixId = req.headers.get('svix-id');

    if (!signature || !timestamp || !svixId) {
      logger.error('Missing webhook headers', { signature: !!signature, timestamp: !!timestamp, svixId: !!svixId });
      throw new ValidationError('Missing required webhook headers');
    }

    // Validate timestamp to prevent replay attacks (reject if older than 5 minutes)
    const webhookTimestamp = parseInt(timestamp, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestampDiff = currentTimestamp - webhookTimestamp;
    const MAX_TIMESTAMP_AGE = 300; // 5 minutes in seconds

    if (isNaN(webhookTimestamp)) {
      logger.error('Invalid timestamp format', { timestamp, svixId });
      
      await logSecurityEvent(supabase, {
        eventType: 'validation_failed',
        clientIP,
        functionName: 'resend-webhook',
        severity: 'medium',
        details: { reason: 'invalid_timestamp_format', svixId, timestamp }
      });
      
      throw new ValidationError('Invalid timestamp format');
    }

    if (timestampDiff > MAX_TIMESTAMP_AGE) {
      logger.error('Webhook timestamp too old - possible replay attack', { 
        svixId, 
        clientIP,
        timestampAge: timestampDiff,
        maxAge: MAX_TIMESTAMP_AGE 
      });
      
      await logSecurityEvent(supabase, {
        eventType: 'suspicious_activity',
        clientIP,
        functionName: 'resend-webhook',
        severity: 'high',
        details: { 
          reason: 'timestamp_too_old', 
          svixId,
          timestamp_age_seconds: timestampDiff,
          max_age_seconds: MAX_TIMESTAMP_AGE
        }
      });
      
      throw new ValidationError('Webhook timestamp too old. Possible replay attack.');
    }

    if (timestampDiff < -60) {
      // Timestamp is more than 1 minute in the future - clock skew or manipulation
      logger.error('Webhook timestamp in the future', { 
        svixId, 
        clientIP,
        timestampDiff 
      });
      
      await logSecurityEvent(supabase, {
        eventType: 'suspicious_activity',
        clientIP,
        functionName: 'resend-webhook',
        severity: 'medium',
        details: { 
          reason: 'timestamp_in_future', 
          svixId,
          timestamp_diff_seconds: timestampDiff
        }
      });
      
      throw new ValidationError('Webhook timestamp is in the future');
    }

    logger.info('Timestamp validation passed', { svixId, timestampAge: timestampDiff });

    const body = await req.text();
    
    // Check for duplicate webhook event using svix-id
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id, processed_at, retry_count, created_at')
      .eq('svix_id', svixId)
      .single();

    if (existingEvent) {
      // Increment retry count
      const newRetryCount = (existingEvent.retry_count || 0) + 1;
      
      await supabase
        .from('webhook_events')
        .update({ 
          retry_count: newRetryCount,
          processed_at: new Date().toISOString()
        })
        .eq('svix_id', svixId);
      
      logger.info('Duplicate webhook event detected - retry attempt', { 
        svixId, 
        retryCount: newRetryCount,
        originalProcessedAt: existingEvent.processed_at 
      });

      // Check for excessive retries within time window
      const { data: alertSettings } = await supabase
        .from('alert_settings')
        .select('setting_value')
        .eq('setting_key', 'webhook_retry_alert')
        .maybeSingle();

      const settings = alertSettings?.setting_value || { 
        retry_threshold: 3, 
        time_window_minutes: 10,
        enabled: true 
      };

      // Only check for alerts if enabled
      if (settings.enabled && newRetryCount >= settings.retry_threshold) {
        const timeWindowMs = settings.time_window_minutes * 60 * 1000;
        const { data: recentRetries } = await supabase
          .from('webhook_events')
          .select('retry_count, created_at')
          .eq('svix_id', svixId)
          .gte('created_at', new Date(Date.now() - timeWindowMs).toISOString())
          .single();

        // Alert if threshold exceeded within time window
        if (recentRetries) {
          logger.warn('Excessive webhook retries detected - sending alert', {
            svixId,
            retryCount: newRetryCount,
            timeWindow: `${settings.time_window_minutes} minutes`,
            threshold: settings.retry_threshold
          });

          try {
            const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
            await supabase.functions.invoke('send-security-alert', {
              headers: {
                Authorization: `Bearer ${serviceRoleKey}`
              },
              body: {
                recipient_email: Deno.env.get('ADMIN_EMAIL') || 'admin@example.com',
                alert_type: 'webhook_retry_excessive',
                severity: 'high',
                details: {
                  svix_id: svixId,
                  retry_count: newRetryCount,
                  event_type: 'resend_webhook',
                  first_attempt: existingEvent.created_at,
                  last_attempt: new Date().toISOString(),
                  time_window_minutes: settings.time_window_minutes,
                  threshold: settings.retry_threshold
                }
              }
            });
          } catch (alertError) {
            logger.error('Failed to send webhook retry alert', alertError);
          }
        }
      }
      
      // Return success for duplicate events without reprocessing
      return new Response(
        JSON.stringify({ 
          received: true, 
          duplicate: true,
          svix_id: svixId,
          retry_count: newRetryCount,
          originally_processed_at: existingEvent.processed_at 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Record this webhook event to prevent future duplicates
    const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        svix_id: svixId,
        event_type: 'resend_webhook',
        client_ip: clientIP,
        retry_count: 0
      });

    if (insertError) {
      logger.error('Failed to record webhook event for deduplication', insertError, { svixId });
      // Continue processing even if deduplication tracking fails
    } else {
      logger.info('Webhook event recorded for deduplication', { svixId });
    }
    
    // Verify the webhook signature
    const isValid = await verifyWebhookSignature(
      body,
      signature,
      timestamp,
      svixId,
      webhookSecret
    );

    if (!isValid) {
      logger.error('Invalid webhook signature', { svixId, clientIP });
      
      await logSecurityEvent(supabase, {
        eventType: 'validation_failed',
        clientIP,
        functionName: 'resend-webhook',
        severity: 'high',
        details: { reason: 'invalid_signature', svixId }
      });
      
      throw new ValidationError('Invalid webhook signature');
    }

    logger.info('Webhook signature verified successfully', { svixId });
    
    // Parse webhook payload
    const payload = JSON.parse(body);
    const { type, data } = payload;

    logger.info('Received webhook event', { type, emailId: data?.email_id });

    // Map Resend event types to our status
    const statusMap: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.delivery_delayed': 'delayed',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.opened': 'opened',
      'email.clicked': 'clicked'
    };

    const status = statusMap[type] || 'unknown';

    if (data?.email_id) {
      // Check if log entry already exists for this email_id
      const { data: existing } = await supabase
        .from('email_delivery_log')
        .select('id, status')
        .eq('email_id', data.email_id)
        .single();

      if (existing) {
        // Update existing log with new status
        await supabase
          .from('email_delivery_log')
          .update({
            status: status,
            event_data: data,
            updated_at: new Date().toISOString()
          })
          .eq('email_id', data.email_id);

        logger.info('Updated email delivery log', { 
          emailId: data.email_id, 
          status,
          previousStatus: existing.status
        });
      } else {
        // Create new log entry if it doesn't exist
        // This handles cases where webhook arrives before our initial log
        await supabase
          .from('email_delivery_log')
          .insert({
            email_id: data.email_id,
            recipient_email: data.to || 'unknown',
            email_type: 'unknown',
            subject: data.subject || '',
            status: status,
            event_data: data
          });

        logger.info('Created email delivery log from webhook', { 
          emailId: data.email_id, 
          status 
        });
      }
    }

    logger.info('Email delivery status updated', { emailId: data.email_id, status });

    // Trigger email health check on bounce or failure events
    if (status === 'bounced' || status === 'failed') {
      logger.info('Triggering email health check due to delivery issue', { status });
      try {
        // Use service role authorization for automated health check
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        await supabase.functions.invoke('check-email-health', {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`
          }
        });
      } catch (healthCheckError) {
        logger.error('Failed to trigger email health check', healthCheckError);
        // Don't fail the webhook if health check fails
      }
    }

    return new Response(
      JSON.stringify({ received: true, type, status }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    logger.error('Error processing webhook', error);
    throw error;
  }
};

serve(withErrorHandling(handler));
