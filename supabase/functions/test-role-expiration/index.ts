import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceRoleClient, createAuthenticatedClient } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';
import { withErrorHandling, ValidationError } from '../_shared/errors.ts';

interface TestRequest {
  action: 'trigger' | 'preview';
  reminder_type?: '3day' | '1day' | 'expired' | 'all';
  preview_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger({ functionName: 'test-role-expiration' });
  
  try {
    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new ValidationError('Authorization header required');
    }

    const supabase = await createAuthenticatedClient(authHeader);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new ValidationError('Authentication required');
    }

    // Check if user is admin
    const { data: isAdmin, error: roleError } = await supabase
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      throw new ValidationError('Admin access required');
    }

    const { action, reminder_type = 'all', preview_email }: TestRequest = await req.json();
    const serviceClient = createServiceRoleClient();
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    if (action === 'preview') {
      // Generate preview emails without sending
      const previews: any[] = [];
      const targetEmail = preview_email || user.email || 'test@example.com';

      if (reminder_type === '3day' || reminder_type === 'all') {
        const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        previews.push({
          type: '3day',
          subject: `⏰ Your admin role expires in 3 days`,
          to: targetEmail,
          html: generate3DayReminderHtml('admin', 3, expiryDate),
          preview_url: null
        });
      }

      if (reminder_type === '1day' || reminder_type === 'all') {
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        previews.push({
          type: '1day',
          subject: `🚨 FINAL REMINDER: Your admin role expires in 24 hours`,
          to: targetEmail,
          html: generate1DayReminderHtml('admin', 24, expiryDate),
          preview_url: null
        });
      }

      if (reminder_type === 'expired' || reminder_type === 'all') {
        previews.push({
          type: 'expired',
          subject: `Your admin role has expired`,
          to: targetEmail,
          html: generateExpiredHtml('admin'),
          preview_url: null
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: 'preview',
          previews: previews,
          message: 'Email previews generated'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (action === 'trigger') {
      // Actually trigger the role expiration check
      const results = {
        three_day_reminders: 0,
        one_day_reminders: 0,
        expired_notifications: 0,
        roles_removed: 0
      };

      // Process 3-day reminders
      if (reminder_type === '3day' || reminder_type === 'all') {
        const { data: threeDayRoles } = await serviceClient
          .rpc('get_expiring_roles_by_stage', { 
            hours_before: 72,
            reminder_stage: '3day' 
          });

        if (threeDayRoles && threeDayRoles.length > 0) {
          for (const role of threeDayRoles) {
            const daysRemaining = Math.ceil(role.hours_until_expiry / 24);
            const expiryDate = new Date(role.expires_at);

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
                html: generate3DayReminderHtml(role.role, daysRemaining, expiryDate),
              }),
            });

            if (emailResponse.ok) {
              await serviceClient.rpc('mark_3day_reminder_sent', {
                target_user_id: role.user_id,
                target_role: role.role
              });
              results.three_day_reminders++;
            }
          }
        }
      }

      // Process 1-day reminders
      if (reminder_type === '1day' || reminder_type === 'all') {
        const { data: oneDayRoles } = await serviceClient
          .rpc('get_expiring_roles_by_stage', { 
            hours_before: 24,
            reminder_stage: '1day' 
          });

        if (oneDayRoles && oneDayRoles.length > 0) {
          for (const role of oneDayRoles) {
            const hoursRemaining = Math.round(role.hours_until_expiry);
            const expiryDate = new Date(role.expires_at);

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
                html: generate1DayReminderHtml(role.role, hoursRemaining, expiryDate),
              }),
            });

            if (emailResponse.ok) {
              await serviceClient.rpc('mark_reminder_sent', {
                target_user_id: role.user_id,
                target_role: role.role
              });
              results.one_day_reminders++;
            }
          }
        }
      }

      // Process expired roles
      if (reminder_type === 'expired' || reminder_type === 'all') {
        const { data: removalResult } = await serviceClient
          .rpc('remove_expired_roles');
        
        results.roles_removed = removalResult?.removed_count || 0;

        const { data: expiredRoles } = await serviceClient
          .rpc('get_expired_roles');

        if (expiredRoles && expiredRoles.length > 0) {
          for (const role of expiredRoles) {
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
                html: generateExpiredHtml(role.role),
              }),
            });
            results.expired_notifications++;
          }
        }
      }

      logger.info('Manual role expiration check completed', results);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'trigger',
          results: results,
          message: 'Role expiration check triggered successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new ValidationError('Invalid action. Use "trigger" or "preview"');
  } catch (error: any) {
    logger.error('Error in test role expiration', error);
    throw error;
  }
};

function generate3DayReminderHtml(role: string, daysRemaining: number, expiryDate: Date): string {
  const formattedDate = expiryDate.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">⏰ Role Expiring Soon</h1>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Hello,
      </p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        This is a reminder that your <strong>${role}</strong> role will expire in approximately <strong>${daysRemaining} day(s)</strong>.
      </p>
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 24px 0;">
        <p style="color: #856404; font-size: 16px; margin: 0;">
          <strong>Expiration Date:</strong> ${formattedDate}
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
}

function generate1DayReminderHtml(role: string, hoursRemaining: number, expiryDate: Date): string {
  const formattedDate = expiryDate.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <h1 style="color: #dc3545; font-size: 24px; margin-bottom: 16px;">🚨 Final Reminder: Role Expiring Soon</h1>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Hello,
      </p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        <strong>Final reminder:</strong> Your <strong>${role}</strong> role will expire in approximately <strong>${hoursRemaining} hour(s)</strong>.
      </p>
      <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 16px; margin: 24px 0;">
        <p style="color: #721c24; font-size: 16px; margin: 0;">
          <strong>⚠️ Expiration Date:</strong> ${formattedDate}
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
}

function generateExpiredHtml(role: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;">
      <h1 style="color: #333; font-size: 24px; margin-bottom: 16px;">Role Expired</h1>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Hello,
      </p>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Your <strong>${role}</strong> role has expired and has been automatically removed.
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
}

serve(withErrorHandling(handler));
