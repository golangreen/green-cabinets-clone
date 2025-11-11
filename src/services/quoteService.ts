/**
 * Quote Service
 * Handles quote request formatting, sanitization, and submission
 */

export interface QuoteData {
  projectType: string;
  roomSize?: string;
  style?: string;
  budget?: string;
  timeline?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  message?: string;
}

export interface VanityConfigData {
  brand: string;
  finish: string;
  dimensions: string;
  doorStyle: string;
  countertop: string;
  sink: string;
  pricing: {
    vanity: string;
    tax: string;
    shipping: string;
    total: string;
  };
}

/**
 * Sanitize input to prevent email header injection and XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[\r\n]/g, ' ')  // Remove carriage returns and newlines
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')  // Remove control characters
    .replace(/%0[AD]/gi, '')  // Remove URL-encoded newlines
    .trim();
}

/**
 * Sanitize all fields in an object
 */
export function sanitizeObject<T extends Record<string, any>>(data: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}

/**
 * Format quote request details for email
 */
export function formatQuoteRequest(data: QuoteData): string {
  const sanitized = sanitizeObject(data);
  
  return `
🏠 New Quote Request - Green Cabinets

📋 PROJECT DETAILS:
• Type: ${sanitized.projectType.toUpperCase()}
${sanitized.roomSize ? `• Room Size: ${sanitized.roomSize}` : ''}
${sanitized.style ? `• Style: ${sanitized.style}` : ''}
${sanitized.budget ? `• Budget: ${sanitized.budget}` : ''}
${sanitized.timeline ? `• Timeline: ${sanitized.timeline}` : ''}

👤 CONTACT INFORMATION:
• Name: ${sanitized.name}
• Email: ${sanitized.email}
• Phone: ${sanitized.phone}
• Address: ${sanitized.address}

💬 Additional Notes:
${sanitized.message || "None"}

---
Submitted from: Green Cabinets Website
`.trim();
}

/**
 * Create mailto link for quote request
 */
export function createQuoteMailtoLink(data: QuoteData, recipientEmail: string): string {
  const quoteDetails = formatQuoteRequest(data);
  const subject = encodeURIComponent(`Quote Request: ${data.projectType} - ${data.name}`);
  const body = encodeURIComponent(quoteDetails);
  
  return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
}

/**
 * Format vanity configuration for WhatsApp
 */
export function formatVanityForWhatsApp(config: VanityConfigData): string {
  return `🛁 *Custom Bathroom Vanity Configuration*\n\n` +
    `📦 *Cabinet Details:*\n` +
    `• Brand: ${config.brand}\n` +
    `• Finish: ${config.finish}\n` +
    `• Dimensions: ${config.dimensions}\n` +
    `• Door Style: ${config.doorStyle}\n\n` +
    `🪨 *Countertop:* ${config.countertop}\n` +
    `🚰 *Sink:* ${config.sink}\n\n` +
    `💰 *Price Estimate:*\n` +
    `• Vanity: ${config.pricing.vanity}\n` +
    `• Tax: ${config.pricing.tax}\n` +
    `• Shipping: ${config.pricing.shipping}\n` +
    `• *Total: ${config.pricing.total}*\n\n` +
    `📞 Interested? Contact Green Cabinets:\n` +
    `Email: greencabinets@gmail.com\n` +
    `Phone: (718) 804-5488`;
}

/**
 * Create WhatsApp share URL
 */
export function createWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Format vanity configuration for email body
 */
export function formatVanityForEmail(config: VanityConfigData): string {
  return `
Custom Bathroom Vanity Configuration

CABINET DETAILS:
• Brand: ${config.brand}
• Finish: ${config.finish}
• Dimensions: ${config.dimensions}
• Door Style: ${config.doorStyle}

COUNTERTOP: ${config.countertop}
SINK: ${config.sink}

PRICE ESTIMATE:
• Vanity: ${config.pricing.vanity}
• Tax: ${config.pricing.tax}
• Shipping: ${config.pricing.shipping}
• Total: ${config.pricing.total}

---
For more information, contact Green Cabinets:
Email: greencabinets@gmail.com
Phone: (718) 804-5488
`.trim();
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Must have at least 10 digits
  return digitsOnly.length >= 10;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
    return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  }
  
  return phone; // Return original if format doesn't match
}

/**
 * Validate quote data
 */
export function validateQuoteData(data: Partial<QuoteData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email address is required');
  }
  
  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('Valid phone number is required');
  }
  
  if (!data.projectType) {
    errors.push('Project type is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Prepare quote data for submission
 */
export function prepareQuoteForSubmission(data: QuoteData): QuoteData {
  return {
    ...sanitizeObject(data),
    phone: formatPhoneNumber(data.phone),
  };
}
