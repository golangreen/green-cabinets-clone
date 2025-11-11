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

    // Get roles expiring within 3 days (72 hours) for 3-day reminder
    const { data: threeDayRoles, error: threeDayError } = await supabase
      .rpc('get_expiring_roles_by_stage', { 
        hours_before: 72,
        reminder_stage: '3day' 
      });

    if (threeDayError) {
      logger.error('Failed to fetch 3-day expiring roles', threeDayError);
    }

    logger.info('Found 3-day expiring roles', { count: threeDayRoles?.length || 0 });

    // Send 3-day reminder emails
    if (threeDayRoles && threeDayRoles.length > 0) {
      for (const role of threeDayRoles) {
        try {
          const daysRemaining = Math.ceil(role.hours_until_expiry / 24);
          const expiryDate = new Date(role.expires_at).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
          });

          const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
              <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">⏰ Role Expiring Soon</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                Hello,
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                This is a reminder that your <strong>${role.role}</strong> role will expire in approximately <strong>${daysRemaining} day(s)</strong>.
              </p>
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 24px 0;">
                <p style="color: #856404; font-size: 16px; margin: 0;">
                  <strong>Expiration Date:</strong> ${expiryDate}
                </p>
              </div>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                After this role expires, you will no longer have access to the associated permissions and features.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                <strong>Need to extend your role?</strong> Please contact an administrator before it expires.
              </p>
              <p style="color: #999; font-size: 14px; margin-top: 32px;">
                You will receive another reminder 24 hours before expiration.
              </p>
              <p style="color: #999; font-size: 14px;">
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
              subject: `⏰ Your ${role.role} role expires in ${daysRemaining} days`,
              html: htmlContent,
            }),
          });

          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            const emailId = emailData.id;

            // Log email delivery
            await supabase.from('email_delivery_log').insert({
              email_id: emailId,
              recipient_email: role.user_email,
              email_type: '3day',
              subject: `⏰ Your ${role.role} role expires in ${daysRemaining} days`,
              status: 'sent',
              user_id: role.user_id,
              role: role.role,
              event_data: { days_remaining: daysRemaining }
            });

            // Mark 3-day reminder as sent
            await supabase.rpc('mark_3day_reminder_sent', {
              target_user_id: role.user_id,
              target_role: role.role
            });
            
            logger.info('Sent 3-day expiration reminder', { 
              email: role.user_email, 
              role: role.role,
              days_remaining: daysRemaining,
              emailId
            });
          } else {
            const errorText = await emailResponse.text();
            logger.error('Failed to send 3-day reminder email', { error: errorText });
          }
        } catch (emailError) {
          logger.error('Error sending 3-day reminder email', emailError);
        }
      }
    }

    // Get roles expiring within 24 hours for 1-day reminder
    const { data: oneDayRoles, error: oneDayError } = await supabase
      .rpc('get_expiring_roles_by_stage', { 
        hours_before: 24,
        reminder_stage: '1day' 
      });

    if (oneDayError) {
      logger.error('Failed to fetch 1-day expiring roles', oneDayError);
    }

    logger.info('Found 1-day expiring roles', { count: oneDayRoles?.length || 0 });

    // Send 1-day reminder emails (final reminder)
    if (oneDayRoles && oneDayRoles.length > 0) {
      for (const role of oneDayRoles) {
        try {
          const hoursRemaining = Math.round(role.hours_until_expiry);
          const expiryDate = new Date(role.expires_at).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
          });

          const htmlContent = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
              <h1 style="color: #dc3545; font-size: 24px; margin-bottom: 16px;">🚨 Final Reminder: Role Expiring Soon</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                Hello,
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                <strong>Final reminder:</strong> Your <strong>${role.role}</strong> role will expire in approximately <strong>${hoursRemaining} hour(s)</strong>.
              </p>
              <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 16px; margin: 24px 0;">
                <p style="color: #721c24; font-size: 16px; margin: 0;">
                  <strong>⚠️ Expiration Date:</strong> ${expiryDate}
                </p>
              </div>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                <strong>Action Required:</strong> If you need to keep this role, contact an administrator immediately.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.5;">
                After expiration, you will lose access to all permissions and features associated with this role.
              </p>
              <p style="color: #999; font-size: 14px; margin-top: 32px;">
                This is your final automated reminder.
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
              subject: `🚨 FINAL REMINDER: Your ${role.role} role expires in ${hoursRemaining} hours`,
              html: htmlContent,
            }),
          });

          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            const emailId = emailData.id;

            // Log email delivery
            await supabase.from('email_delivery_log').insert({
              email_id: emailId,
              recipient_email: role.user_email,
              email_type: '1day',
              subject: `🚨 FINAL REMINDER: Your ${role.role} role expires in ${hoursRemaining} hours`,
              status: 'sent',
              user_id: role.user_id,
              role: role.role,
              event_data: { hours_remaining: hoursRemaining }
            });

            // Mark 1-day reminder as sent
            await supabase.rpc('mark_reminder_sent', {
              target_user_id: role.user_id,
              target_role: role.role
            });
            
            logger.info('Sent 1-day expiration reminder', { 
              email: role.user_email, 
              role: role.role,
              hours_remaining: hoursRemaining,
              emailId
            });
          } else {
            const errorText = await emailResponse.text();
            logger.error('Failed to send 1-day reminder email', { error: errorText });
          }
        } catch (emailError) {
          logger.error('Error sending 1-day reminder email', emailError);
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

          const emailResponse = await fetch('https://api.resend.com/emails', {
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

          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            const emailId = emailData.id;

            // Log email delivery
            await supabase.from('email_delivery_log').insert({
              email_id: emailId,
              recipient_email: role.user_email,
              email_type: 'expired',
              subject: `Your ${role.role} role has expired`,
              status: 'sent',
              user_id: role.user_id,
              role: role.role,
              event_data: { expired_at: role.expires_at }
            });

            logger.info('Sent expiration notification', { 
              email: role.user_email, 
              role: role.role,
              emailId
            });
          }
        } catch (emailError) {
          logger.error('Error sending expiration email', emailError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        three_day_reminders_sent: threeDayRoles?.length || 0,
        one_day_reminders_sent: oneDayRoles?.length || 0,
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
