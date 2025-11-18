/**
 * Input sanitization utilities
 * Prevents XSS and injection attacks
 */

import { logger } from '@/lib/logger';

/**
 * Sanitize HTML string by removing dangerous tags and attributes
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';
  
  try {
    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
  } catch (error) {
    logger.error('Failed to sanitize HTML', { error, input: input.substring(0, 100) });
    return '';
  }
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';
  
  const urlStr = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (
    urlStr.startsWith('javascript:') ||
    urlStr.startsWith('data:') ||
    urlStr.startsWith('vbscript:')
  ) {
    logger.warn('Blocked dangerous URL protocol', { url: urlStr.substring(0, 50) });
    return '';
  }
  
  try {
    const parsed = new URL(url);
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      logger.warn('Blocked non-HTTP URL protocol', { protocol: parsed.protocol });
      return '';
    }
    return url;
  } catch (error) {
    logger.warn('Invalid URL format', { url: urlStr.substring(0, 50) });
    return '';
  }
}

/**
 * Remove SQL injection patterns from input
 */
export function sanitizeSQL(input: string): string {
  if (!input) return '';
  
  // Pattern of dangerous SQL keywords
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|#|\/\*|\*\/)/g, // SQL comments
    /('|")(.*?)\1/g, // String literals
    /(\bOR\b|\bAND\b).*?(=|<|>)/gi, // Boolean conditions
  ];
  
  let sanitized = input;
  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitized)) {
      logger.warn('Detected SQL injection pattern', { 
        input: input.substring(0, 100),
        pattern: pattern.toString() 
      });
      sanitized = sanitized.replace(pattern, '');
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();
  
  if (!emailRegex.test(trimmed)) {
    logger.warn('Invalid email format', { email: trimmed.substring(0, 20) });
    return '';
  }
  
  return trimmed;
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters except + at start
  const cleaned = phone.replace(/[^\d+]/g, '').replace(/\+(?!^)/g, '');
  
  // Basic validation: 10-15 digits with optional + prefix
  const phoneRegex = /^\+?\d{10,15}$/;
  
  if (!phoneRegex.test(cleaned)) {
    logger.warn('Invalid phone number format', { phone: cleaned.substring(0, 15) });
    return '';
  }
  
  return cleaned;
}

/**
 * Sanitize file path to prevent directory traversal
 */
export function sanitizeFilePath(path: string): string {
  if (!path) return '';
  
  // Remove directory traversal patterns
  const sanitized = path
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '_')
    .replace(/^\./, '');
  
  if (sanitized !== path) {
    logger.warn('Sanitized dangerous file path', { 
      original: path.substring(0, 50),
      sanitized: sanitized.substring(0, 50)
    });
  }
  
  return sanitized;
}

/**
 * Generic string sanitizer - removes non-alphanumeric except specified chars
 */
export function sanitizeString(
  input: string,
  allowedChars: string = ' -_.,@'
): string {
  if (!input) return '';
  
  const pattern = new RegExp(`[^a-zA-Z0-9${allowedChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`, 'g');
  return input.replace(pattern, '');
}
