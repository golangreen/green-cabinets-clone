/**
 * Cabinet Catalog Feature
 * Handles cabinet search, pricing, and configuration
 */

// Components
export { CabinetWizardDialog as CabinetWizard } from './components/CabinetWizardDialog';

// Services
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
} from './services/cabinetCatalogService';

// Data exports
export { 
  CABINET_CATALOG, 
  DOOR_STYLES, 
  MATERIAL_FINISHES, 
  HARDWARE_OPTIONS 
} from './data/cabinetCatalog';

// Types are centralized in @/types/cabinet, but also export from data module
export type { 
  CabinetSpec, 
  DoorStyle, 
  MaterialFinish 
} from './data/cabinetCatalog';
export type { CabinetSearchFilters } from './services/cabinetCatalogService';
