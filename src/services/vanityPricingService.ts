/**
 * Service for vanity pricing calculations and business logic
 */
import { VANITY_CONFIG } from '@/config/app';
import type { VanityConfiguration, VanityPricing } from '@/types';

export class VanityPricingService {
  /**
   * Calculate complete pricing breakdown for a vanity configuration
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
   * Calculate finish upgrade cost
   */
  private calculateFinishCost(basePrice: number): number {
    return basePrice * 0.15; // 15% markup
  }

  /**
   * Calculate countertop cost based on dimensions
   */
  private calculateCountertopCost(width: number, depth: number): number {
    const squareFeet = (width * depth) / 144; // Convert sq inches to sq feet
    return squareFeet * 8; // $8 per sq ft
  }

  /**
   * Format price for display
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /**
   * Get tax rate
   */
  getTaxRate(): number {
    return VANITY_CONFIG.pricing.taxRate;
  }

  /**
   * Get shipping rate
   */
  getShippingRate(): number {
    return VANITY_CONFIG.pricing.shippingRate;
  }
}

export const vanityPricingService = new VanityPricingService();
