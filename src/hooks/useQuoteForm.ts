/**
 * Custom hook for quote form management
 */
import { useState } from 'react';
import { quoteService } from '@/services/quoteService';
import type { QuoteRequest } from '@/services/quoteService';
import { toast } from 'sonner';

export function useQuoteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuote = async (request: QuoteRequest) => {
    setIsSubmitting(true);
    try {
      const result = await quoteService.submitQuote(request);
      
      if (result.success) {
        toast.success('Quote request submitted!', {
          description: 'We\'ll get back to you within 24 hours.',
        });
        return { success: true };
      } else {
        toast.error('Failed to submit quote', {
          description: result.error || 'Please try again later.',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitQuote,
    isSubmitting,
  };
}
