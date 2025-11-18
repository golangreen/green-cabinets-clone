import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, generateRequestId } from '../_shared/logger.ts';
import { withErrorHandling } from '../_shared/errors.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface SecurityAlertRequest {
  recipient_email: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high';
  details: Record<string, any>;
}

function formatEmailDeliveryAlert(details: any): string {
  const { bounce_rate, bounced, failed, total_sent, alerts } = details;
  
  let html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">';
  html += '<h2 style="color: #dc2626;">⚠️ Email Delivery Alert</h2>';
  html += '<p>Critical email delivery issues have been detected in your system:</p>';
  
  html += '<div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">';
  html += '<h3 style="margin-top: 0; color: #991b1b;">Issues Detected:</h3>';
  html += '<ul>';
  
  if (alerts && Array.isArray(alerts)) {
    alerts.forEach((alert: string) => {
      html += `<li>${alert}</li>`;
    });
  }
  
  html += '</ul>';
  html += '</div>';
  
  html += '<h3>Statistics (Last 24 Hours):</h3>';
  html += '<table style="width: 100%; border-collapse: collapse;">';
  html += '<tr style="background: #f9fafb;">';
  html += '<td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Total Sent:</strong></td>';
  html += `<td style="padding: 12px; border: 1px solid #e5e7eb;">${total_sent}</td>`;
  html += '</tr>';
  html += '<tr>';
  html += '<td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Bounce Rate:</strong></td>';
  html += `<td style="padding: 12px; border: 1px solid #e5e7eb; color: ${bounce_rate > 5 ? '#dc2626' : '#059669'};">${bounce_rate.toFixed(2)}%</td>`;
  html += '</tr>';
  html += '<tr style="background: #f9fafb;">';
  html += '<td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Bounced:</strong></td>';
  html += `<td style="padding: 12px; border: 1px solid #e5e7eb;">${bounced}</td>`;
  html += '</tr>';
  html += '<tr>';
  html += '<td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Failed:</strong></td>';
  html += `<td style="padding: 12px; border: 1px solid #e5e7eb;">${failed}</td>`;
  html += '</tr>';
  html += '</table>';
  
  html += '<div style="margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 8px;">';
  html += '<h3 style="margin-top: 0; color: #1e40af;">Recommended Actions:</h3>';
  html += '<ul>';
  html += '<li>Review email content for potential spam triggers</li>';
  html += '<li>Check email authentication (SPF, DKIM, DMARC)</li>';
  html += '<li>Verify recipient email addresses are valid</li>';
  html += '<li>Review Resend domain configuration</li>';
  html += '<li>Check recent email logs in Admin Security dashboard</li>';
  html += '</ul>';
  html += '</div>';
  
  html += '<p style="margin-top: 24px; color: #6b7280; font-size: 14px;">This is an automated alert from your Email Delivery Monitoring system.</p>';
  html += '</div>';
  
  return html;
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
    let htmlContent: string;
    let subject: string;
    
    if (alert_type === 'email_delivery_issues') {
      subject = `⚠️ Email Delivery Alert: Issues Detected`;
      htmlContent = formatEmailDeliveryAlert(details);
    } else if (alert_type === 'webhook_retry_excessive') {
      subject = `⚠️ Webhook Retry Alert: Excessive Attempts Detected`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">⚠️ Webhook Retry Alert</h2>
          <p>Resend is retrying the same webhook event multiple times, which may indicate delivery issues or integration problems.</p>
          
          <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 16px; margin: 16px 0;">
            <h3 style="margin-top: 0; color: #9a3412;">📊 Retry Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #f9fafb;">
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Webhook ID:</strong></td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${details.svix_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Event Type:</strong></td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${details.event_type}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Retry Count:</strong></td>
                <td style="padding: 8px; border: 1px solid #e5e7eb; color: #dc2626;"><strong>${details.retry_count}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Time Window:</strong></td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${details.time_window_minutes} minutes</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>First Attempt:</strong></td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(details.first_attempt).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Last Attempt:</strong></td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(details.last_attempt).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h3 style="margin-top: 0; color: #991b1b;">🔍 Possible Causes</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Webhook endpoint returning errors or timing out</li>
              <li>Database connection issues preventing event processing</li>
              <li>Edge function errors or crashes during processing</li>
              <li>Network connectivity problems between Resend and your endpoint</li>
            </ul>
          </div>

          <div style="background: #eff6ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">✅ Recommended Actions</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Check the Admin Security Dashboard for webhook validation failures</li>
              <li>Review edge function logs for the resend-webhook function</li>
              <li>Verify database connectivity and RLS policies</li>
              <li>Check Resend dashboard for webhook delivery status</li>
              <li>Consider increasing webhook timeout settings if processing is slow</li>
            </ol>
          </div>

          <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
            <em>This alert was triggered because the same webhook event was retried ${details.retry_count} times within ${details.time_window_minutes} minutes.</em>
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">This is an automated alert from your Webhook Monitoring system.</p>
        </div>
      `;
    } else {
      subject = `🚨 Security Alert: ${alert_type}`;
      htmlContent = `
        <h2>Security Alert</h2>
        <p><strong>Type:</strong> ${alert_type}</p>
        <p><strong>Severity:</strong> ${severity}</p>
        <p><strong>Details:</strong></p>
        <pre>${JSON.stringify(details, null, 2)}</pre>
      `;
    }

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
        subject,
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
