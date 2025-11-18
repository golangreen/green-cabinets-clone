/**
 * Service for quote request operations
 */
import { supabase } from "@/integrations/supabase/client";

export interface QuoteRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
  projectType?: string;
}

export class QuoteService {
  /**
   * Submit a quote request
   */
  async submitQuote(request: QuoteRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate inputs
      this.validateQuoteRequest(request);

      // Send via edge function
      const { error } = await supabase.functions.invoke('send-quote-request', {
        body: {
          name: this.sanitizeString(request.name),
          email: request.email,
          phone: request.phone,
          message: this.sanitizeString(request.message),
          projectType: request.projectType,
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
   * Sanitize string input
   */
  private sanitizeString(input: string): string {
    return input.trim().slice(0, 1000);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format contact information for display
   */
  formatContactInfo(request: QuoteRequest): string {
    return `${request.name} - ${request.email}${request.phone ? ` - ${request.phone}` : ''}`;
  }
}

export const quoteService = new QuoteService();
