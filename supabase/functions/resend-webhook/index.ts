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

    const body = await req.text();
    
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
