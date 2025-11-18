/**
 * Content Security Policy configuration
 * Helps prevent XSS attacks and other code injection vulnerabilities
 */

export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for inline scripts (consider removing in production)
    "'unsafe-eval'", // Required for some libraries
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://checkout.stripe.com',
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and inline styles
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.supabase.co',
    'https://images.unsplash.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://checkout.stripe.com',
    'https://api.stripe.com',
    'https://www.google.com',
  ],
  'frame-src': [
    "'self'",
    'https://checkout.stripe.com',
    'https://www.google.com',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Generate CSP header string from directives
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Security headers for production
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable browser XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};
