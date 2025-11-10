// St. Martin Cabinetry 2025 Specification Book
// Complete catalog with item codes, dimensions, and base pricing
// Pricing uses priceMultiplier system with your existing brand finishes

export interface CabinetSpec {
  code: string; // St. Martin item code (e.g., W1212L/R, B1834)
  type: "Base Cabinet" | "Wall Cabinet" | "Tall Cabinet" | "Corner Cabinet" | "Specialty";
  subType: string;
  width: number;  // inches
  height: number; // inches
  depth: number;  // inches
  label: string;  // Display label
  description: string;
  basePrice: number; // Base price (uses G1 from St. Martin)
  category: string;
  notes?: string;
}

export interface MaterialFinish {
  id: string;
  name: string;
  brand: string;
  priceMultiplier: number; // 1.0 = base price, 1.2 = 20% increase, etc.
}

// Material/Finish pricing modifiers - Your existing brands
export const MATERIAL_FINISHES: MaterialFinish[] = [
  { id: "tafisa-white", name: "White", brand: "Tafisa", priceMultiplier: 1.0 },
  { id: "tafisa-cream", name: "Cream Puff", brand: "Tafisa", priceMultiplier: 1.05 },
  { id: "tafisa-grey", name: "Milky Way Grey", brand: "Tafisa", priceMultiplier: 1.05 },
  { id: "egger-oak", name: "Casella Oak", brand: "Egger", priceMultiplier: 1.15 },
  { id: "egger-white-oak", name: "White Oak", brand: "Egger", priceMultiplier: 1.15 },
  { id: "egger-walnut", name: "Walnut", brand: "Egger", priceMultiplier: 1.20 },
  { id: "shinnoki-oak", name: "Natural Oak", brand: "Shinnoki", priceMultiplier: 1.35 },
  { id: "shinnoki-walnut", name: "Pure Walnut", brand: "Shinnoki", priceMultiplier: 1.40 },
];

// Hardware pricing
export const HARDWARE_OPTIONS = {
  handles: {
    bar: { name: "Bar Handle", pricePerUnit: 8.50 },
    knob: { name: "Knob", pricePerUnit: 5.00 },
    fingerPull: { name: "Finger Pull", pricePerUnit: 30.00 },
    fingerPull45: { name: "45° Finger Pull", pricePerUnit: 30.00 },
    none: { name: "Push-to-Open", pricePerUnit: 15.00 },
  },
  hinges: {
    blum: { name: "Blum Soft Close", pricePerUnit: 12.00 },
    standard: { name: "Standard", pricePerUnit: 4.50 },
  },
};

// ST. MARTIN 2025 CABINET CATALOG - With St. Martin specs and your pricing system
export const CABINET_CATALOG: CabinetSpec[] = [
  // ==================== WALL CABINETS - 12" HEIGHT ====================
  {
    code: "W1212L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 12,
    height: 12,
    depth: 13,
    label: "W1212L/R",
    description: "12\" x 12\" Wall Single Door",
    basePrice: 645,
    category: "Wall - 12\" Height",
    notes: "No shelf. Standard 13\" depth."
  },
  {
    code: "W1512L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 15,
    height: 12,
    depth: 13,
    label: "W1512L/R",
    description: "15\" x 12\" Wall Single Door",
    basePrice: 662,
    category: "Wall - 12\" Height"
  },
  {
    code: "W1812L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 18,
    height: 12,
    depth: 13,
    label: "W1812L/R",
    description: "18\" x 12\" Wall Single Door",
    basePrice: 679,
    category: "Wall - 12\" Height"
  },
  {
    code: "W2412",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 24,
    height: 12,
    depth: 13,
    label: "W2412",
    description: "24\" x 12\" Wall Double Door",
    basePrice: 882,
    category: "Wall - 12\" Height"
  },
  {
    code: "W3012",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 30,
    height: 12,
    depth: 13,
    label: "W3012",
    description: "30\" x 12\" Wall Double Door",
    basePrice: 899,
    category: "Wall - 12\" Height"
  },
  {
    code: "W3612",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 36,
    height: 12,
    depth: 13,
    label: "W3612",
    description: "36\" x 12\" Wall Double Door",
    basePrice: 936,
    category: "Wall - 12\" Height"
  },

  // ==================== WALL CABINETS - 30" HEIGHT ====================
  {
    code: "W1230L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 12,
    height: 30,
    depth: 13,
    label: "W1230L/R",
    description: "12\" x 30\" Wall Single Door",
    basePrice: 682,
    category: "Wall - 30\" Height"
  },
  {
    code: "W1830L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 18,
    height: 30,
    depth: 13,
    label: "W1830L/R",
    description: "18\" x 30\" Wall Single Door",
    basePrice: 803,
    category: "Wall - 30\" Height"
  },
  {
    code: "W2430L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 24,
    height: 30,
    depth: 13,
    label: "W2430L/R",
    description: "24\" x 30\" Wall Single Door",
    basePrice: 927,
    category: "Wall - 30\" Height"
  },
  {
    code: "W2430",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 24,
    height: 30,
    depth: 13,
    label: "W2430",
    description: "24\" x 30\" Wall Double Door",
    basePrice: 1081,
    category: "Wall - 30\" Height"
  },
  {
    code: "W3030",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 30,
    height: 30,
    depth: 13,
    label: "W3030",
    description: "30\" x 30\" Wall Double Door",
    basePrice: 1178,
    category: "Wall - 30\" Height"
  },
  {
    code: "W3630",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 36,
    height: 30,
    depth: 13,
    label: "W3630",
    description: "36\" x 30\" Wall Double Door",
    basePrice: 1331,
    category: "Wall - 30\" Height"
  },

  // ==================== WALL CABINETS - 36" HEIGHT ====================
  {
    code: "W1236L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 12,
    height: 36,
    depth: 13,
    label: "W1236L/R",
    description: "12\" x 36\" Wall Single Door",
    basePrice: 738,
    category: "Wall - 36\" Height"
  },
  {
    code: "W1836L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 18,
    height: 36,
    depth: 13,
    label: "W1836L/R",
    description: "18\" x 36\" Wall Single Door",
    basePrice: 930,
    category: "Wall - 36\" Height"
  },
  {
    code: "W2436",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 24,
    height: 36,
    depth: 13,
    label: "W2436",
    description: "24\" x 36\" Wall Double Door",
    basePrice: 1288,
    category: "Wall - 36\" Height"
  },
  {
    code: "W3036",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 30,
    height: 36,
    depth: 13,
    label: "W3036",
    description: "30\" x 36\" Wall Double Door",
    basePrice: 1470,
    category: "Wall - 36\" Height"
  },
  {
    code: "W3636",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 36,
    height: 36,
    depth: 13,
    label: "W3636",
    description: "36\" x 36\" Wall Double Door",
    basePrice: 1641,
    category: "Wall - 36\" Height"
  },

  // ==================== WALL CABINETS - 42" HEIGHT ====================
  {
    code: "W1842L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 18,
    height: 42,
    depth: 13,
    label: "W1842L/R",
    description: "18\" x 42\" Wall Single Door",
    basePrice: 1057,
    category: "Wall - 42\" Height"
  },
  {
    code: "W2442L/R",
    type: "Wall Cabinet",
    subType: "single-door",
    width: 24,
    height: 42,
    depth: 13,
    label: "W2442L/R",
    description: "24\" x 42\" Wall Single Door",
    basePrice: 1202,
    category: "Wall - 42\" Height"
  },
  {
    code: "W3042",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 30,
    height: 42,
    depth: 13,
    label: "W3042",
    description: "30\" x 42\" Wall Double Door",
    basePrice: 1676,
    category: "Wall - 42\" Height"
  },
  {
    code: "W3642",
    type: "Wall Cabinet",
    subType: "double-door",
    width: 36,
    height: 42,
    depth: 13,
    label: "W3642",
    description: "36\" x 42\" Wall Double Door",
    basePrice: 1858,
    category: "Wall - 42\" Height"
  },

  // ==================== BASE CABINETS - STANDARD ====================
  {
    code: "B1234",
    type: "Base Cabinet",
    subType: "standard",
    width: 12,
    height: 34.5,
    depth: 24,
    label: "B1234",
    description: "12\" Base Cabinet",
    basePrice: 800,
    category: "Base - Standard",
    notes: "One door, one adjustable shelf"
  },
  {
    code: "B1834",
    type: "Base Cabinet",
    subType: "standard",
    width: 18,
    height: 34.5,
    depth: 24,
    label: "B1834",
    description: "18\" Base Cabinet",
    basePrice: 950,
    category: "Base - Standard"
  },
  {
    code: "B2434",
    type: "Base Cabinet",
    subType: "standard",
    width: 24,
    height: 34.5,
    depth: 24,
    label: "B2434",
    description: "24\" Base Cabinet",
    basePrice: 1100,
    category: "Base - Standard"
  },
  {
    code: "B3034",
    type: "Base Cabinet",
    subType: "standard",
    width: 30,
    height: 34.5,
    depth: 24,
    label: "B3034",
    description: "30\" Base Cabinet",
    basePrice: 1250,
    category: "Base - Standard"
  },
  {
    code: "B3634",
    type: "Base Cabinet",
    subType: "standard",
    width: 36,
    height: 34.5,
    depth: 24,
    label: "B3634",
    description: "36\" Base Cabinet",
    basePrice: 1400,
    category: "Base - Standard"
  },

  // ==================== BASE CABINETS - DRAWER ====================
  {
    code: "DB1834",
    type: "Base Cabinet",
    subType: "drawer",
    width: 18,
    height: 34.5,
    depth: 24,
    label: "DB1834",
    description: "18\" 3-Drawer Base",
    basePrice: 1350,
    category: "Base - Drawer",
    notes: "Three full-extension soft-close drawers"
  },
  {
    code: "DB2434",
    type: "Base Cabinet",
    subType: "drawer",
    width: 24,
    height: 34.5,
    depth: 24,
    label: "DB2434",
    description: "24\" 3-Drawer Base",
    basePrice: 1550,
    category: "Base - Drawer"
  },
  {
    code: "DB3034",
    type: "Base Cabinet",
    subType: "drawer",
    width: 30,
    height: 34.5,
    depth: 24,
    label: "DB3034",
    description: "30\" 3-Drawer Base",
    basePrice: 1750,
    category: "Base - Drawer"
  },

  // ==================== TALL CABINETS - PANTRY ====================
  {
    code: "PC1884",
    type: "Tall Cabinet",
    subType: "pantry",
    width: 18,
    height: 84,
    depth: 24,
    label: "PC1884",
    description: "18\" x 84\" Pantry Cabinet",
    basePrice: 2200,
    category: "Tall - Pantry",
    notes: "Four adjustable shelves"
  },
  {
    code: "PC2484",
    type: "Tall Cabinet",
    subType: "pantry",
    width: 24,
    height: 84,
    depth: 24,
    label: "PC2484",
    description: "24\" x 84\" Pantry Cabinet",
    basePrice: 2500,
    category: "Tall - Pantry"
  },
  {
    code: "PC3084",
    type: "Tall Cabinet",
    subType: "pantry",
    width: 30,
    height: 84,
    depth: 24,
    label: "PC3084",
    description: "30\" x 84\" Pantry Cabinet",
    basePrice: 2800,
    category: "Tall - Pantry"
  },

  // ==================== TALL CABINETS - OVEN ====================
  {
    code: "OVD84",
    type: "Tall Cabinet",
    subType: "oven",
    width: 30,
    height: 84,
    depth: 24,
    label: "OVD84",
    description: "30\" Oven Cabinet 84\"H",
    basePrice: 3200,
    category: "Tall - Specialty",
    notes: "Designed for standard 30\" wall ovens"
  },
  {
    code: "OVD96",
    type: "Tall Cabinet",
    subType: "oven",
    width: 33,
    height: 96,
    depth: 24,
    label: "OVD96",
    description: "33\" Oven Cabinet 96\"H",
    basePrice: 3600,
    category: "Tall - Specialty"
  },
];

// Helper function to calculate cabinet price with finish multiplier and hardware
export function calculateCabinetPrice(
  cabinet: CabinetSpec,
  finishId: string,
  handleType: keyof typeof HARDWARE_OPTIONS.handles = "bar",
  numHandles: number = 2
): number {
  const finish = MATERIAL_FINISHES.find(f => f.id === finishId);
  const priceMultiplier = finish?.priceMultiplier || 1.0;
  
  let price = cabinet.basePrice * priceMultiplier;
  
  // Add hardware costs
  const handleOption = HARDWARE_OPTIONS.handles[handleType];
  if (handleOption) {
    price += handleOption.pricePerUnit * numHandles;
  }
  
  return price;
}

// Helper function to format price
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

// Get all cabinets by type
export function getCabinetsByType(type: CabinetSpec["type"]): CabinetSpec[] {
  return CABINET_CATALOG.filter(cab => cab.type === type);
}

// Get all cabinets by category
export function getCabinetsByCategory(category: string): CabinetSpec[] {
  return CABINET_CATALOG.filter(cab => cab.category === category);
}

// Search cabinets by code or description
export function searchCabinets(query: string): CabinetSpec[] {
  const lowerQuery = query.toLowerCase();
  return CABINET_CATALOG.filter(cab => 
    cab.code.toLowerCase().includes(lowerQuery) ||
    cab.description.toLowerCase().includes(lowerQuery) ||
    cab.label.toLowerCase().includes(lowerQuery)
  );
}
