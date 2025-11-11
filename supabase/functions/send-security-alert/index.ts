import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { handleCorsPreFlight, createCorsResponse, createCorsErrorResponse } from "../_shared/cors.ts";
import { createServiceRoleClient, createAuthenticatedClient } from "../_shared/supabase.ts";
import { createLogger, generateRequestId } from "../_shared/logger.ts";
import { withErrorHandling, ValidationError, AuthorizationError } from "../_shared/errors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

const alertSchema = z.object({
  type: z.enum(['ip_blocked', 'ip_unblocked', 'critical_event']),
  ipAddress: z.string().optional(),
  reason: z.string().optional(),
  blockedUntil: z.string().optional(),
  eventDetails: z.object({
    event_type: z.string().optional(),
    severity: z.string().optional(),
    function_name: z.string().optional(),
  }).optional(),
});

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  const requestId = generateRequestId();
  const logger = createLogger({ functionName: 'send-security-alert', requestId });

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new AuthorizationError('Missing authorization header');
    }

    const supabase = createAuthenticatedClient(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn("Unauthorized access attempt");
      throw new AuthorizationError('Unauthorized');
    }

    // Verify admin role
    const serviceSupabase = createServiceRoleClient();
    const { data: isAdmin } = await serviceSupabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      logger.warn("Non-admin user attempted to send security alert", { userId: user.id });
      throw new AuthorizationError('Admin access required');
    }

    logger.info("Admin user sending security alert", { userId: user.id });

    const rawData = await req.json();
    const validationResult = alertSchema.safeParse(rawData);

    if (!validationResult.success) {
      logger.error("Validation error", validationResult.error);
      throw new ValidationError('Invalid request data', { errors: validationResult.error.errors });
    }

    const alertData = validationResult.data;

    // Generate email content based on alert type
    let subject = '';
    let htmlContent = '';

    switch (alertData.type) {
      case 'ip_blocked':
        subject = '🛡️ Security Alert: IP Address Blocked';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">IP Address Blocked</h1>
            <p>An IP address has been blocked from accessing your application.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p><strong>IP Address:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${alertData.ipAddress}</code></p>
              <p><strong>Reason:</strong> ${alertData.reason}</p>
              <p><strong>Blocked Until:</strong> ${alertData.blockedUntil ? new Date(alertData.blockedUntil).toLocaleString() : 'Permanent'}</p>
            </div>
            <p>This action was performed from the admin security dashboard.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
              You can manage blocked IPs from your <a href="${SUPABASE_URL.replace('https://mczagaaiyzbhjvtrojia.supabase.co', 'https://yourapp.com')}/admin/security" style="color: #2563eb;">Security Dashboard</a>.
            </p>
          </div>
        `;
        break;

      case 'ip_unblocked':
        subject = '✅ Security Alert: IP Address Unblocked';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">IP Address Unblocked</h1>
            <p>An IP address has been unblocked and can now access your application.</p>
            <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p><strong>IP Address:</strong> <code style="background-color: #dcfce7; padding: 2px 6px; border-radius: 4px;">${alertData.ipAddress}</code></p>
              <p><strong>Reason:</strong> ${alertData.reason || 'Manual unblock from admin dashboard'}</p>
            </div>
            <p>This action was performed from the admin security dashboard.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
              Monitor security events from your <a href="${SUPABASE_URL.replace('https://mczagaaiyzbhjvtrojia.supabase.co', 'https://yourapp.com')}/admin/security" style="color: #2563eb;">Security Dashboard</a>.
            </p>
          </div>
        `;
        break;

      case 'critical_event':
        subject = '🚨 Critical Security Event Detected';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Critical Security Event</h1>
            <p>A critical security event has been detected in your application.</p>
            <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p><strong>Event Type:</strong> ${alertData.eventDetails?.event_type || 'Unknown'}</p>
              <p><strong>Severity:</strong> <span style="color: #dc2626; font-weight: bold;">${alertData.eventDetails?.severity?.toUpperCase() || 'CRITICAL'}</span></p>
              <p><strong>Function:</strong> ${alertData.eventDetails?.function_name || 'N/A'}</p>
              ${alertData.ipAddress ? `<p><strong>IP Address:</strong> <code style="background-color: #fee2e2; padding: 2px 6px; border-radius: 4px;">${alertData.ipAddress}</code></p>` : ''}
            </div>
            <p style="color: #dc2626; font-weight: bold;">⚠️ Immediate attention required!</p>
            <p>Please review this event in your security dashboard and take appropriate action.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
              View details in your <a href="${SUPABASE_URL.replace('https://mczagaaiyzbhjvtrojia.supabase.co', 'https://yourapp.com')}/admin/security" style="color: #2563eb;">Security Dashboard</a>.
            </p>
          </div>
        `;
        break;
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Green Cabinets Security <security@resend.dev>',
        to: ['info@greencabinets.com'],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      logger.error('Resend API error', new Error(errorText));
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    logger.info('Security alert email sent successfully', { emailId: emailResult.id, alertType: alertData.type });

    return createCorsResponse({ success: true, emailId: emailResult.id }, 200);

  } catch (error: any) {
    logger.error('Error in send-security-alert function', error);
    throw error;
  }
};

serve(withErrorHandling(handler, (message, error) => {
  const logger = createLogger({ functionName: 'send-security-alert' });
  logger.error(message, error);
}));
