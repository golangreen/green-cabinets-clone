/**
 * Client-side rate limiting utilities
 * Prevents abuse before requests reach the server
 */

import { logger } from '@/lib/logger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if action is rate limited
 */
export function isRateLimited(
  key: string,
  config: RateLimitConfig
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // No entry or expired, allow request
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return false;
  }
  
  // Increment count
  entry.count++;
  
  // Check if exceeded limit
  if (entry.count > config.maxRequests) {
    const remainingMs = entry.resetAt - now;
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    
    logger.warn('Client-side rate limit exceeded', {
      key,
      count: entry.count,
      maxRequests: config.maxRequests,
      remainingSeconds,
    });
    
    return true;
  }
  
  return false;
}

/**
 * Get remaining requests for a key
 */
export function getRemainingRequests(
  key: string,
  config: RateLimitConfig
): number {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now >= entry.resetAt) {
    return config.maxRequests;
  }
  
  return Math.max(0, config.maxRequests - entry.count);
}

/**
 * Get time until rate limit resets (in seconds)
 */
export function getResetTime(key: string): number {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now >= entry.resetAt) {
    return 0;
  }
  
  return Math.ceil((entry.resetAt - now) / 1000);
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logger.info('Cleaned up expired rate limits', { cleaned, remaining: rateLimitStore.size });
  }
}

// Cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
