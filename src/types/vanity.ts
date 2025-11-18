/**
 * Vanity Designer Types
 */

export interface VanityDimensions {
  width: number;
  depth: number;
  height: number;
}

export interface VanityConfiguration {
  dimensions: VanityDimensions;
  finish: string;
  countertop: string;
  hardware: string;
  sink: string;
  mirror: boolean;
  lighting: boolean;
}

export interface VanityPricing {
  basePrice: number;
  finishPrice: number;
  countertopPrice: number;
  hardwarePrice: number;
  sinkPrice: number;
  mirrorPrice: number;
  lightingPrice: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface FinishOption {
  id: string;
  name: string;
  brand: string;
  color: string;
  priceMultiplier: number;
  imageUrl?: string;
}

export interface CountertopMaterial {
  id: string;
  name: string;
  pricePerSqFt: number;
  description?: string;
}
