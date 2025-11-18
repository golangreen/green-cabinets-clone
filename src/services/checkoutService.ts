import { supabase } from "@/integrations/supabase/client";
import type { CheckoutCustomerInfo, CheckoutItem } from "@/types";

export interface CheckoutResult {
  url: string | null;
  error: Error | null;
}

/**
 * Service for managing checkout operations.
 * Handles creating Stripe checkout sessions via edge functions.
 * 
 * @example
 * ```typescript
 * const result = await checkoutService.createCheckout(
 *   cartItems,
 *   { email: 'customer@example.com', firstName: 'John', lastName: 'Doe' }
 * );
 * 
 * if (result.url) {
 *   window.location.href = result.url;
 * }
 * ```
 */
export class CheckoutService {
  /**
   * Creates a checkout session for the given items and customer
   * 
   * @param items - Array of items to checkout
   * @param customer - Customer information including email and name
   * @returns Promise resolving to checkout session URL or error
   * 
   * @example
   * ```typescript
   * const checkout = await checkoutService.createCheckout(
   *   [{ productId: '123', quantity: 2, price: 99.99 }],
   *   { email: 'user@example.com', firstName: 'Jane', lastName: 'Smith' }
   * );
   * ```
   */
  async createCheckout(
    items: CheckoutItem[],
    customer: CheckoutCustomerInfo
  ): Promise<CheckoutResult> {
    try {
      if (items.length === 0) {
        return {
          url: null,
          error: new Error('Cart is empty'),
        };
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items,
          customerEmail: customer.email,
          customerName: `${customer.firstName} ${customer.lastName}`,
        },
      });

      if (error) {
        console.error('Checkout creation error:', error);
        return {
          url: null,
          error: new Error(error.message || 'Failed to create checkout session'),
        };
      }

      if (!data?.url) {
        return {
          url: null,
          error: new Error('No checkout URL returned'),
        };
      }

      return {
        url: data.url,
        error: null,
      };
    } catch (error) {
      console.error('Unexpected checkout error:', error);
      return {
        url: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Calculates the total for a single item
   */
  calculateItemTotal(item: CheckoutItem): number {
    return parseFloat(item.price.amount) * item.quantity;
  }

  /**
   * Calculates the subtotal for all items
   */
  calculateSubtotal(items: CheckoutItem[]): number {
    return items.reduce((sum, item) => sum + this.calculateItemTotal(item), 0);
  }

  /**
   * Formats price for display
   */
  formatPrice(amount: number, currencyCode: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  }
}

// Export singleton instance
export const checkoutService = new CheckoutService();
