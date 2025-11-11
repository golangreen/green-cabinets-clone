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
