import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger, generateRequestId } from '../_shared/logger.ts';
import { ValidationError, withErrorHandling } from '../_shared/errors.ts';
import { createAuthenticatedClient, createServiceRoleClient } from '../_shared/supabase.ts';

const notificationSchema = z.object({
  userEmail: z.string().email(),
  action: z.enum(['assigned', 'removed']),
  role: z.enum(['admin', 'moderator', 'user']),
  performedBy: z.string().email(),
});

const getRolePermissions = (role: string): string[] => {
  const permissions: Record<string, string[]> = {
    admin: [
      'Full access to admin dashboard and security settings',
      'Manage user roles and permissions',
      'View and manage security events and blocked IPs',
      'Access audit logs and system monitoring',
      'Configure application settings',
    ],
    moderator: [
      'Access to moderation tools',
      'Review and manage user-generated content',
      'View security events and reports',
      'Assist with user management tasks',
    ],
    user: [
      'Access to all standard features',
      'Create and manage personal content',
      'Use designer tools and configurators',
      'Submit quotes and contact requests',
    ],
  };
  
  return permissions[role] || [];
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = generateRequestId();
  const logger = createLogger({ 
    functionName: 'send-role-notification',
    requestId 
  });
  logger.info('Role notification request received');

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new ValidationError('Missing authorization header');
    }

    const supabase = await createAuthenticatedClient(authHeader);

    // Verify user is authenticated and is admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new ValidationError('Unauthorized');
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      throw new ValidationError('Admin access required');
    }

    // Parse and validate request body
    const body = await req.json();
    const { userEmail, action, role, performedBy } = notificationSchema.parse(body);

    logger.info('Sending role notification', { userEmail, action, role });

    // Build email content
    const permissions = getRolePermissions(role);
    const permissionsList = permissions.map(p => `<li>${p}</li>`).join('');

    const subject = action === 'assigned' 
      ? `You've been granted ${role} access`
      : `Your ${role} role has been removed`;

    const htmlContent = action === 'assigned' ? `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">Role Assignment Notification</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Hello,
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          You have been assigned the <strong>${role}</strong> role by ${performedBy}.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-top: 24px;">
          <strong>Your new permissions include:</strong>
        </p>
        <ul style="color: #555; font-size: 16px; line-height: 1.8; margin-top: 12px;">
          ${permissionsList}
        </ul>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-top: 24px;">
          You can now access these features by logging into your account.
        </p>
        <p style="color: #999; font-size: 14px; margin-top: 32px;">
          If you have questions about your new role, please contact an administrator.
        </p>
      </div>
    ` : `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">Role Removal Notification</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Hello,
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Your <strong>${role}</strong> role has been removed by ${performedBy}.
        </p>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-top: 24px;">
          You no longer have access to the following features:
        </p>
        <ul style="color: #555; font-size: 16px; line-height: 1.8; margin-top: 12px;">
          ${permissionsList}
        </ul>
        <p style="color: #999; font-size: 14px; margin-top: 32px;">
          If you believe this was done in error, please contact an administrator.
        </p>
      </div>
    `;

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Green Cabinets <onboarding@resend.dev>',
        to: [userEmail],
        subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      logger.error('Failed to send email', { error: errorText });
      throw new Error(`Failed to send email: ${errorText}`);
    }

    logger.info('Role notification email sent successfully', { userEmail });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    logger.error('Error sending role notification', { error: error.message });
    throw error;
  }
};

serve(withErrorHandling(handler));
