/**
 * Shared TypeScript Types
 * Common types used across edge functions
 */

/**
 * Standard success response
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, any>;
}

/**
 * Security event data
 */
export interface SecurityEvent {
  event_type: string;
  client_ip: string;
  function_name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
  created_at?: string;
}

/**
 * Blocked IP information
 */
export interface BlockedIPInfo {
  ip_address: string;
  reason: string;
  blocked_until: string;
  violation_count: number;
  auto_blocked: boolean;
  details?: Record<string, any>;
}

/**
 * Rate limit entry
 */
export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Request metadata
 */
export interface RequestMetadata {
  ip: string;
  userAgent?: string;
  referer?: string;
  method: string;
  path: string;
}

/**
 * Extract request metadata from request
 * 
 * @param req - HTTP request
 * @returns Request metadata
 */
export function extractRequestMetadata(req: Request): RequestMetadata {
  const url = new URL(req.url);
  
  return {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
        req.headers.get('x-real-ip') || 
        req.headers.get('cf-connecting-ip') || 
        'unknown',
    userAgent: req.headers.get('user-agent') || undefined,
    referer: req.headers.get('referer') || undefined,
    method: req.method,
    path: url.pathname,
  };
}
