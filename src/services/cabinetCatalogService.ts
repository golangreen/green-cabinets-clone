/**
 * Cabinet Catalog Service
 * Manages cabinet catalog operations, filtering, and pricing calculations
 */

import { 
  CABINET_CATALOG, 
  DOOR_STYLES, 
  MATERIAL_FINISHES, 
  HARDWARE_OPTIONS,
  CabinetSpec,
  DoorStyle,
  MaterialFinish,
  calculateCabinetPrice as libCalculateCabinetPrice,
  formatPrice as libFormatPrice
} from '@/lib/cabinetCatalog';

export interface CabinetSearchFilters {
  type?: string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  category?: string;
  subType?: string;
}

/**
 * Search cabinets by filters
 */
export function searchCabinets(filters: CabinetSearchFilters): CabinetSpec[] {
  return CABINET_CATALOG.filter(cabinet => {
    if (filters.type && cabinet.type !== filters.type) return false;
    if (filters.minWidth && cabinet.width < filters.minWidth) return false;
    if (filters.maxWidth && cabinet.width > filters.maxWidth) return false;
    if (filters.minHeight && cabinet.height < filters.minHeight) return false;
    if (filters.maxHeight && cabinet.height > filters.maxHeight) return false;
    if (filters.category && cabinet.category !== filters.category) return false;
    if (filters.subType && cabinet.subType !== filters.subType) return false;
    return true;
  });
}

/**
 * Get cabinet by code
 */
export function getCabinetByCode(code: string): CabinetSpec | undefined {
  return CABINET_CATALOG.find(cabinet => cabinet.code === code);
}

/**
 * Get all cabinets by type
 */
export function getCabinetsByType(type: string): CabinetSpec[] {
  return CABINET_CATALOG.filter(cabinet => cabinet.type === type);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  const categories = new Set(CABINET_CATALOG.map(c => c.category));
  return Array.from(categories).sort();
}

/**
 * Get categories for a specific cabinet type
 */
export function getCategoriesForType(type: string): string[] {
  const cabinets = CABINET_CATALOG.filter(c => c.type === type);
  const categories = new Set(cabinets.map(c => c.category));
  return Array.from(categories);
}

/**
 * Get cabinets by category
 */
export function getCabinetsByCategory(category: string): CabinetSpec[] {
  return CABINET_CATALOG.filter(c => c.category === category);
}

/**
 * Get all unique cabinet types
 */
export function getCabinetTypes(): string[] {
  const types = new Set(CABINET_CATALOG.map(c => c.type));
  return Array.from(types);
}

/**
 * Calculate cabinet price with material, door style, and hardware
 * Uses the full calculation including hardware costs
 */
export function calculateCabinetPrice(
  cabinet: CabinetSpec,
  finishId: string,
  doorStyleId: string = "flat-framed",
  handleType: keyof typeof HARDWARE_OPTIONS.handles = "bar",
  numHandles: number = 2
): number {
  return libCalculateCabinetPrice(cabinet, finishId, doorStyleId, handleType, numHandles);
}

/**
 * Calculate cabinet price by code (simpler version without hardware)
 */
export function calculateCabinetPriceByCode(
  cabinetCode: string,
  materialFinishId: string,
  doorStyleId: string
): number {
  const cabinet = getCabinetByCode(cabinetCode);
  if (!cabinet) return 0;
  
  return calculateCabinetPrice(cabinet, materialFinishId, doorStyleId, "none", 0);
}

/**
 * Format price as currency string
 */
export function formatPrice(price: number): string {
  return libFormatPrice(price);
}

/**
 * Get door style by ID
 */
export function getDoorStyle(id: string): DoorStyle | undefined {
  return DOOR_STYLES.find(style => style.id === id);
}

/**
 * Get material finish by ID
 */
export function getMaterialFinish(id: string): MaterialFinish | undefined {
  return MATERIAL_FINISHES.find(finish => finish.id === id);
}

/**
 * Get door styles by frame type
 */
export function getDoorStylesByFrameType(frameType: "framed" | "frameless" | "inset"): DoorStyle[] {
  return DOOR_STYLES.filter(style => style.frameType === frameType);
}

/**
 * Get material finishes by brand
 */
export function getMaterialFinishesByBrand(brand: string): MaterialFinish[] {
  return MATERIAL_FINISHES.filter(finish => finish.brand === brand);
}

/**
 * Get all available brands
 */
export function getBrands(): string[] {
  const brands = new Set(MATERIAL_FINISHES.map(f => f.brand));
  return Array.from(brands);
}

/**
 * Calculate hardware cost
 */
export function calculateHardwareCost(
  handleType: keyof typeof HARDWARE_OPTIONS.handles,
  hingeType: keyof typeof HARDWARE_OPTIONS.hinges,
  quantity: number
): number {
  const handlePrice = HARDWARE_OPTIONS.handles[handleType]?.pricePerUnit || 0;
  const hingePrice = HARDWARE_OPTIONS.hinges[hingeType]?.pricePerUnit || 0;
  
  return (handlePrice + hingePrice) * quantity;
}

/**
 * Get hardware options
 */
export function getHandleOptions() {
  return HARDWARE_OPTIONS.handles;
}

export function getHingeOptions() {
  return HARDWARE_OPTIONS.hinges;
}

/**
 * Get recommended cabinets for a space
 */
export function getRecommendedCabinets(
  spaceWidth: number,
  spaceHeight: number,
  cabinetType: string
): CabinetSpec[] {
  return CABINET_CATALOG.filter(cabinet => {
    return (
      cabinet.type === cabinetType &&
      cabinet.width <= spaceWidth &&
      cabinet.height <= spaceHeight
    );
  }).sort((a, b) => {
    // Sort by how well they fit the space (larger is better)
    const aFit = (a.width / spaceWidth) + (a.height / spaceHeight);
    const bFit = (b.width / spaceWidth) + (b.height / spaceHeight);
    return bFit - aFit;
  });
}

/**
 * Calculate total project cost
 */
export function calculateProjectTotal(
  cabinets: Array<{
    code: string;
    quantity: number;
    materialFinishId: string;
    doorStyleId: string;
  }>,
  hardwareConfig?: {
    handleType: keyof typeof HARDWARE_OPTIONS.handles;
    hingeType: keyof typeof HARDWARE_OPTIONS.hinges;
  }
): number {
  let total = 0;
  
  // Calculate cabinet costs
  cabinets.forEach(item => {
    const cabinet = getCabinetByCode(item.code);
    if (!cabinet) return;
    
    const cabinetPrice = calculateCabinetPrice(
      cabinet,
      item.materialFinishId,
      item.doorStyleId,
      hardwareConfig?.handleType || "none",
      0
    );
    total += cabinetPrice * item.quantity;
    
    // Add hardware if specified
    if (hardwareConfig) {
      const hardwareCost = calculateHardwareCost(
        hardwareConfig.handleType,
        hardwareConfig.hingeType,
        item.quantity
      );
      total += hardwareCost;
    }
  });
  
  return total;
}

/**
 * Export catalog data (for external use)
 */
export function getCatalogData() {
  return {
    cabinets: CABINET_CATALOG,
    doorStyles: DOOR_STYLES,
    materialFinishes: MATERIAL_FINISHES,
    hardwareOptions: HARDWARE_OPTIONS,
  };
}

/**
 * Validate cabinet configuration
 */
export function validateCabinetConfig(
  cabinetCode: string,
  materialFinishId: string,
  doorStyleId: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const cabinet = getCabinetByCode(cabinetCode);
  if (!cabinet) {
    errors.push(`Cabinet code "${cabinetCode}" not found`);
  }
  
  const material = getMaterialFinish(materialFinishId);
  if (!material) {
    errors.push(`Material finish "${materialFinishId}" not found`);
  }
  
  const doorStyle = getDoorStyle(doorStyleId);
  if (!doorStyle) {
    errors.push(`Door style "${doorStyleId}" not found`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
