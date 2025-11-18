import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutService } from '../checkoutService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(() => {
    service = new CheckoutService();
    vi.clearAllMocks();
  });

  describe('calculateItemTotal', () => {
    it('should calculate total correctly', () => {
      const item = {
        variantId: '1',
        quantity: 2,
        price: { amount: '50.00', currencyCode: 'USD' },
      };

      const total = service.calculateItemTotal(item);

      expect(total).toBe(100);
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate subtotal for multiple items', () => {
      const items = [
        {
          variantId: '1',
          quantity: 2,
          price: { amount: '50.00', currencyCode: 'USD' },
        },
        {
          variantId: '2',
          quantity: 1,
          price: { amount: '30.00', currencyCode: 'USD' },
        },
      ];

      const subtotal = service.calculateSubtotal(items);

      expect(subtotal).toBe(130);
    });

    it('should return 0 for empty cart', () => {
      const subtotal = service.calculateSubtotal([]);

      expect(subtotal).toBe(0);
    });
  });

  describe('formatPrice', () => {
    it('should format USD correctly', () => {
      const formatted = service.formatPrice(100, 'USD');

      expect(formatted).toBe('$100.00');
    });

    it('should use USD as default currency', () => {
      const formatted = service.formatPrice(50);

      expect(formatted).toBe('$50.00');
    });
  });
});
