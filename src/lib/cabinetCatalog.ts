// St. Martin Cabinetry 2025 Specification Book
// Complete catalog with item codes, dimensions, and 8-tier pricing (G1-G8)

export interface CabinetSpec {
  code: string; // St. Martin item code (e.g., W1212L/R, B1834)
  type: "Base Cabinet" | "Wall Cabinet" | "Tall Cabinet" | "Corner Cabinet" | "Specialty";
  subType: string;
  width: number;  // inches
  height: number; // inches
  depth: number;  // inches
  label: string;  // Display label
  description: string;
  priceGroups: { // 8-tier pricing based on finish selection
    G1: number;
    G2: number;
    G3: number;
    G4: number;
    G5: number;
    G6: number;
    G7: number;
    G8: number;
  };
  category: string;
  notes?: string;
}

export interface MaterialFinish {
  id: string;
  name: string;
  type: "Painted" | "Stained";
  priceGroup: "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7" | "G8";
  description: string;
}

// St. Martin 2025 Material Finishes - Organized by Price Group
export const MATERIAL_FINISHES: MaterialFinish[] = [
  // === PAINTED FINISHES (Lower Price Groups G1-G3) ===
  { id: "bright-white", name: "Bright White", type: "Painted", priceGroup: "G1", description: "Clean, modern white finish" },
  { id: "simply-white", name: "Simply White", type: "Painted", priceGroup: "G2", description: "Soft white with warm undertones" },
  { id: "repose-gray", name: "Repose Gray", type: "Painted", priceGroup: "G2", description: "Versatile warm gray" },
  { id: "anew-gray", name: "Anew Gray", type: "Painted", priceGroup: "G2", description: "Contemporary gray" },
  { id: "dove-gray", name: "Dove Gray", type: "Painted", priceGroup: "G2", description: "Soft, elegant gray" },
  { id: "simply-gray", name: "Simply Gray", type: "Painted", priceGroup: "G2", description: "Light, airy gray" },
  { id: "blue-slate", name: "Blue Slate", type: "Painted", priceGroup: "G3", description: "Rich blue-gray tone" },
  { id: "midnight-blue", name: "Midnight Blue", type: "Painted", priceGroup: "G3", description: "Deep, dramatic blue" },
  { id: "oceana-blue", name: "Oceana Blue", type: "Painted", priceGroup: "G3", description: "Coastal blue tone" },
  { id: "sage-green", name: "Sage Green", type: "Painted", priceGroup: "G3", description: "Soft, organic green" },
  { id: "pewter-green", name: "Pewter Green", type: "Painted", priceGroup: "G3", description: "Sophisticated muted green" },
  { id: "black", name: "Black", type: "Painted", priceGroup: "G3", description: "Bold, dramatic black" },
  { id: "iron-ore", name: "Iron Ore", type: "Painted", priceGroup: "G3", description: "Deep charcoal" },
  
  // === STAINED FINISHES (Higher Price Groups G5-G8) ===
  { id: "maple-cashew", name: "Maple Cashew", type: "Stained", priceGroup: "G5", description: "Warm maple with cashew tone" },
  { id: "heather", name: "Heather", type: "Stained", priceGroup: "G5", description: "Soft, muted maple" },
  { id: "washed-walnut", name: "Washed Walnut", type: "Stained", priceGroup: "G5", description: "Light, modern walnut" },
  { id: "onyx-cherry", name: "Onyx Cherry", type: "Stained", priceGroup: "G5", description: "Deep cherry finish" },
  { id: "driftwood-cherry", name: "Driftwood Cherry", type: "Stained", priceGroup: "G5", description: "Weathered cherry tone" },
  { id: "rift-white-oak", name: "Rift Cut White Oak", type: "Stained", priceGroup: "G6", description: "Natural rift-sawn white oak with wire-brushed texture" },
  { id: "dusk-gray-oak", name: "Dusk Gray Oak", type: "Stained", priceGroup: "G6", description: "Gray-toned oak with modern appeal" },
  { id: "white-urban-oak", name: "White Urban Oak", type: "Stained", priceGroup: "G6", description: "Contemporary white-washed oak" },
  { id: "natural-walnut", name: "Natural Walnut", type: "Stained", priceGroup: "G6", description: "Hand-selected natural walnut" },
  { id: "pewter-cherry", name: "Pewter Cherry", type: "Stained", priceGroup: "G6", description: "Gray-toned cherry" },
  { id: "onyx-oak", name: "Onyx Oak", type: "Stained", priceGroup: "G7", description: "Deep, dark oak finish" },
  { id: "carbon-black", name: "Carbon Black Oak", type: "Stained", priceGroup: "G7", description: "Rich black oak with natural grain" },
  { id: "walnut", name: "Walnut", type: "Stained", priceGroup: "G7", description: "Classic walnut finish" },
];

// St. Martin Hardware & Modifications
export const HARDWARE_OPTIONS = {
  handles: {
    standard: { name: "Standard Handle", pricePerUnit: 0 }, // Included
    bar: { name: "Bar Handle", pricePerUnit: 8.50 },
    knob: { name: "Knob", pricePerUnit: 5.00 },
  },
  hinges: {
    blum: { name: "Blum Soft Close", pricePerUnit: 0 }, // Included in all St. Martin cabinets
  },
  modifications: {
    glassDoorPrepared: { name: "Prepared for Glass Door (PG-C)", basePrice: 200 },
    glassDoorMullion: { name: "Mullion Glass Door (MGD-C)", basePrice: 370 },
    finishedInteriorWall: { name: "Wall Finished Interior", basePrice: 350 },
    finishedInteriorBase: { name: "Base Finished Interior", basePrice: 500 },
    touchLatch: { name: "Touch Latch", basePrice: 200 },
    tipOnBlumotion: { name: "Tip-On Blumotion", basePrice: 350 },
    decreasedDepth: { name: "Decreased Depth", basePrice: 400 },
  },
};

// ST. MARTIN 2025 CABINET CATALOG
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
    priceGroups: { G1: 645, G2: 710, G3: 774, G4: 780, G5: 859, G6: 946, G7: 1039, G8: 1143 },
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
    priceGroups: { G1: 662, G2: 728, G3: 794, G4: 802, G5: 882, G6: 969, G7: 1067, G8: 1174 },
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
    priceGroups: { G1: 679, G2: 747, G3: 815, G4: 821, G5: 905, G6: 995, G7: 1094, G8: 1203 },
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
    priceGroups: { G1: 882, G2: 969, G3: 1058, G4: 1067, G5: 1174, G6: 1291, G7: 1420, G8: 1562 },
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
    priceGroups: { G1: 899, G2: 989, G3: 1079, G4: 1088, G5: 1197, G6: 1315, G7: 1448, G8: 1593 },
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
    priceGroups: { G1: 936, G2: 1029, G3: 1123, G4: 1132, G5: 1245, G6: 1370, G7: 1507, G8: 1658 },
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
    priceGroups: { G1: 682, G2: 749, G3: 818, G4: 824, G5: 906, G6: 998, G7: 1097, G8: 1207 },
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
    priceGroups: { G1: 803, G2: 883, G3: 964, G4: 972, G5: 1070, G6: 1177, G7: 1294, G8: 1423 },
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
    priceGroups: { G1: 927, G2: 1020, G3: 1113, G4: 1122, G5: 1233, G6: 1358, G7: 1493, G8: 1642 },
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
    priceGroups: { G1: 1081, G2: 1190, G3: 1297, G4: 1308, G5: 1439, G6: 1583, G7: 1741, G8: 1915 },
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
    priceGroups: { G1: 1178, G2: 1295, G3: 1414, G4: 1425, G5: 1568, G6: 1724, G7: 1898, G8: 2088 },
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
    priceGroups: { G1: 1331, G2: 1463, G3: 1597, G4: 1610, G5: 1771, G6: 1947, G7: 2142, G8: 2356 },
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
    priceGroups: { G1: 738, G2: 811, G3: 886, G4: 892, G5: 982, G6: 1080, G7: 1188, G8: 1307 },
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
    priceGroups: { G1: 930, G2: 1023, G3: 1160, G4: 1126, G5: 1239, G6: 1362, G7: 1499, G8: 1649 },
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
    priceGroups: { G1: 1288, G2: 1417, G3: 1546, G4: 1558, G5: 1715, G6: 1885, G7: 2074, G8: 2281 },
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
    priceGroups: { G1: 1470, G2: 1617, G3: 1765, G4: 1778, G5: 1956, G6: 2152, G7: 2368, G8: 2605 },
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
    priceGroups: { G1: 1641, G2: 1806, G3: 1969, G4: 1987, G5: 2185, G6: 2403, G7: 2643, G8: 2907 },
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
    priceGroups: { G1: 1057, G2: 1162, G3: 1269, G4: 1278, G5: 1406, G6: 1547, G7: 1701, G8: 1871 },
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
    priceGroups: { G1: 1202, G2: 1322, G3: 1444, G4: 1454, G5: 1599, G6: 1759, G7: 1935, G8: 2129 },
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
    priceGroups: { G1: 1676, G2: 1843, G3: 2012, G4: 2026, G5: 2229, G6: 2451, G7: 2697, G8: 2967 },
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
    priceGroups: { G1: 1858, G2: 2045, G3: 2229, G4: 2247, G5: 2471, G6: 2718, G7: 2990, G8: 3289 },
    category: "Wall - 42\" Height"
  },

  // ==================== BASE CABINETS - STANDARD ====================
  // Note: Base cabinet data needs to be extracted from pages not yet viewed
  // These are placeholder estimates based on typical St. Martin pricing patterns
  {
    code: "B1234",
    type: "Base Cabinet",
    subType: "standard",
    width: 12,
    height: 34.5,
    depth: 24,
    label: "B1234",
    description: "12\" Base Cabinet",
    priceGroups: { G1: 800, G2: 880, G3: 960, G4: 968, G5: 1065, G6: 1172, G7: 1289, G8: 1418 },
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
    priceGroups: { G1: 950, G2: 1045, G3: 1140, G4: 1149, G5: 1264, G6: 1390, G7: 1529, G8: 1682 },
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
    priceGroups: { G1: 1100, G2: 1210, G3: 1320, G4: 1330, G5: 1463, G6: 1609, G7: 1770, G8: 1947 },
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
    priceGroups: { G1: 1250, G2: 1375, G3: 1500, G4: 1512, G5: 1663, G6: 1829, G7: 2012, G8: 2213 },
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
    priceGroups: { G1: 1400, G2: 1540, G3: 1680, G4: 1694, G5: 1863, G6: 2049, G7: 2254, G8: 2479 },
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
    priceGroups: { G1: 1350, G2: 1485, G3: 1620, G4: 1634, G5: 1797, G6: 1977, G7: 2175, G8: 2393 },
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
    priceGroups: { G1: 1550, G2: 1705, G3: 1860, G4: 1875, G5: 2063, G6: 2269, G7: 2496, G8: 2746 },
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
    priceGroups: { G1: 1750, G2: 1925, G3: 2100, G4: 2116, G5: 2328, G6: 2561, G7: 2817, G8: 3099 },
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
    priceGroups: { G1: 2200, G2: 2420, G3: 2640, G4: 2662, G5: 2928, G6: 3221, G7: 3543, G8: 3897 },
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
    priceGroups: { G1: 2500, G2: 2750, G3: 3000, G4: 3024, G5: 3326, G6: 3659, G7: 4025, G8: 4428 },
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
    priceGroups: { G1: 2800, G2: 3080, G3: 3360, G4: 3387, G5: 3726, G6: 4099, G7: 4509, G8: 4960 },
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
    priceGroups: { G1: 3200, G2: 3520, G3: 3840, G4: 3870, G5: 4257, G6: 4683, G7: 5151, G8: 5666 },
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
    priceGroups: { G1: 3600, G2: 3960, G3: 4320, G4: 4354, G5: 4789, G6: 5268, G7: 5795, G8: 6375 },
    category: "Tall - Specialty"
  },
];

// Helper function to get cabinet price based on selected finish
export function calculateCabinetPrice(
  cabinet: CabinetSpec, 
  finishId: string, 
  modifications: string[] = []
): number {
  const finish = MATERIAL_FINISHES.find(f => f.id === finishId);
  if (!finish) return cabinet.priceGroups.G1; // Default to G1 if finish not found
  
  let price = cabinet.priceGroups[finish.priceGroup];
  
  // Add modification costs
  modifications.forEach(modId => {
    const mod = Object.values(HARDWARE_OPTIONS.modifications).find(m => m.name.toLowerCase().includes(modId.toLowerCase()));
    if (mod) {
      price += mod.basePrice;
    }
  });
  
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
