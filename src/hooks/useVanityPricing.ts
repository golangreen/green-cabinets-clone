/**
 * Custom hook for vanity pricing calculations
 */
import { useMemo } from 'react';
import { VANITY_CONFIG } from '@/config/app';
import type { VanityConfiguration, VanityPricing } from '@/types';

export function useVanityPricing(config: VanityConfiguration): VanityPricing {
  return useMemo(() => {
    const { dimensions } = config;
    const { basePricePerInch, taxRate, shippingRate } = VANITY_CONFIG.pricing;

    // Calculate base price
    const basePrice = dimensions.width * basePricePerInch;

    // Additional costs
    const finishPrice = basePrice * 0.15; // 15% markup for finish
    const countertopPrice = dimensions.width * dimensions.depth * 8; // $8 per sq ft
    const hardwarePrice = 50; // Standard hardware cost
    const sinkPrice = config.sink ? 200 : 0;
    const mirrorPrice = config.mirror ? 150 : 0;
    const lightingPrice = config.lighting ? 100 : 0;

    // Calculate totals
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
  }, [config]);
}
