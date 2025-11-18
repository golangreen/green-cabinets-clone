import { VANITY_CONFIG } from '@/config/app';
import type { VanityConfiguration, VanityPricing } from '@/types';

/**
 * Service for vanity pricing calculations and business logic.
 * Handles price calculations for custom vanity configurations including
 * dimensions, finishes, countertops, hardware, and fixtures.
 * 
 * @example
 * ```typescript
 * const pricing = vanityPricingService.calculatePricing({
 *   dimensions: { width: 36, depth: 21, height: 32 },
 *   finish: 'white-oak',
 *   countertop: 'quartz',
 *   hardware: 'chrome',
 *   sink: 'undermount',
 *   mirror: true,
 *   lighting: true
 * });
 * 
 * console.log(`Total: ${vanityPricingService.formatPrice(pricing.total)}`);
 * ```
 */
export class VanityPricingService {
  /**
   * Calculate complete pricing breakdown for a vanity configuration
   * 
   * @param config - Vanity configuration including dimensions and options
   * @returns Complete pricing breakdown with all costs itemized
   * 
   * @example
   * ```typescript
   * const pricing = service.calculatePricing({
   *   dimensions: { width: 48, depth: 22, height: 34 },
   *   finish: 'walnut',
   *   countertop: 'marble',
   *   hardware: 'gold',
   *   sink: 'vessel',
   *   mirror: true,
   *   lighting: true
   * });
   * ```
   */
  calculatePricing(config: VanityConfiguration): VanityPricing {
    const { dimensions } = config;
    const { basePricePerInch, taxRate, shippingRate } = VANITY_CONFIG.pricing;

    // Base price calculation
    const basePrice = dimensions.width * basePricePerInch;

    // Component costs
    const finishPrice = this.calculateFinishCost(basePrice);
    const countertopPrice = this.calculateCountertopCost(dimensions.width, dimensions.depth);
    const hardwarePrice = 50; // Standard hardware
    const sinkPrice = config.sink ? 200 : 0;
    const mirrorPrice = config.mirror ? 150 : 0;
    const lightingPrice = config.lighting ? 100 : 0;

    // Totals
    const subtotal = basePrice + finishPrice + countertopPrice + 
                    hardwarePrice + sinkPrice + mirrorPrice + lightingPrice;
    const tax = subtotal * taxRate;
    const shipping = subtotal * shippingRate;
    const total = subtotal + tax + shipping;

    return {
      basePrice,
      finishPrice,
      countertopPrice,
      hardwarePrice,
      sinkPrice,
      mirrorPrice,
      lightingPrice,
      subtotal,
      tax,
      shipping,
      total,
    };
  }

  /**
   * Calculate finish upgrade cost based on base price
   * 
   * @param basePrice - Base vanity price
   * @returns Finish upgrade cost (15% markup)
   * @private
   */
  private calculateFinishCost(basePrice: number): number {
    return basePrice * 0.15; // 15% markup
  }

  /**
   * Calculate countertop cost based on dimensions
   * 
   * @param width - Vanity width in inches
   * @param depth - Vanity depth in inches
   * @returns Countertop cost in dollars ($8/sq ft)
   * @private
   */
  private calculateCountertopCost(width: number, depth: number): number {
    const squareFeet = (width * depth) / 144; // Convert sq inches to sq feet
    return squareFeet * 8; // $8 per sq ft
  }

  /**
   * Format price for display with currency symbol
   * 
   * @param amount - Price amount in dollars
   * @returns Formatted price string (e.g., "$1,234.56")
   * 
   * @example
   * ```typescript
   * const formatted = service.formatPrice(1234.56);
   * console.log(formatted); // "$1,234.56"
   * ```
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /**
   * Get configured tax rate
   * 
   * @returns NY tax rate (8.875%)
   */
  getTaxRate(): number {
    return VANITY_CONFIG.pricing.taxRate;
  }

  /**
   * Get configured shipping rate
   * 
   * @returns Shipping rate (5% of subtotal)
   */
  getShippingRate(): number {
    return VANITY_CONFIG.pricing.shippingRate;
  }
}

export const vanityPricingService = new VanityPricingService();
