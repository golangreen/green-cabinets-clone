/**
 * Rate limiting utilities for edge functions
 */
import { RateLimitError } from './errors.ts';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): void {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  // Reset if window expired
  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return;
  }

  // Check if limit exceeded
  if (record.count >= config.maxRequests) {
    throw new RateLimitError('Rate limit exceeded. Please try again later.');
  }

  // Increment count
  record.count++;
}

/**
 * Get client IP from request
 */
export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown';
}
