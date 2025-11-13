import { createServiceRoleClient } from '../_shared/supabase.ts';
import { createLogger } from '../_shared/logger.ts';
import { ValidationError, withErrorHandling } from '../_shared/errors.ts';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestEmailRequest {
  to_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logger = createLogger({ functionName: 'send-test-email' });
  logger.info('Test email request received');

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new ValidationError('Missing authorization header');
    }

    const supabase = createServiceRoleClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new ValidationError('Invalid authentication');
    }

    // Check admin role
    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!hasAdminRole) {
      throw new ValidationError('Admin access required');
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new ValidationError('RESEND_API_KEY not configured');
    }

    const { to_email }: TestEmailRequest = await req.json();

    if (!to_email || !to_email.includes('@')) {
      throw new ValidationError('Valid email address required');
    }

    logger.info('Sending test email', { to_email });

    // Fetch sender email configuration
    const { data: emailSettings } = await supabase
      .from('email_settings')
      .select('sender_email, sender_name')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const senderName = emailSettings?.sender_name || 'Green Cabinets';
    const senderEmail = emailSettings?.sender_email || 'onboarding@resend.dev';
    const fromAddress = `${senderName} <${senderEmail}>`;

    logger.info('Using sender configuration', { fromAddress });

    const resend = new Resend(resendApiKey);
    
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to_email],
      subject: 'Test Email - Resend Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2dd4bf;">Test Email Successful! ✓</h1>
          <p>This is a test email from your Green Cabinets application.</p>
          <p>If you're receiving this email, your Resend configuration is working correctly.</p>
          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            Sent at: ${new Date().toLocaleString()}<br>
            Configuration: Resend API
          </p>
        </div>
      `,
    });

    if (error) {
      logger.error('Failed to send test email', error);
      throw new Error(`Resend error: ${error.message}`);
    }

    logger.info('Test email sent successfully', { emailId: data?.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test email sent successfully',
        emailId: data?.id 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    logger.error('Error in send-test-email function', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: error instanceof ValidationError ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
};

Deno.serve(withErrorHandling(handler));
