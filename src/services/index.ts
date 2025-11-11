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
  inchesToLinearFeet,
  getPricePerLinearFoot,
  TAX_RATES,
  SHIPPING_RATES,
  BRAND_PRICING,
  WALL_TILE_PRICING,
  FLOOR_TILE_PRICING,
  formatPrice as formatVanityPrice
} from './vanityPricingService';

// Cabinet catalog service exports
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
  formatPrice as formatCabinetPrice,
  getCatalogData
} from './cabinetCatalogService';

// Quote service exports
export * from './quoteService';
