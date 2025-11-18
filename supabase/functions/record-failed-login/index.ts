import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';
import { withErrorHandling, ValidationError } from '../_shared/errors.ts';
import { getClientIP } from '../_shared/supabase.ts';

const LOCK_DURATION_MINUTES = 30;
const MAX_ATTEMPTS = 5;

interface RecordFailedLoginRequest {
  email: string;
}

interface RecordFailedLoginResponse {
  locked: boolean;
  attemptsRemaining: number;
  lockedUntil?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger({ functionName: 'record-failed-login', requestId });
  const clientIP = getClientIP(req);

  try {
    // Parse request
    const { email }: RecordFailedLoginRequest = await req.json();
    
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required');
    }

    // Create Supabase service role client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing failed attempt record
    const { data: existingAttempt } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    const now = new Date();
    const newAttemptCount = (existingAttempt?.attempt_count || 0) + 1;
    const shouldLock = newAttemptCount >= MAX_ATTEMPTS;
    const lockedUntil = shouldLock 
      ? new Date(now.getTime() + LOCK_DURATION_MINUTES * 60 * 1000)
      : null;

    if (existingAttempt) {
      // Update existing record
      await supabase
        .from('failed_login_attempts')
        .update({
          attempt_count: newAttemptCount,
          locked_until: lockedUntil?.toISOString(),
          last_attempt_at: now.toISOString(),
          ip_address: clientIP
        })
        .eq('email', email.toLowerCase());
    } else {
      // Insert new record
      await supabase
        .from('failed_login_attempts')
        .insert({
          email: email.toLowerCase(),
          ip_address: clientIP,
          attempt_count: newAttemptCount,
          locked_until: lockedUntil?.toISOString(),
          last_attempt_at: now.toISOString()
        });
    }

    const attemptsRemaining = MAX_ATTEMPTS - newAttemptCount;

    if (shouldLock) {
      logger.warn('Account locked due to failed attempts', {
        email,
        clientIP,
        attemptCount: newAttemptCount,
        lockedUntil: lockedUntil?.toISOString()
      });

      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'account_locked',
        severity: 'high',
        function_name: 'record-failed-login',
        client_ip: clientIP,
        details: {
          email,
          attemptCount: newAttemptCount,
          lockedUntil: lockedUntil?.toISOString()
        }
      });

      return new Response(
        JSON.stringify({
          locked: true,
          attemptsRemaining: 0,
          lockedUntil: lockedUntil?.toISOString(),
          message: `Account locked for ${LOCK_DURATION_MINUTES} minutes due to multiple failed login attempts.`
        } as RecordFailedLoginResponse),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    logger.info('Failed login recorded', {
      email,
      clientIP,
      attemptCount: newAttemptCount,
      attemptsRemaining
    });

    // Log security event for failed attempt
    await supabase.from('security_events').insert({
      event_type: 'failed_login_attempt',
      severity: 'medium',
      function_name: 'record-failed-login',
      client_ip: clientIP,
      details: {
        email,
        attemptCount: newAttemptCount,
        attemptsRemaining
      }
    });

    return new Response(
      JSON.stringify({
        locked: false,
        attemptsRemaining,
        message: `Failed login attempt recorded. ${attemptsRemaining} attempts remaining.`
      } as RecordFailedLoginResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    logger.error('Error recording failed login', { error, clientIP });
    throw error;
  }
};

serve(withErrorHandling(handler, (error) => createLogger({ functionName: 'record-failed-login' })));
