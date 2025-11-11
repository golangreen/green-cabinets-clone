/**
 * Supabase Client Utilities
 * Provides standardized Supabase client initialization for edge functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

/**
 * Create Supabase client with service role key (admin access)
 * Use this for server-side operations that need full database access
 * 
 * @returns Supabase client with service role privileges
 */
export function createServiceRoleClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Create Supabase client with user authentication
 * Use this for user-specific operations that respect RLS policies
 * 
 * @param authHeader - Authorization header from request
 * @returns Supabase client authenticated as the user
 */
export function createAuthenticatedClient(authHeader: string): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  }

  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    { 
      global: { 
        headers: { Authorization: authHeader } 
      } 
    }
  );
}

/**
 * Extract client IP address from request
 * Checks multiple headers in order of reliability
 * 
 * @param req - HTTP request object
 * @returns IP address or 'unknown'
 */
export function getClientIP(req: Request): string {
  // Check various headers for client IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  return 'unknown';
}
