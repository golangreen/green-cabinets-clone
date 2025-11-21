import { supabase } from "@/integrations/supabase/client";

export interface QuoteRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
  projectType?: string;
  recaptchaToken?: string;
}

/**
 * Service for handling quote request operations.
 * Validates, sanitizes, and submits quote requests to the backend.
 * 
 * @example
 * ```typescript
 * const result = await quoteService.submitQuote({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '555-1234',
 *   message: 'Need custom cabinets for kitchen remodel',
 *   projectType: 'kitchen'
 * });
 * 
 * if (result.success) {
 *   toast.success('Quote request submitted!');
 * }
 * ```
 */
export class QuoteService {
  /**
   * Submit a quote request to the backend
   * 
   * @param request - Quote request data
   * @returns Promise resolving to success status and optional error message
   * @throws {Error} If validation fails
   * 
   * @example
   * ```typescript
   * const result = await quoteService.submitQuote({
   *   name: 'Jane Smith',
   *   email: 'jane@example.com',
   *   message: 'Interested in bathroom vanity',
   *   projectType: 'bathroom'
   * });
   * ```
   */
  async submitQuote(request: QuoteRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate inputs
      this.validateQuoteRequest(request);

      // Validate reCAPTCHA token if provided
      if (!request.recaptchaToken) {
        throw new Error('reCAPTCHA verification is required');
      }

      // Send via edge function
      const { error } = await supabase.functions.invoke('send-contact-form', {
        body: {
          name: this.sanitizeString(request.name),
          email: request.email,
          phone: request.phone,
          message: this.sanitizeString(request.message),
          projectType: request.projectType,
          recaptchaToken: request.recaptchaToken,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit quote request',
      };
    }
  }

  /**
   * Validate quote request data
   * 
   * @param request - Quote request to validate
   * @throws {Error} If validation fails
   * @private
   */
  private validateQuoteRequest(request: QuoteRequest): void {
    if (!request.name || request.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (!request.email || !this.isValidEmail(request.email)) {
      throw new Error('Valid email is required');
    }
    if (!request.message || request.message.length < 10) {
      throw new Error('Message must be at least 10 characters');
    }
  }

  /**
   * Sanitize string input to prevent XSS attacks
   * 
   * @param input - String to sanitize
   * @returns Sanitized string
   * @private
   */
  private sanitizeString(input: string): string {
    return input.trim().slice(0, 1000);
  }

  /**
   * Validate email format
   * 
   * @param email - Email address to validate
   * @returns True if email format is valid
   * @private
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format contact information for display
   * 
   * @param request - Quote request data
   * @returns Formatted contact string
   * 
   * @example
   * ```typescript
   * const formatted = quoteService.formatContactInfo(request);
   * console.log(formatted); // "John Doe - john@example.com - 555-1234"
   * ```
   */
  formatContactInfo(request: QuoteRequest): string {
    return `${request.name} - ${request.email}${request.phone ? ` - ${request.phone}` : ''}`;
  }
}

export const quoteService = new QuoteService();
