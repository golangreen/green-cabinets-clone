import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawData = await req.json();
    const validationResult = alertSchema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: validationResult.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      console.error('Resend API error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Security alert email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in send-security-alert function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
