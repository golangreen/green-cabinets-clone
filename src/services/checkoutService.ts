/**
 * Checkout Service
 * Business logic for checkout operations and Stripe integration
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { CartItem } from '@/features/shopping-cart/stores/cartStore';

export interface CheckoutSessionData {
  sessionUrl: string;
  sessionId: string;
}

export const checkoutService = {
  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession(
    items: CartItem[],
    customerEmail: string,
    customerName: string
  ): Promise<CheckoutSessionData> {
    logger.info('Creating checkout session', {
      itemCount: items.length,
      customerEmail,
    });

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items,
          customerEmail,
          customerName,
        },
      });

      if (error) {
        logger.error('Failed to create checkout session', error);
        throw new Error(`Checkout failed: ${error.message}`);
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned from server');
      }

      logger.info('Checkout session created successfully', {
        sessionId: data.id,
      });

      return {
        sessionUrl: data.url,
        sessionId: data.id,
      };
    } catch (error) {
      logger.error('Checkout service error', error);
      throw error;
    }
  },

  /**
   * Validate checkout session
   */
  async validateSession(sessionId: string): Promise<boolean> {
    logger.debug('Validating checkout session', { sessionId });
    
    // This would typically call a Stripe API to verify the session
    // For now, just validate format
    return sessionId && sessionId.startsWith('cs_');
  },

  /**
   * Calculate checkout total
   */
  calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => {
      const amount = parseFloat(item.price.amount);
      return sum + (amount * item.quantity);
    }, 0);
  },
};
