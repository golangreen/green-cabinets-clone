/**
 * Vanity Pricing Service
 * Handles all pricing calculations for custom bathroom vanities
 */

// Tax rates by state
export const TAX_RATES: { [key: string]: number } = {
  "NY": 0.08875, // 8.875%
  "NJ": 0.06625, // 6.625%
  "CT": 0.0635,  // 6.35%
  "PA": 0.06,    // 6%
  "other": 0,    // No tax for other states
};

// Shipping rates by state
export const SHIPPING_RATES: { [key: string]: number } = {
  "NY": 150,
  "NJ": 200,
  "CT": 250,
  "PA": 300,
  "other": 400,
};

// Brand pricing per linear foot
export const BRAND_PRICING: { [key: string]: number } = {
  "Tafisa": 250,
  "Egger": 300,
  "Shinnoki": 350,
};

// Wall tile pricing per square foot
export const WALL_TILE_PRICING: { [key: string]: number } = {
  "white-subway": 15,
  "gray-subway": 18,
  "marble": 35,
  "travertine": 30,
  "porcelain": 22,
  "mosaic": 40,
};

// Floor tile pricing per square foot
export const FLOOR_TILE_PRICING: { [key: string]: number } = {
  "porcelain-white": 12,
  "porcelain-gray": 12,
  "marble-white": 45,
  "marble-black": 45,
  "wood-look": 18,
  "hexagon": 25,
};

export interface PricingCalculation {
  basePrice: number;
  wallPrice: number;
  floorPrice: number;
  subtotal: number;
  tax: number;
  shipping: number;
  totalPrice: number;
}

/**
 * Calculate vanity base price based on linear feet (width)
 */
export function calculateVanityPrice(
  widthInches: number,
  selectedBrand: string
): number {
  if (!widthInches || !selectedBrand) return 0;
  
  const linearFeet = widthInches / 12;
  const pricePerLinearFoot = BRAND_PRICING[selectedBrand] || 0;
  
  return linearFeet * pricePerLinearFoot;
}

/**
 * Calculate wall tile price
 */
export function calculateWallPrice(
  wallHeight: number,
  wallWidth: number,
  tileStyle: string
): number {
  if (!wallHeight || !wallWidth || !tileStyle) return 0;
  
  const heightFeet = wallHeight / 12;
  const widthFeet = wallWidth / 12;
  const squareFeet = heightFeet * widthFeet;
  const pricePerSqFt = WALL_TILE_PRICING[tileStyle] || 0;
  
  return squareFeet * pricePerSqFt;
}

/**
 * Calculate floor tile price
 */
export function calculateFloorPrice(
  roomLength: number,
  roomWidth: number,
  floorTileStyle: string
): number {
  if (!roomLength || !roomWidth || !floorTileStyle) return 0;
  
  const lengthFeet = roomLength;
  const widthFeet = roomWidth;
  const squareFeet = lengthFeet * widthFeet;
  const pricePerSqFt = FLOOR_TILE_PRICING[floorTileStyle] || 0;
  
  return squareFeet * pricePerSqFt;
}

/**
 * Calculate sales tax based on state
 */
export function calculateTax(subtotal: number, state: string): number {
  if (!state || !subtotal) return 0;
  const taxRate = TAX_RATES[state] || 0;
  return subtotal * taxRate;
}

/**
 * Calculate shipping cost based on state
 */
export function calculateShipping(state: string): number {
  if (!state) return 0;
  return SHIPPING_RATES[state] || SHIPPING_RATES["other"];
}

/**
 * Calculate complete pricing breakdown
 */
export function calculateCompletePricing(params: {
  widthInches: number;
  selectedBrand: string;
  state: string;
  includeWalls?: boolean;
  wallHeight?: number;
  wallWidth?: number;
  wallTileStyle?: string;
  includeFloor?: boolean;
  roomLength?: number;
  roomWidth?: number;
  floorTileStyle?: string;
}): PricingCalculation {
  const basePrice = calculateVanityPrice(params.widthInches, params.selectedBrand);
  
  const wallPrice = params.includeWalls && params.wallHeight && params.wallWidth && params.wallTileStyle
    ? calculateWallPrice(params.wallHeight, params.wallWidth, params.wallTileStyle)
    : 0;
  
  const floorPrice = params.includeFloor && params.roomLength && params.roomWidth && params.floorTileStyle
    ? calculateFloorPrice(params.roomLength, params.roomWidth, params.floorTileStyle)
    : 0;
  
  const subtotal = basePrice + wallPrice + floorPrice;
  const tax = calculateTax(subtotal, params.state);
  const shipping = calculateShipping(params.state);
  const totalPrice = subtotal + tax + shipping;
  
  return {
    basePrice,
    wallPrice,
    floorPrice,
    subtotal,
    tax,
    shipping,
    totalPrice,
  };
}

/**
 * Get tax rate percentage for display
 */
export function getTaxRatePercentage(state: string): number {
  return (TAX_RATES[state] || 0) * 100;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Convert inches to linear feet
 */
export function inchesToLinearFeet(inches: number): number {
  return inches / 12;
}

/**
 * Calculate price per linear foot
 */
export function getPricePerLinearFoot(brand: string): number {
  return BRAND_PRICING[brand] || 0;
}
