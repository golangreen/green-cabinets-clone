/**
 * Vanity Service
 * Business logic for vanity designer operations
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { VanityTemplateConfig } from '@/types/vanity';

export interface VanityPricingData {
  vanityPrice: number;
  wallPrice: number;
  floorPrice: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface EmailQuoteParams {
  config: VanityTemplateConfig | any;
  pricing: VanityPricingData;
  recipientEmail: string;
  customerName?: string;
}

export const vanityService = {
  /**
   * Send vanity quote via email
   */
  async emailQuote(params: EmailQuoteParams): Promise<void> {
    logger.info('Sending vanity quote email', {
      recipientEmail: params.recipientEmail,
      total: params.pricing.total,
    });

    try {
      const { data, error } = await supabase.functions.invoke('email-vanity-config', {
        body: {
          config: params.config,
          pricing: params.pricing,
          email: params.recipientEmail,
          customerName: params.customerName,
        },
      });

      if (error) {
        logger.error('Failed to send vanity quote email', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      logger.info('Vanity quote email sent successfully', {
        recipientEmail: params.recipientEmail,
      });

      return data;
    } catch (error) {
      logger.error('Vanity service email error', error);
      throw error;
    }
  },

  /**
   * Send vanity quote PDF via email
   */
  async emailQuotePDF(
    recipientEmail: string,
    recipientName: string,
    ccSalesTeam: boolean,
    pdfBase64: string,
    vanityConfig: any,
  ): Promise<void> {
    logger.info('Sending vanity quote PDF email', {
      recipientEmail,
      ccSalesTeam,
    });

    try {
      const { error } = await supabase.functions.invoke('send-vanity-quote-email', {
        body: {
          recipientEmail,
          recipientName,
          ccSalesTeam,
          pdfBase64,
          vanityConfig,
        },
      });

      if (error) {
        logger.error('Failed to send vanity quote PDF email', error);
        throw new Error(`Failed to send PDF email: ${error.message}`);
      }

      logger.info('Vanity quote PDF email sent successfully', {
        recipientEmail,
      });
    } catch (error) {
      logger.error('Vanity service PDF email error', error);
      throw error;
    }
  },

  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Format vanity configuration for display
   */
  formatConfigSummary(config: any): string {
    const brand = config.brand || config.selectedBrand || '';
    const finish = config.finish || config.selectedFinish || '';
    return `${config.width}" × ${config.depth}" × ${config.height}" ${brand} ${finish}`;
  },
};
