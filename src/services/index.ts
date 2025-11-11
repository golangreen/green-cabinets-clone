/**
 * Services Index
 * Central export point for all business logic services
 */

// Vanity pricing service exports
export {
  calculateVanityPrice,
  calculateWallPrice,
  calculateFloorPrice,
  calculateTax,
  calculateShipping,
  calculateCompletePricing,
  getTaxRatePercentage,
  getStateFromZipCode,
  inchesWithFractionToDecimal,
  inchesToLinearFeet,
  getPricePerLinearFoot,
  TAX_RATES,
  SHIPPING_RATES,
  BRAND_PRICING,
  WALL_TILE_PRICING,
  FLOOR_TILE_PRICING,
  formatPrice as formatVanityPrice,
  type PricingCalculation
} from './vanityPricingService';

// Cabinet catalog service exports (re-exported from feature module)
export {
  searchCabinets,
  getCabinetByCode,
  getCabinetsByType,
  getCategories,
  getCategoriesForType,
  getCabinetsByCategory,
  getCabinetTypes,
  calculateCabinetPrice,
  calculateCabinetPriceByCode,
  getDoorStyle,
  getMaterialFinish,
  getDoorStylesByFrameType,
  getMaterialFinishesByBrand,
  getBrands,
  calculateHardwareCost,
  getHandleOptions,
  getHingeOptions,
  getRecommendedCabinets,
  calculateProjectTotal,
  validateCabinetConfig,
  formatCabinetPrice,
  getCatalogData
} from '@/features/cabinet-catalog';

