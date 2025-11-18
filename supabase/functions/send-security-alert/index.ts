import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, generateRequestId } from '../_shared/logger.ts';
import { withErrorHandling } from '../_shared/errors.ts';
import { createSecurityAlertEmail } from '../_shared/emailTemplates.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface SecurityAlertRequest {
  recipient_email: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = generateRequestId();
  const logger = createLogger({ functionName: 'send-security-alert', requestId });

  try {
    const rawData = await req.json();
    const requestData = rawData as SecurityAlertRequest;

    const { recipient_email, alert_type, severity, details } = requestData;

    logger.info('Sending security alert', { alert_type, severity });

    // Format email content based on alert type
    let subject: string;
    let summary: string;
    let tableData: Array<{ label: string; value: string }>;
    let recommendations: string[] | undefined;
    
    if (alert_type === 'email_delivery_issues') {
      subject = 'Email Delivery Issues Detected';
      summary = 'Critical email delivery issues have been detected in your system.';
      tableData = [
        { label: 'Total Sent (24h)', value: String(details.total_sent || 0) },
        { label: 'Bounce Rate', value: `${(details.bounce_rate || 0).toFixed(2)}%` },
        { label: 'Bounced', value: String(details.bounced || 0) },
        { label: 'Failed', value: String(details.failed || 0) },
      ];
      recommendations = [
        'Review email content for potential spam triggers',
        'Check email authentication (SPF, DKIM, DMARC)',
        'Verify recipient email addresses are valid',
        'Review Resend domain configuration',
        'Check recent email logs in Admin Security dashboard',
      ];
    } else if (alert_type === 'webhook_retry_excessive') {
      subject = 'Excessive Webhook Retry Attempts';
      summary = 'Resend is retrying the same webhook event multiple times, indicating potential delivery or integration issues.';
      tableData = [
        { label: 'Webhook ID', value: details.svix_id || 'N/A' },
        { label: 'Event Type', value: details.event_type || 'N/A' },
        { label: 'Retry Count', value: String(details.retry_count || 0) },
        { label: 'Time Window', value: `${details.time_window_minutes || 0} minutes` },
        { label: 'First Attempt', value: details.first_attempt ? new Date(details.first_attempt).toLocaleString() : 'N/A' },
        { label: 'Last Attempt', value: details.last_attempt ? new Date(details.last_attempt).toLocaleString() : 'N/A' },
      ];
      recommendations = [
        'Check Admin Security Dashboard for webhook validation failures',
        'Review edge function logs for resend-webhook function',
        'Verify database connectivity and RLS policies',
        'Check Resend dashboard for webhook delivery status',
        'Consider increasing webhook timeout settings if processing is slow',
      ];
    } else {
      subject = `Security Alert: ${alert_type}`;
      summary = `A security alert of type "${alert_type}" was triggered.`;
      tableData = Object.entries(details).map(([key, value]) => ({
        label: key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      }));
    }

    const htmlContent = createSecurityAlertEmail({
      alertType: alert_type,
      severity,
      summary,
      details: tableData,
      recommendations,
    });

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Security Alerts <onboarding@resend.dev>',
        to: [recipient_email],
        subject: `🚨 ${subject}`,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      logger.error('Resend API error', new Error(errorText));
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    logger.info('Security alert email sent successfully', { 
      emailId: emailResult.id, 
      alertType: alert_type 
    });

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    logger.error('Error in send-security-alert function', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

Deno.serve(withErrorHandling(handler));
