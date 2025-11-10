export interface CabinetSpec {
  type: "Base Cabinet" | "Wall Cabinet" | "Tall Cabinet" | "Corner Cabinet";
  subType: string;
  width: number;      // inches
  height: number;     // inches
  depth: number;      // inches
  label: string;      // Product code (e.g., "B24", "W3030")
  description: string;
  basePrice: number;  // Base price in dollars
  category: string;
}

export interface MaterialFinish {
  id: string;
  name: string;
  brand: string;
  priceMultiplier: number; // 1.0 = base price, 1.2 = 20% increase, etc.
}

// Material/Finish pricing modifiers
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

// MAIN CABINET CATALOG - Edit this with your actual products and pricing
export const CABINET_CATALOG: CabinetSpec[] = [
  // ===== BASE CABINETS =====
  {
    type: "Base Cabinet",
    subType: "standard",
    width: 12,
    height: 34.5,
    depth: 24,
    label: "B12",
    description: "12\" Base Cabinet",
    basePrice: 185,
    category: "Base - Standard"
  },
  {
    type: "Base Cabinet",
    subType: "standard",
    width: 15,
    height: 34.5,
    depth: 24,
    label: "B15",
    description: "15\" Base Cabinet",
    basePrice: 210,
    category: "Base - Standard"
  },
  {
    type: "Base Cabinet",
    subType: "standard",
    width: 18,
    height: 34.5,
    depth: 24,
    label: "B18",
    description: "18\" Base Cabinet",
    basePrice: 235,
    category: "Base - Standard"
  },
  {
    type: "Base Cabinet",
    subType: "standard",
    width: 24,
    height: 34.5,
    depth: 24,
    label: "B24",
    description: "24\" Base Cabinet",
    basePrice: 285,
    category: "Base - Standard"
  },
  {
    type: "Base Cabinet",
    subType: "standard",
    width: 30,
    height: 34.5,
    depth: 24,
    label: "B30",
    description: "30\" Base Cabinet",
    basePrice: 335,
    category: "Base - Standard"
  },
  {
    type: "Base Cabinet",
    subType: "standard",
    width: 36,
    height: 34.5,
    depth: 24,
    label: "B36",
    description: "36\" Base Cabinet",
    basePrice: 385,
    category: "Base - Standard"
  },
  
  // ===== DRAWER BASE CABINETS =====
  {
    type: "Base Cabinet",
    subType: "drawer",
    width: 18,
    height: 34.5,
    depth: 24,
    label: "DB18",
    description: "18\" Drawer Base (3 drawers)",
    basePrice: 395,
    category: "Base - Drawer"
  },
  {
    type: "Base Cabinet",
    subType: "drawer",
    width: 24,
    height: 34.5,
    depth: 24,
    label: "DB24",
    description: "24\" Drawer Base (3 drawers)",
    basePrice: 445,
    category: "Base - Drawer"
  },
  {
    type: "Base Cabinet",
    subType: "drawer",
    width: 30,
    height: 34.5,
    depth: 24,
    label: "DB30",
    description: "30\" Drawer Base (3 drawers)",
    basePrice: 495,
    category: "Base - Drawer"
  },
  
  // ===== WALL CABINETS (30" Height) =====
  {
    type: "Wall Cabinet",
    subType: "standard",
    width: 12,
    height: 30,
    depth: 12,
    label: "W1230",
    description: "12\" Wall 30\"H",
    basePrice: 145,
    category: "Wall - 30\" Height"
  },
  {
    type: "Wall Cabinet",
    subType: "standard",
    width: 18,
    height: 30,
    depth: 12,
    label: "W1830",
    description: "18\" Wall 30\"H",
    basePrice: 175,
    category: "Wall - 30\" Height"
  },
  {
    type: "Wall Cabinet",
    subType: "standard",
    width: 24,
    height: 30,
    depth: 12,
    label: "W2430",
    description: "24\" Wall 30\"H",
    basePrice: 205,
    category: "Wall - 30\" Height"
  },
  {
    type: "Wall Cabinet",
    subType: "standard",
    width: 30,
    height: 30,
    depth: 12,
    label: "W3030",
    description: "30\" Wall 30\"H",
    basePrice: 235,
    category: "Wall - 30\" Height"
  },
  {
    type: "Wall Cabinet",
    subType: "standard",
    width: 36,
    height: 30,
    depth: 12,
    label: "W3630",
    description: "36\" Wall 30\"H",
    basePrice: 265,
    category: "Wall - 30\" Height"
  },
  
  // ===== WALL CABINETS (42" Height) =====
  {
    type: "Wall Cabinet",
    subType: "standard",
    width: 18,
    height: 42,
    depth: 12,
    label: "W1842",
    description: "18\" Wall 42\"H",
    basePrice: 235,
    category: "Wall - 42\" Height"
  },
  {
    type: "Wall Cabinet",
    subType: "standard",
    width: 24,
    height: 42,
    depth: 12,
    label: "W2442",
    description: "24\" Wall 42\"H",
    basePrice: 275,
    category: "Wall - 42\" Height"
  },
  {
    type: "Wall Cabinet",
    subType: "standard",
    width: 30,
    height: 42,
    depth: 12,
    label: "W3042",
    description: "30\" Wall 42\"H",
    basePrice: 315,
    category: "Wall - 42\" Height"
  },
  {
    type: "Wall Cabinet",
    subType: "standard",
    width: 36,
    height: 42,
    depth: 12,
    label: "W3642",
    description: "36\" Wall 42\"H",
    basePrice: 355,
    category: "Wall - 42\" Height"
  },
  
  // ===== TALL CABINETS =====
  {
    type: "Tall Cabinet",
    subType: "pantry",
    width: 18,
    height: 84,
    depth: 24,
    label: "T1884",
    description: "18\" Pantry Cabinet",
    basePrice: 685,
    category: "Tall - Pantry"
  },
  {
    type: "Tall Cabinet",
    subType: "pantry",
    width: 24,
    height: 84,
    depth: 24,
    label: "T2484",
    description: "24\" Pantry Cabinet",
    basePrice: 785,
    category: "Tall - Pantry"
  },
  {
    type: "Tall Cabinet",
    subType: "pantry",
    width: 30,
    height: 84,
    depth: 24,
    label: "T3084",
    description: "30\" Pantry Cabinet",
    basePrice: 885,
    category: "Tall - Pantry"
  },
  {
    type: "Tall Cabinet",
    subType: "oven",
    width: 30,
    height: 84,
    depth: 24,
    label: "TO30",
    description: "30\" Oven Cabinet",
    basePrice: 945,
    category: "Tall - Specialty"
  },
  {
    type: "Tall Cabinet",
    subType: "oven",
    width: 33,
    height: 84,
    depth: 24,
    label: "TO33",
    description: "33\" Oven Cabinet",
    basePrice: 985,
    category: "Tall - Specialty"
  },
  
  // ===== CORNER CABINETS =====
  {
    type: "Corner Cabinet",
    subType: "base",
    width: 36,
    height: 34.5,
    depth: 36,
    label: "LSB36",
    description: "36\" L-Shaped Corner Base",
    basePrice: 485,
    category: "Corner - Base"
  },
  {
    type: "Corner Cabinet",
    subType: "base",
    width: 42,
    height: 34.5,
    depth: 42,
    label: "LSB42",
    description: "42\" L-Shaped Corner Base",
    basePrice: 545,
    category: "Corner - Base"
  },
  {
    type: "Corner Cabinet",
    subType: "wall",
    width: 24,
    height: 30,
    depth: 24,
    label: "LSW24",
    description: "24\" L-Shaped Corner Wall",
    basePrice: 325,
    category: "Corner - Wall"
  },
  {
    type: "Corner Cabinet",
    subType: "wall",
    width: 30,
    height: 30,
    depth: 30,
    label: "LSW30",
    description: "30\" L-Shaped Corner Wall",
    basePrice: 375,
    category: "Corner - Wall"
  },
  
  // ===== U-SHAPED CORNER CABINETS =====
  {
    type: "Corner Cabinet",
    subType: "base-u",
    width: 48,
    height: 34.5,
    depth: 48,
    label: "USB48",
    description: "48\" U-Shaped Corner Base",
    basePrice: 685,
    category: "Corner - Base"
  },
  {
    type: "Corner Cabinet",
    subType: "base-u",
    width: 60,
    height: 34.5,
    depth: 60,
    label: "USB60",
    description: "60\" U-Shaped Corner Base",
    basePrice: 795,
    category: "Corner - Base"
  },
  
  // ===== DIAGONAL CORNER CABINETS (45°) =====
  {
    type: "Corner Cabinet",
    subType: "diagonal",
    width: 36,
    height: 34.5,
    depth: 36,
    label: "DCB36",
    description: "36\" Diagonal Corner Base",
    basePrice: 425,
    category: "Corner - Base"
  },
  {
    type: "Corner Cabinet",
    subType: "diagonal",
    width: 42,
    height: 34.5,
    depth: 42,
    label: "DCB42",
    description: "42\" Diagonal Corner Base",
    basePrice: 485,
    category: "Corner - Base"
  },
  {
    type: "Corner Cabinet",
    subType: "diagonal-wall",
    width: 24,
    height: 30,
    depth: 24,
    label: "DCW24",
    description: "24\" Diagonal Corner Wall",
    basePrice: 285,
    category: "Corner - Wall"
  },
  {
    type: "Corner Cabinet",
    subType: "diagonal-wall",
    width: 30,
    height: 30,
    depth: 30,
    label: "DCW30",
    description: "30\" Diagonal Corner Wall",
    basePrice: 335,
    category: "Corner - Wall"
  },
  
  // ===== LAZY SUSAN CORNER CABINETS (Circular) =====
  {
    type: "Corner Cabinet",
    subType: "lazy-susan",
    width: 33,
    height: 34.5,
    depth: 33,
    label: "LSBC33",
    description: "33\" Lazy Susan Corner Base",
    basePrice: 525,
    category: "Corner - Base"
  },
  {
    type: "Corner Cabinet",
    subType: "lazy-susan",
    width: 36,
    height: 34.5,
    depth: 36,
    label: "LSBC36",
    description: "36\" Lazy Susan Corner Base",
    basePrice: 565,
    category: "Corner - Base"
  },
  {
    type: "Corner Cabinet",
    subType: "lazy-susan",
    width: 39,
    height: 34.5,
    depth: 39,
    label: "LSBC39",
    description: "39\" Lazy Susan Corner Base",
    basePrice: 595,
    category: "Corner - Base"
  },
  {
    type: "Corner Cabinet",
    subType: "lazy-susan-wall",
    width: 24,
    height: 30,
    depth: 24,
    label: "LSWC24",
    description: "24\" Lazy Susan Corner Wall",
    basePrice: 365,
    category: "Corner - Wall"
  },
  {
    type: "Corner Cabinet",
    subType: "lazy-susan-wall",
    width: 30,
    height: 30,
    depth: 30,
    label: "LSWC30",
    description: "30\" Lazy Susan Corner Wall",
    basePrice: 425,
    category: "Corner - Wall"
  },
  
  // ===== PENINSULA CABINETS (Extended Layouts) =====
  {
    type: "Base Cabinet",
    subType: "peninsula",
    width: 48,
    height: 34.5,
    depth: 36,
    label: "PEN48",
    description: "48\" Peninsula Base",
    basePrice: 625,
    category: "Base - Peninsula"
  },
  {
    type: "Base Cabinet",
    subType: "peninsula",
    width: 60,
    height: 34.5,
    depth: 36,
    label: "PEN60",
    description: "60\" Peninsula Base",
    basePrice: 725,
    category: "Base - Peninsula"
  },
  {
    type: "Base Cabinet",
    subType: "peninsula",
    width: 72,
    height: 34.5,
    depth: 36,
    label: "PEN72",
    description: "72\" Peninsula Base",
    basePrice: 825,
    category: "Base - Peninsula"
  },
  {
    type: "Base Cabinet",
    subType: "peninsula",
    width: 84,
    height: 34.5,
    depth: 36,
    label: "PEN84",
    description: "84\" Peninsula Base",
    basePrice: 925,
    category: "Base - Peninsula"
  },
  {
    type: "Base Cabinet",
    subType: "peninsula",
    width: 96,
    height: 34.5,
    depth: 36,
    label: "PEN96",
    description: "96\" Peninsula Base",
    basePrice: 1025,
    category: "Base - Peninsula"
  },
];

// Helper function to calculate cabinet price with finish
export function calculateCabinetPrice(
  cabinet: CabinetSpec,
  finishId: string,
  handleType: keyof typeof HARDWARE_OPTIONS.handles = "bar",
  numHandles: number = 2
): number {
  const finish = MATERIAL_FINISHES.find(f => f.id === finishId);
  const finishMultiplier = finish?.priceMultiplier || 1.0;
  
  const hardwarePrice = HARDWARE_OPTIONS.handles[handleType].pricePerUnit * numHandles;
  const cabinetPrice = cabinet.basePrice * finishMultiplier;
  
  return Math.round(cabinetPrice + hardwarePrice);
}

// Helper to get price display
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
