/**
 * Security Utilities
 * Provides IP blocking, rate limiting, and security event logging
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

/**
 * Check if an IP address is blocked
 * 
 * @param supabase - Supabase client instance
 * @param ipAddress - IP address to check
 * @returns True if IP is blocked, false otherwise
 */
export async function isIPBlocked(
  supabase: SupabaseClient,
  ipAddress: string
): Promise<boolean> {
  if (!ipAddress || ipAddress === 'unknown') {
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('is_ip_blocked', {
      check_ip: ipAddress
    });

    if (error) {
      console.error('Error checking IP block status:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Exception checking IP block status:', error);
    return false;
  }
}

/**
 * Get detailed information about a blocked IP
 * 
 * @param supabase - Supabase client instance
 * @param ipAddress - IP address to check
 * @returns Block information or null if not blocked
 */
export async function getBlockedIPInfo(
  supabase: SupabaseClient,
  ipAddress: string
) {
  try {
    const { data, error } = await supabase.rpc('get_blocked_ip_info', {
      check_ip: ipAddress
    });

    if (error) {
      console.error('Error getting blocked IP info:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Exception getting blocked IP info:', error);
    return null;
  }
}

/**
 * Security event types
 */
export type SecurityEventType = 
  | 'rate_limit_exceeded'
  | 'validation_failed'
  | 'suspicious_activity'
  | 'ip_blocked'
  | 'authentication_failed'
  | 'unauthorized_access';

/**
 * Security event severity levels
 */
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Log a security event to the database
 * 
 * @param supabase - Supabase client instance
 * @param params - Event parameters
 */
export async function logSecurityEvent(
  supabase: SupabaseClient,
  params: {
    eventType: SecurityEventType;
    clientIP: string;
    functionName: string;
    severity?: SecuritySeverity;
    details?: Record<string, any>;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('security_events')
      .insert({
        event_type: params.eventType,
        client_ip: params.clientIP,
        function_name: params.functionName,
        severity: params.severity || 'medium',
        details: params.details || {},
      });

    if (error) {
      console.error('Error logging security event:', error);
    }
  } catch (error) {
    console.error('Exception logging security event:', error);
  }
}

/**
 * Rate limiter using in-memory map
 * Note: This is per-instance rate limiting (resets on function cold start)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Check and update rate limit for an IP address
 * 
 * @param ipAddress - IP address to check
 * @param maxRequests - Maximum requests allowed in window
 * @param windowMs - Time window in milliseconds
 * @returns True if rate limit exceeded, false otherwise
 */
export function checkRateLimit(
  ipAddress: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ipAddress);

  if (!entry || now > entry.resetAt) {
    // Create new entry or reset expired entry
    rateLimitMap.set(ipAddress, {
      count: 1,
      resetAt: now + windowMs,
    });
    return false;
  }

  // Increment counter
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return true;
  }

  return false;
}

/**
 * Verify reCAPTCHA token
 * 
 * @param token - reCAPTCHA token from client
 * @param secretKey - reCAPTCHA secret key
 * @returns True if verification successful, false otherwise
 */
export async function verifyRecaptcha(
  token: string,
  secretKey: string
): Promise<boolean> {
  if (!token || !secretKey) {
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}
