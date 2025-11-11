import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceRoleClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';
import { withErrorHandling } from '../_shared/errors.ts';

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger({ functionName: 'check-role-expiration' });
  logger.info('Checking for expiring and expired roles');

  try {
    const supabase = createServiceRoleClient();
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Get roles expiring within 24 hours
    const { data: expiringRoles, error: expiringError } = await supabase
      .rpc('get_expiring_roles', { hours_before: 24 });

    if (expiringError) {
      logger.error('Failed to fetch expiring roles', expiringError);
      throw expiringError;
    }

    logger.info('Found expiring roles', { count: expiringRoles?.length || 0 });

    // Send reminder emails for expiring roles
    if (expiringRoles && expiringRoles.length > 0) {
      for (const role of expiringRoles) {
        try {
          const hoursRemaining = Math.round(role.hours_until_expiry);
          const expiryDate = new Date(role.expires_at).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });

          const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
              <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">Role Expiration Reminder</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                Hello,
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                Your <strong>${role.role}</strong> role will expire in approximately <strong>${hoursRemaining} hour(s)</strong>.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                <strong>Expiration Date:</strong> ${expiryDate}
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-top: 24px;">
                After this role expires, you will no longer have access to the associated permissions and features.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                If you need to extend this role, please contact an administrator before it expires.
              </p>
              <p style="color: #999; font-size: 14px; margin-top: 32px;">
                This is an automated reminder. If you have questions, please contact support.
              </p>
            </div>
          `;

          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Green Cabinets <onboarding@resend.dev>',
              to: [role.user_email],
              subject: `Your ${role.role} role expires soon`,
              html: htmlContent,
            }),
          });

          if (emailResponse.ok) {
            // Mark reminder as sent
            await supabase.rpc('mark_reminder_sent', {
              target_user_id: role.user_id,
              target_role: role.role
            });
            
            logger.info('Sent expiration reminder', { 
              email: role.user_email, 
              role: role.role 
            });
          } else {
            const errorText = await emailResponse.text();
            logger.error('Failed to send reminder email', { error: errorText });
          }
        } catch (emailError) {
          logger.error('Error sending reminder email', emailError);
        }
      }
    }

    // Remove expired roles
    const { data: removalResult, error: removalError } = await supabase
      .rpc('remove_expired_roles');

    if (removalError) {
      logger.error('Failed to remove expired roles', removalError);
      throw removalError;
    }

    logger.info('Expired roles processed', removalResult);

    // Get expired roles for notification
    const { data: expiredRoles, error: expiredError } = await supabase
      .rpc('get_expired_roles');

    // Send expiration notification emails
    if (expiredRoles && expiredRoles.length > 0) {
      for (const role of expiredRoles) {
        try {
          const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
              <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">Role Expired</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                Hello,
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                Your <strong>${role.role}</strong> role has expired and has been automatically removed.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5; margin-top: 24px;">
                You no longer have access to the features and permissions associated with this role.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                If you need to restore this role, please contact an administrator.
              </p>
              <p style="color: #999; font-size: 14px; margin-top: 32px;">
                This is an automated notification.
              </p>
            </div>
          `;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Green Cabinets <onboarding@resend.dev>',
              to: [role.user_email],
              subject: `Your ${role.role} role has expired`,
              html: htmlContent,
            }),
          });

          logger.info('Sent expiration notification', { 
            email: role.user_email, 
            role: role.role 
          });
        } catch (emailError) {
          logger.error('Error sending expiration email', emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: expiringRoles?.length || 0,
        roles_removed: removalResult?.removed_count || 0,
        message: 'Role expiration check completed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    logger.error('Error in role expiration check', error);
    throw error;
  }
};

serve(withErrorHandling(handler));
