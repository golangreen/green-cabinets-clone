import { describe, it, expect, beforeEach } from 'vitest';
import { VanityPricingService } from '../vanityPricingService';

describe('VanityPricingService', () => {
  let service: VanityPricingService;

  beforeEach(() => {
    service = new VanityPricingService();
  });

  describe('calculatePrice', () => {
    it('should calculate price for standard dimensions', () => {
      const price = service.calculatePrice({ width: 36, depth: 21, height: 32 });

      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
    });

    it('should handle minimum dimensions', () => {
      const price = service.calculatePrice({ width: 24, depth: 18, height: 30 });

      expect(price).toBeGreaterThan(0);
    });

    it('should handle maximum dimensions', () => {
      const price = service.calculatePrice({ width: 72, depth: 24, height: 36 });

      expect(price).toBeGreaterThan(0);
    });

    it('should increase price with larger dimensions', () => {
      const smallPrice = service.calculatePrice({ width: 24, depth: 18, height: 30 });
      const largePrice = service.calculatePrice({ width: 72, depth: 24, height: 36 });

      expect(largePrice).toBeGreaterThan(smallPrice);
    });
  });

  describe('calculatePrice', () => {
    it('should return complete pricing breakdown', () => {
      const result = service.calculatePrice({ width: 36, depth: 21, height: 32 });

      expect(result.subtotal).toBeGreaterThan(0);
      expect(result.tax).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });
  });
});
