import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';
import { withErrorHandling, ValidationError } from '../_shared/errors.ts';
import { getClientIP } from '../_shared/supabase.ts';

const LOCK_DURATION_MINUTES = 30;
const MAX_ATTEMPTS = 5;
const RESET_WINDOW_MINUTES = 15;

interface CheckAttemptRequest {
  email: string;
}

interface CheckAttemptResponse {
  allowed: boolean;
  attemptsRemaining?: number;
  lockedUntil?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger({ functionName: 'check-login-attempt', requestId });
  const clientIP = getClientIP(req);

  try {
    // Parse request
    const { email }: CheckAttemptRequest = await req.json();
    
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required');
    }

    // Create Supabase service role client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing failed attempt record
    const { data: existingAttempt, error: fetchError } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const now = new Date();

    // If account is locked, check if lock expired
    if (existingAttempt?.locked_until) {
      const lockedUntil = new Date(existingAttempt.locked_until);
      
      if (now < lockedUntil) {
        const minutesRemaining = Math.ceil((lockedUntil.getTime() - now.getTime()) / (1000 * 60));
        
        logger.warn('Login attempt blocked - account locked', {
          email,
          clientIP,
          lockedUntil: lockedUntil.toISOString(),
          minutesRemaining
        });

        return new Response(
          JSON.stringify({
            allowed: false,
            lockedUntil: lockedUntil.toISOString(),
            message: `Account temporarily locked. Try again in ${minutesRemaining} minutes.`
          } as CheckAttemptResponse),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        // Lock expired, reset attempts
        await supabase
          .from('failed_login_attempts')
          .delete()
          .eq('email', email.toLowerCase());

        logger.info('Lock expired, reset attempts', { email, clientIP });
      }
    }

    // Check if attempts should be reset (outside reset window)
    if (existingAttempt && existingAttempt.last_attempt_at) {
      const lastAttempt = new Date(existingAttempt.last_attempt_at);
      const minutesSinceLastAttempt = (now.getTime() - lastAttempt.getTime()) / (1000 * 60);
      
      if (minutesSinceLastAttempt > RESET_WINDOW_MINUTES) {
        // Reset attempts after reset window
        await supabase
          .from('failed_login_attempts')
          .delete()
          .eq('email', email.toLowerCase());

        logger.info('Attempts reset after window expired', { email, clientIP, minutesSinceLastAttempt });
      }
    }

    // Refetch after potential deletion
    const { data: currentAttempt } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    const currentAttemptCount = currentAttempt?.attempt_count || 0;
    const attemptsRemaining = MAX_ATTEMPTS - currentAttemptCount;

    logger.info('Login attempt check', {
      email,
      clientIP,
      currentAttemptCount,
      attemptsRemaining
    });

    return new Response(
      JSON.stringify({
        allowed: true,
        attemptsRemaining,
        message: 'Login attempt allowed'
      } as CheckAttemptResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    logger.error('Error checking login attempt', { error, clientIP });
    throw error;
  }
};

serve(withErrorHandling(handler, (error) => createLogger({ functionName: 'check-login-attempt' })));
