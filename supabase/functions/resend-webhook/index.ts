import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceRoleClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';
import { withErrorHandling } from '../_shared/errors.ts';

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger({ functionName: 'resend-webhook' });

  try {
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('RESEND_WEBHOOK_SECRET not configured');
    }

    // Verify webhook signature
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');
    const svixId = req.headers.get('svix-id');

    if (!signature || !timestamp || !svixId) {
      logger.error('Missing webhook headers');
      return new Response('Missing webhook headers', { status: 400 });
    }

    const body = await req.text();
    
    // Parse webhook payload
    const payload = JSON.parse(body);
    const { type, data } = payload;

    logger.info('Received webhook event', { type, emailId: data?.email_id });

    const supabase = createServiceRoleClient();

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
