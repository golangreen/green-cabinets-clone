import { describe, it, expect, beforeEach } from 'vitest';
import { VanityPricingService } from '../vanityPricingService';

describe('VanityPricingService', () => {
  let service: VanityPricingService;

  beforeEach(() => {
    service = new VanityPricingService();
  });

  describe('calculatePricing', () => {
    it('should calculate complete pricing breakdown for standard dimensions', () => {
      const config = { 
        dimensions: { width: 36, depth: 21, height: 32 },
        finish: 'white',
        countertop: 'quartz',
        hardware: 'chrome',
        sink: 'undermount',
        mirror: true,
        lighting: true
      };
      
      const result = service.calculatePricing(config);

      expect(result.basePrice).toBeGreaterThan(0);
      expect(result.subtotal).toBeGreaterThan(0);
      expect(result.tax).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(typeof result.total).toBe('number');
    });

    it('should handle minimum dimensions', () => {
      const config = { 
        dimensions: { width: 24, depth: 18, height: 30 },
        finish: 'white',
        countertop: 'quartz',
        hardware: 'chrome',
        sink: 'none',
        mirror: false,
        lighting: false
      };
      
      const result = service.calculatePricing(config);

      expect(result.total).toBeGreaterThan(0);
    });

    it('should handle maximum dimensions', () => {
      const config = { 
        dimensions: { width: 72, depth: 24, height: 36 },
        finish: 'white',
        countertop: 'quartz',
        hardware: 'chrome',
        sink: 'none',
        mirror: false,
        lighting: false
      };
      
      const result = service.calculatePricing(config);

      expect(result.total).toBeGreaterThan(0);
    });

    it('should increase price with larger dimensions', () => {
      const smallConfig = { 
        dimensions: { width: 24, depth: 18, height: 30 },
        finish: 'white',
        countertop: 'quartz',
        hardware: 'chrome',
        sink: 'none',
        mirror: false,
        lighting: false
      };
      const largeConfig = { 
        dimensions: { width: 72, depth: 24, height: 36 },
        finish: 'white',
        countertop: 'quartz',
        hardware: 'chrome',
        sink: 'none',
        mirror: false,
        lighting: false
      };
      
      const smallResult = service.calculatePricing(smallConfig);
      const largeResult = service.calculatePricing(largeConfig);

      expect(largeResult.total).toBeGreaterThan(smallResult.total);
    });

    it('should calculate total correctly', () => {
      const config = { 
        dimensions: { width: 36, depth: 21, height: 32 },
        finish: 'white',
        countertop: 'quartz',
        hardware: 'chrome',
        sink: 'undermount',
        mirror: false,
        lighting: true
      };
      
      const result = service.calculatePricing(config);

      expect(result.subtotal).toBeGreaterThan(0);
      expect(result.tax).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });
  });
});
