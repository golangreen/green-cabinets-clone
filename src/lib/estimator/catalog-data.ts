// Green Cabinets NY — Price List (Luxor L / Zuma Z tiers)
// price = Luxor (L column); priceZ = Zuma (Z column)
// doors/drawers = hardware attachment point counts per unit
import type { CabinetItem } from '@/lib/types';

// Helper: wall cabinets ≤21" wide = 1 door, ≥24" = 2 doors, 0 drawers
// Base cabinets = 1 door + 1 drawer (narrow ≤15" = 1 door only)
// 3-drawer bases = 0 doors + 3 drawers
// Sink bases = 2 doors
// Pantry/Utility = 2 doors (tall units)
// Vanity = 2 doors typically (small = 1 door)
// Corner/Blind = 1 door
// Accessories/panels/fillers/trays/molding = 0 doors, 0 drawers

export const cabinetCatalog: Record<string, { name: string; items: CabinetItem[] }> = {
  wall12: {
    name: 'Wall Cabinets 12" High',
    items: [
      { model: 'W0612', description: '6" Wide × 12" High Wall', category: 'wall12', price: 75, priceZ: 89, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W0912', description: '9" Wide × 12" High Wall', category: 'wall12', price: 88, priceZ: 104, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1212', description: '12" Wide × 12" High Wall', category: 'wall12', price: 105, priceZ: 124, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1512', description: '15" Wide × 12" High Wall', category: 'wall12', price: 116, priceZ: 137, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1812', description: '18" Wide × 12" High Wall', category: 'wall12', price: 127, priceZ: 150, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2112', description: '21" Wide × 12" High Wall', category: 'wall12', price: 143, priceZ: 169, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2412', description: '24" Wide × 12" High Wall', category: 'wall12', price: 160, priceZ: 189, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W2712', description: '27" Wide × 12" High Wall', category: 'wall12', price: 173, priceZ: 204, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3012', description: '30" Wide × 12" High Wall', category: 'wall12', price: 182, priceZ: 215, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3312', description: '33" Wide × 12" High Wall', category: 'wall12', price: 198, priceZ: 234, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3612', description: '36" Wide × 12" High Wall', category: 'wall12', price: 209, priceZ: 247, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3912', description: '39" Wide × 12" High Wall', category: 'wall12', price: 225, priceZ: 266, doors: 2, drawers: 0, imageType: 'wall-2d' },
    ],
  },
  wall15: {
    name: 'Wall Cabinets 15" High',
    items: [
      { model: 'W0915', description: '9" Wide × 15" High Wall', category: 'wall15', price: 99, priceZ: 117, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1215', description: '12" Wide × 15" High Wall', category: 'wall15', price: 116, priceZ: 137, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1515', description: '15" Wide × 15" High Wall', category: 'wall15', price: 127, priceZ: 150, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1815', description: '18" Wide × 15" High Wall', category: 'wall15', price: 138, priceZ: 163, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2115', description: '21" Wide × 15" High Wall', category: 'wall15', price: 154, priceZ: 182, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2415', description: '24" Wide × 15" High Wall', category: 'wall15', price: 176, priceZ: 208, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W2715', description: '27" Wide × 15" High Wall', category: 'wall15', price: 187, priceZ: 221, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3015', description: '30" Wide × 15" High Wall', category: 'wall15', price: 198, priceZ: 234, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3315', description: '33" Wide × 15" High Wall', category: 'wall15', price: 215, priceZ: 254, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3615', description: '36" Wide × 15" High Wall', category: 'wall15', price: 226, priceZ: 267, doors: 2, drawers: 0, imageType: 'wall-2d' },
    ],
  },
  wall18: {
    name: 'Wall Cabinets 18" High',
    items: [
      { model: 'W0918', description: '9" Wide × 18" High Wall', category: 'wall18', price: 105, priceZ: 124, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1218', description: '12" Wide × 18" High Wall', category: 'wall18', price: 124, priceZ: 146, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1518', description: '15" Wide × 18" High Wall', category: 'wall18', price: 138, priceZ: 163, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1818', description: '18" Wide × 18" High Wall', category: 'wall18', price: 149, priceZ: 176, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2118', description: '21" Wide × 18" High Wall', category: 'wall18', price: 171, priceZ: 202, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2418', description: '24" Wide × 18" High Wall', category: 'wall18', price: 193, priceZ: 228, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W2718', description: '27" Wide × 18" High Wall', category: 'wall18', price: 209, priceZ: 247, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3018', description: '30" Wide × 18" High Wall', category: 'wall18', price: 220, priceZ: 260, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3318', description: '33" Wide × 18" High Wall', category: 'wall18', price: 237, priceZ: 280, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3618', description: '36" Wide × 18" High Wall', category: 'wall18', price: 248, priceZ: 293, doors: 2, drawers: 0, imageType: 'wall-2d' },
    ],
  },
  wall24: {
    name: 'Wall Cabinets 24" High',
    items: [
      { model: 'W0624', description: '6" Wide × 24" High Wall', category: 'wall24', price: 99, priceZ: 117, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W0924', description: '9" Wide × 24" High Wall', category: 'wall24', price: 116, priceZ: 137, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1224', description: '12" Wide × 24" High Wall', category: 'wall24', price: 143, priceZ: 169, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1524', description: '15" Wide × 24" High Wall', category: 'wall24', price: 154, priceZ: 182, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1824', description: '18" Wide × 24" High Wall', category: 'wall24', price: 171, priceZ: 202, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2124', description: '21" Wide × 24" High Wall', category: 'wall24', price: 193, priceZ: 228, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2424', description: '24" Wide × 24" High Wall', category: 'wall24', price: 220, priceZ: 260, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W2724', description: '27" Wide × 24" High Wall', category: 'wall24', price: 237, priceZ: 280, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3024', description: '30" Wide × 24" High Wall', category: 'wall24', price: 248, priceZ: 293, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3324', description: '33" Wide × 24" High Wall', category: 'wall24', price: 264, priceZ: 312, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3624', description: '36" Wide × 24" High Wall', category: 'wall24', price: 275, priceZ: 325, doors: 2, drawers: 0, imageType: 'wall-2d' },
    ],
  },
  wall30: {
    name: 'Wall Cabinets 30" High',
    items: [
      { model: 'W0930', description: '9" Wide × 30" High Wall', category: 'wall30', price: 149, priceZ: 176, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1230', description: '12" Wide × 30" High Wall', category: 'wall30', price: 179, priceZ: 211, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1530', description: '15" Wide × 30" High Wall', category: 'wall30', price: 190, priceZ: 224, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1830', description: '18" Wide × 30" High Wall', category: 'wall30', price: 209, priceZ: 247, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2130', description: '21" Wide × 30" High Wall', category: 'wall30', price: 239, priceZ: 282, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2430', description: '24" Wide × 30" High Wall', category: 'wall30', price: 275, priceZ: 325, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W2730', description: '27" Wide × 30" High Wall', category: 'wall30', price: 294, priceZ: 347, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3030', description: '30" Wide × 30" High Wall', category: 'wall30', price: 303, priceZ: 358, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3330', description: '33" Wide × 30" High Wall', category: 'wall30', price: 330, priceZ: 390, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3630', description: '36" Wide × 30" High Wall', category: 'wall30', price: 341, priceZ: 403, doors: 2, drawers: 0, imageType: 'wall-2d' },
    ],
  },
  wall36: {
    name: 'Wall Cabinets 36" High',
    items: [
      { model: 'W0936', description: '9" Wide × 36" High Wall', category: 'wall36', price: 173, priceZ: 204, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1236', description: '12" Wide × 36" High Wall', category: 'wall36', price: 209, priceZ: 247, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1536', description: '15" Wide × 36" High Wall', category: 'wall36', price: 242, priceZ: 286, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1836', description: '18" Wide × 36" High Wall', category: 'wall36', price: 248, priceZ: 293, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2136', description: '21" Wide × 36" High Wall', category: 'wall36', price: 272, priceZ: 321, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2436', description: '24" Wide × 36" High Wall', category: 'wall36', price: 311, priceZ: 367, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W2736', description: '27" Wide × 36" High Wall', category: 'wall36', price: 338, priceZ: 399, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3036', description: '30" Wide × 36" High Wall', category: 'wall36', price: 344, priceZ: 406, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3336', description: '33" Wide × 36" High Wall', category: 'wall36', price: 363, priceZ: 429, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3636', description: '36" Wide × 36" High Wall', category: 'wall36', price: 385, priceZ: 455, doors: 2, drawers: 0, imageType: 'wall-2d' },
    ],
  },
  wall42: {
    name: 'Wall Cabinets 42" High',
    items: [
      { model: 'W0942', description: '9" Wide × 42" High Wall', category: 'wall42', price: 198, priceZ: 234, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1242', description: '12" Wide × 42" High Wall', category: 'wall42', price: 242, priceZ: 286, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1542', description: '15" Wide × 42" High Wall', category: 'wall42', price: 272, priceZ: 321, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W1842', description: '18" Wide × 42" High Wall', category: 'wall42', price: 297, priceZ: 351, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2142', description: '21" Wide × 42" High Wall', category: 'wall42', price: 330, priceZ: 390, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'W2442', description: '24" Wide × 42" High Wall', category: 'wall42', price: 391, priceZ: 462, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W2742', description: '27" Wide × 42" High Wall', category: 'wall42', price: 413, priceZ: 488, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3042', description: '30" Wide × 42" High Wall', category: 'wall42', price: 426, priceZ: 503, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3342', description: '33" Wide × 42" High Wall', category: 'wall42', price: 457, priceZ: 540, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'W3642', description: '36" Wide × 42" High Wall', category: 'wall42', price: 476, priceZ: 562, doors: 2, drawers: 0, imageType: 'wall-2d' },
      { model: 'WDC2442', description: '24" Corner Wall 42" High', category: 'wall42', price: 462, priceZ: 546, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WBC2742', description: '27" Blind Wall 42" High', category: 'wall42', price: 473, priceZ: 559, doors: 1, drawers: 0, imageType: 'wall-corner' },
    ],
  },
  cornerWall: {
    name: 'Corner Wall Cabinets',
    items: [
      { model: 'WDC2430', description: '24" Corner Wall 30" High', category: 'cornerWall', price: 325, priceZ: 384, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WDC2436', description: '24" Corner Wall 36" High', category: 'cornerWall', price: 396, priceZ: 468, doors: 1, drawers: 0, imageType: 'wall-corner' },
    ],
  },
  blindWall: {
    name: 'Blind Wall Cabinets',
    items: [
      { model: 'WBC2730', description: '27" Blind Wall 30" High', category: 'blindWall', price: 358, priceZ: 423, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WBC2736', description: '27" Blind Wall 36" High', category: 'blindWall', price: 399, priceZ: 471, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'BLW2730', description: '27" Blind Wall 30"H', category: 'blindWall', price: 325, priceZ: 384, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'BLW3030', description: '30" Blind Wall 30"H', category: 'blindWall', price: 352, priceZ: 416, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'BLW3036', description: '30" Blind Wall 36"H', category: 'blindWall', price: 407, priceZ: 481, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'BLW3336', description: '33" Blind Wall 36"H', category: 'blindWall', price: 435, priceZ: 514, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'BLW3642', description: '36" Blind Wall 42"H', category: 'blindWall', price: 490, priceZ: 579, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'BLW4236', description: '42" Blind Wall 36"H', category: 'blindWall', price: 481, priceZ: 568, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'BLW4536', description: '45" Blind Wall 36"H', category: 'blindWall', price: 517, priceZ: 611, doors: 1, drawers: 0, imageType: 'wall-corner' },
    ],
  },
  base: {
    name: 'Base Cabinets',
    items: [
      { model: 'B09', description: '9" Base Cabinet', category: 'base', price: 245, priceZ: 289, doors: 1, drawers: 1, imageType: 'base-1d' },
      { model: 'B12', description: '12" Base Cabinet', category: 'base', price: 270, priceZ: 319, doors: 1, drawers: 1, imageType: 'base-1d' },
      { model: 'B15', description: '15" Base Cabinet', category: 'base', price: 278, priceZ: 328, doors: 1, drawers: 1, imageType: 'base-1d' },
      { model: 'B18', description: '18" Base Cabinet', category: 'base', price: 305, priceZ: 360, doors: 1, drawers: 1, imageType: 'base-1d' },
      { model: 'B21', description: '21" Base Cabinet', category: 'base', price: 325, priceZ: 384, doors: 1, drawers: 1, imageType: 'base-1d' },
      { model: 'B24', description: '24" Base Cabinet', category: 'base', price: 377, priceZ: 445, doors: 2, drawers: 1, imageType: 'base-2d' },
      { model: 'B27', description: '27" Base Cabinet', category: 'base', price: 418, priceZ: 494, doors: 2, drawers: 1, imageType: 'base-2d' },
      { model: 'B30', description: '30" Base Cabinet', category: 'base', price: 437, priceZ: 516, doors: 2, drawers: 1, imageType: 'base-2d' },
      { model: 'B33', description: '33" Base Cabinet', category: 'base', price: 470, priceZ: 555, doors: 2, drawers: 1, imageType: 'base-2d' },
      { model: 'B36', description: '36" Base Cabinet', category: 'base', price: 490, priceZ: 579, doors: 2, drawers: 1, imageType: 'base-2d' },
      { model: 'B39', description: '39" Base Cabinet', category: 'base', price: 535, priceZ: 632, doors: 2, drawers: 1, imageType: 'base-2d' },
      { model: 'B42', description: '42" Base Cabinet', category: 'base', price: 567, priceZ: 670, doors: 2, drawers: 1, imageType: 'base-2d' },
      { model: 'B48', description: '48" Base Cabinet', category: 'base', price: 627, priceZ: 741, doors: 2, drawers: 1, imageType: 'base-2d' },
    ],
  },
  sinkBase: {
    name: 'Sink Base Cabinets',
    items: [
      { model: 'SB24', description: '24" Sink Base', category: 'sinkBase', price: 344, priceZ: 406, doors: 2, drawers: 0, imageType: 'base-sink' },
      { model: 'SB27', description: '27" Sink Base', category: 'sinkBase', price: 352, priceZ: 416, doors: 2, drawers: 0, imageType: 'base-sink' },
      { model: 'SB30', description: '30" Sink Base', category: 'sinkBase', price: 371, priceZ: 438, doors: 2, drawers: 0, imageType: 'base-sink' },
      { model: 'SB33', description: '33" Sink Base', category: 'sinkBase', price: 380, priceZ: 449, doors: 2, drawers: 0, imageType: 'base-sink' },
      { model: 'SB36', description: '36" Sink Base', category: 'sinkBase', price: 388, priceZ: 458, doors: 2, drawers: 0, imageType: 'base-sink' },
      { model: 'SB39', description: '39" Sink Base', category: 'sinkBase', price: 441, priceZ: 521, doors: 2, drawers: 0, imageType: 'base-sink' },
      { model: 'SB42', description: '42" Sink Base', category: 'sinkBase', price: 473, priceZ: 559, doors: 2, drawers: 0, imageType: 'base-sink' },
      { model: 'SB48', description: '48" Sink Base', category: 'sinkBase', price: 567, priceZ: 670, doors: 2, drawers: 0, imageType: 'base-sink' },
      { model: 'SBA36', description: '36" Corner Sink Base', category: 'sinkBase', price: 512, priceZ: 605, doors: 2, drawers: 0, imageType: 'base-corner' },
    ],
  },
  drawerBase: {
    name: '3-Drawer Base Cabinets',
    items: [
      { model: 'DB12', description: '12" 3-Drawer Base', category: 'drawerBase', price: 454, priceZ: 536, doors: 0, drawers: 3, imageType: 'base-drawers' },
      { model: 'DB15', description: '15" 3-Drawer Base', category: 'drawerBase', price: 470, priceZ: 555, doors: 0, drawers: 3, imageType: 'base-drawers' },
      { model: 'DB18', description: '18" 3-Drawer Base', category: 'drawerBase', price: 498, priceZ: 588, doors: 0, drawers: 3, imageType: 'base-drawers' },
      { model: 'DB21', description: '21" 3-Drawer Base', category: 'drawerBase', price: 512, priceZ: 605, doors: 0, drawers: 3, imageType: 'base-drawers' },
      { model: 'DB24', description: '24" 3-Drawer Base', category: 'drawerBase', price: 531, priceZ: 627, doors: 0, drawers: 3, imageType: 'base-drawers' },
      { model: 'DB30', description: '30" 3-Drawer Base', category: 'drawerBase', price: 685, priceZ: 809, doors: 0, drawers: 3, imageType: 'base-drawers' },
      { model: 'DB33', description: '33" 3-Drawer Base', category: 'drawerBase', price: 789, priceZ: 932, doors: 0, drawers: 3, imageType: 'base-drawers' },
      { model: 'DB36', description: '36" 3-Drawer Base', category: 'drawerBase', price: 891, priceZ: 1052, doors: 0, drawers: 3, imageType: 'base-drawers' },
    ],
  },
  pantry: {
    name: 'Pantry Cabinets',
    items: [
      { model: 'PC1584', description: '15" Pantry 84" High', category: 'pantry', price: 784, priceZ: 926, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC1590', description: '15" Pantry 90" High', category: 'pantry', price: 839, priceZ: 991, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC1596', description: '15" Pantry 96" High', category: 'pantry', price: 935, priceZ: 1104, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC1884', description: '18" Pantry 84" High', category: 'pantry', price: 839, priceZ: 991, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC1890', description: '18" Pantry 90" High', category: 'pantry', price: 894, priceZ: 1056, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC1896', description: '18" Pantry 96" High', category: 'pantry', price: 990, priceZ: 1169, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC2484', description: '24" Pantry 84" High', category: 'pantry', price: 990, priceZ: 1169, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC2490', description: '24" Pantry 90" High', category: 'pantry', price: 1031, priceZ: 1217, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC2496', description: '24" Pantry 96" High', category: 'pantry', price: 1128, priceZ: 1331, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC2784', description: '27" Pantry 84" High', category: 'pantry', price: 1050, priceZ: 1239, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC2790', description: '27" Pantry 90" High', category: 'pantry', price: 1093, priceZ: 1290, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC2796', description: '27" Pantry 96" High', category: 'pantry', price: 1196, priceZ: 1411, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC3084', description: '30" Pantry 84" High', category: 'pantry', price: 1111, priceZ: 1311, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC3090', description: '30" Pantry 90" High', category: 'pantry', price: 1157, priceZ: 1365, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'PC3096', description: '30" Pantry 96" High', category: 'pantry', price: 1266, priceZ: 1494, doors: 2, drawers: 0, imageType: 'tall' },
    ],
  },
  blindBase: {
    name: 'Blind Base Cabinets',
    items: [
      { model: 'BLB36', description: '36" Blind Lazy Base', category: 'blindBase', price: 536, priceZ: 633, doors: 1, drawers: 1, imageType: 'base-corner' },
      { model: 'BLB39', description: '39" Blind Lazy Base', category: 'blindBase', price: 578, priceZ: 683, doors: 1, drawers: 1, imageType: 'base-corner' },
      { model: 'BLB42', description: '42" Blind Lazy Base', category: 'blindBase', price: 619, priceZ: 731, doors: 1, drawers: 1, imageType: 'base-corner' },
      { model: 'BLB45', description: '45" Blind Lazy Base', category: 'blindBase', price: 660, priceZ: 779, doors: 1, drawers: 1, imageType: 'base-corner' },
      { model: 'BLB48', description: '48" Blind Lazy Base', category: 'blindBase', price: 701, priceZ: 828, doors: 1, drawers: 1, imageType: 'base-corner' },
    ],
  },
  cornerWallDiag: {
    name: 'Diagonal Corner Wall Cabinets',
    items: [
      { model: 'CW2430', description: '24" Diagonal Corner Wall 30"H', category: 'cornerWallDiag', price: 325, priceZ: 384, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'CW2436', description: '24" Diagonal Corner Wall 36"H', category: 'cornerWallDiag', price: 396, priceZ: 468, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'CW2442', description: '24" Diagonal Corner Wall 42"H', category: 'cornerWallDiag', price: 462, priceZ: 546, doors: 1, drawers: 0, imageType: 'wall-corner' },
    ],
  },
  squareCornerWall: {
    name: 'Square Corner Wall Cabinets',
    items: [
      { model: 'WSQ2430', description: '24" Square Corner Wall 30"H', category: 'squareCornerWall', price: 371, priceZ: 438, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WSQ2436', description: '24" Square Corner Wall 36"H', category: 'squareCornerWall', price: 440, priceZ: 520, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WSQ2442', description: '24" Square Corner Wall 42"H', category: 'squareCornerWall', price: 509, priceZ: 601, doors: 1, drawers: 0, imageType: 'wall-corner' },
    ],
  },
  wallEnd: {
    name: 'Wall End Cabinets',
    items: [
      { model: 'WEC1230', description: '12" Wall End Cabinet 30"H', category: 'wallEnd', price: 215, priceZ: 254, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'WEC1236', description: '12" Wall End Cabinet 36"H', category: 'wallEnd', price: 248, priceZ: 293, doors: 1, drawers: 0, imageType: 'wall-1d' },
      { model: 'WEC1242', description: '12" Wall End Cabinet 42"H', category: 'wallEnd', price: 289, priceZ: 341, doors: 1, drawers: 0, imageType: 'wall-1d' },
    ],
  },
  microwaveBase: {
    name: 'Microwave Base Cabinets',
    items: [
      { model: 'MCB3024', description: '30" Microwave Base 24"H', category: 'microwaveBase', price: 481, priceZ: 568, doors: 1, drawers: 1, imageType: 'specialty' },
      { model: 'MCB3084', description: '30" Microwave Base 84"H', category: 'microwaveBase', price: 1155, priceZ: 1364, doors: 2, drawers: 1, imageType: 'tall' },
      { model: 'MCB3384', description: '33" Microwave Base 84"H', category: 'microwaveBase', price: 1238, priceZ: 1462, doors: 2, drawers: 1, imageType: 'tall' },
      { model: 'MCB3630', description: '36" Microwave Base 30"H', category: 'microwaveBase', price: 536, priceZ: 633, doors: 1, drawers: 1, imageType: 'specialty' },
    ],
  },
  utility: {
    name: 'Utility Cabinets',
    items: [
      { model: 'UC1884', description: '18" Utility Cabinet 84"H', category: 'utility', price: 853, priceZ: 1007, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC1890', description: '18" Utility Cabinet 90"H', category: 'utility', price: 908, priceZ: 1072, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC1896', description: '18" Utility Cabinet 96"H', category: 'utility', price: 1004, priceZ: 1185, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC2484', description: '24" Utility Cabinet 84"H', category: 'utility', price: 1004, priceZ: 1185, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC2490', description: '24" Utility Cabinet 90"H', category: 'utility', price: 1045, priceZ: 1233, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC2496', description: '24" Utility Cabinet 96"H', category: 'utility', price: 1141, priceZ: 1347, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC2784', description: '27" Utility Cabinet 84"H', category: 'utility', price: 1080, priceZ: 1275, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC2790', description: '27" Utility Cabinet 90"H', category: 'utility', price: 1135, priceZ: 1340, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC2796', description: '27" Utility Cabinet 96"H', category: 'utility', price: 1230, priceZ: 1452, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC3084', description: '30" Utility Cabinet 84"H', category: 'utility', price: 1155, priceZ: 1364, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC3090', description: '30" Utility Cabinet 90"H', category: 'utility', price: 1224, priceZ: 1445, doors: 2, drawers: 0, imageType: 'tall' },
      { model: 'UC3096', description: '30" Utility Cabinet 96"H', category: 'utility', price: 1320, priceZ: 1558, doors: 2, drawers: 0, imageType: 'tall' },
    ],
  },
  cornerSinkBase: {
    name: 'Corner Sink Base Cabinets',
    items: [
      { model: 'CSB36', description: '36" Corner Sink Base', category: 'cornerSinkBase', price: 536, priceZ: 633, doors: 2, drawers: 0, imageType: 'base-corner' },
      { model: 'CSB42', description: '42" Corner Sink Base', category: 'cornerSinkBase', price: 591, priceZ: 698, doors: 2, drawers: 0, imageType: 'base-corner' },
    ],
  },
  lazySusanBase: {
    name: 'Lazy Susan Base Cabinets',
    items: [
      { model: 'LSB36', description: '36" Lazy Susan Base', category: 'lazySusanBase', price: 619, priceZ: 731, doors: 2, drawers: 0, imageType: 'base-ls' },
      { model: 'LSB42', description: '42" Lazy Susan Base', category: 'lazySusanBase', price: 729, priceZ: 861, doors: 2, drawers: 0, imageType: 'base-ls' },
    ],
  },
  ezReachBase: {
    name: 'EZ Reach Base Cabinets',
    items: [
      { model: 'EZR33', description: '33" EZ Reach Base', category: 'ezReachBase', price: 578, priceZ: 683, doors: 2, drawers: 1, imageType: 'base-corner' },
      { model: 'EZR36', description: '36" EZ Reach Base', category: 'ezReachBase', price: 646, priceZ: 763, doors: 2, drawers: 1, imageType: 'base-corner' },
    ],
  },
  vanity: {
    name: 'Vanity Cabinets',
    items: [
      { model: 'V24', description: '24" Vanity', category: 'vanity', price: 215, priceZ: 254, doors: 2, drawers: 0, imageType: 'vanity' },
      { model: 'V24DL', description: '24" Vanity Drawers Left', category: 'vanity', price: 253, priceZ: 299, doors: 1, drawers: 2, imageType: 'vanity' },
      { model: 'V24DR', description: '24" Vanity Drawers Right', category: 'vanity', price: 253, priceZ: 299, doors: 1, drawers: 2, imageType: 'vanity' },
      { model: 'V30', description: '30" Vanity', category: 'vanity', price: 270, priceZ: 319, doors: 2, drawers: 0, imageType: 'vanity' },
      { model: 'V36', description: '36" Vanity', category: 'vanity', price: 344, priceZ: 406, doors: 2, drawers: 1, imageType: 'vanity' },
      { model: 'V48', description: '48" Vanity', category: 'vanity', price: 462, priceZ: 546, doors: 2, drawers: 3, imageType: 'vanity' },
      { model: 'V60', description: '60" Vanity', category: 'vanity', price: 591, priceZ: 698, doors: 2, drawers: 3, imageType: 'vanity' },
    ],
  },
  specialty: {
    name: 'Specialty & Accessories',
    items: [
      { model: 'WMC3030', description: '30" Microwave Cabinet 30"H', category: 'specialty', price: 281, priceZ: 332, doors: 1, drawers: 0, imageType: 'specialty' },
      { model: 'WMC3036', description: '30" Microwave Cabinet 36"H', category: 'specialty', price: 281, priceZ: 332, doors: 1, drawers: 0, imageType: 'specialty' },
      { model: 'WMC3042', description: '30" Microwave Cabinet 42"H', category: 'specialty', price: 399, priceZ: 471, doors: 1, drawers: 0, imageType: 'specialty' },
      { model: 'OVD3084', description: '30" Double Oven 84"H', category: 'specialty', price: 1507, priceZ: 1780, doors: 2, drawers: 1, imageType: 'tall' },
      { model: 'OVD3090', description: '30" Double Oven 90"H', category: 'specialty', price: 1631, priceZ: 1927, doors: 2, drawers: 1, imageType: 'tall' },
      { model: 'OVD3096', description: '30" Double Oven 96"H', category: 'specialty', price: 1746, priceZ: 2062, doors: 2, drawers: 1, imageType: 'tall' },
      { model: 'OVD3384', description: '33" Double Oven 84"H', category: 'specialty', price: 1595, priceZ: 1884, doors: 2, drawers: 1, imageType: 'tall' },
      { model: 'OVD3390', description: '33" Double Oven 90"H', category: 'specialty', price: 1719, priceZ: 2031, doors: 2, drawers: 1, imageType: 'tall' },
      { model: 'OVD3396', description: '33" Double Oven 96"H', category: 'specialty', price: 1843, priceZ: 2177, doors: 2, drawers: 1, imageType: 'tall' },
      { model: 'BSR09', description: '9" Spice Rack', category: 'specialty', price: 446, priceZ: 527, doors: 1, drawers: 0, imageType: 'specialty' },
    ],
  },
  accessories: {
    name: 'Roll-Out Trays & Molding',
    items: [
      { model: 'ROT12', description: '12" Roll Out Tray', category: 'accessories', price: 105, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'ROT15', description: '15" Roll Out Tray', category: 'accessories', price: 113, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'ROT18', description: '18" Roll Out Tray', category: 'accessories', price: 121, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'ROT21', description: '21" Roll Out Tray', category: 'accessories', price: 127, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'ROT24', description: '24" Roll Out Tray', category: 'accessories', price: 135, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'ROT30', description: '30" Roll Out Tray', category: 'accessories', price: 160, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'ROT36', description: '36" Roll Out Tray', category: 'accessories', price: 179, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'CMD2', description: 'Crown Mold 2¾" (8ft)', category: 'accessories', price: 91, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'CMD4', description: 'Crown Mold 4" (8ft)', category: 'accessories', price: 121, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'TLM8', description: 'Light Rail Mold 2¼" (8ft)', category: 'accessories', price: 88, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'SM8', description: 'Scribe Mold (8ft)', category: 'accessories', price: 25, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'OCM8', description: 'Outside Corner Mold (8ft)', category: 'accessories', price: 28, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RCRM', description: 'Royal Crown Molding 3½" (8ft)', category: 'accessories', price: 197, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'LTRM', description: 'Light Rail Molding (8ft)', category: 'accessories', price: 118, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WDM', description: 'Wall Dental Molding (8ft)', category: 'accessories', price: 52, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'TK8', description: 'Toe Kick (8ft)', category: 'accessories', price: 48, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'VAL30', description: '30" Valance', category: 'accessories', price: 30, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'VAL48', description: '48" Valance', category: 'accessories', price: 43, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WS30', description: '30" Knick Knack Wall Shelf (2 Shelves)', category: 'accessories', price: 97, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WS36', description: '36" Knick Knack Wall Shelf (2 Shelves)', category: 'accessories', price: 115, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WS42', description: '42" Knick Knack Wall Shelf (3 Shelves)', category: 'accessories', price: 131, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'BS24', description: '24" Knick Knack Base Shelf', category: 'accessories', price: 152, doors: 0, drawers: 0, imageType: 'accessory' },
    ],
  },
  revashelf: {
    name: 'Rev-A-Shelf Accessories',
    items: [
      { model: 'RAS-5758-36', description: 'Rev-A-Shelf 36" Pantry Pull-Out (5758 series)', category: 'revashelf', price: 1059, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-5773-08', description: 'Rev-A-Shelf 8" Filler Pantry Pull-Out', category: 'revashelf', price: 811, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-5743-20', description: 'Rev-A-Shelf 20" Swing-Out Pantry Kit', category: 'revashelf', price: 1155, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-5349-1550DM-2', description: 'Rev-A-Shelf 50qt Double Trash Pull-Out', category: 'revashelf', price: 591, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-5349-1527DM-1', description: 'Rev-A-Shelf 27qt Single Trash Pull-Out', category: 'revashelf', price: 399, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-5349-2150DM-2', description: 'Rev-A-Shelf 50qt Top-Mount Double Trash', category: 'revashelf', price: 646, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-4WDB-15', description: 'Rev-A-Shelf 15" Dovetail Drawer Box', category: 'revashelf', price: 234, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-4WDB-18', description: 'Rev-A-Shelf 18" Dovetail Drawer Box', category: 'revashelf', price: 261, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-4WDB-21', description: 'Rev-A-Shelf 21" Dovetail Drawer Box', category: 'revashelf', price: 289, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-4WDB-24', description: 'Rev-A-Shelf 24" Dovetail Drawer Box', category: 'revashelf', price: 303, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-4SDI-18', description: 'Rev-A-Shelf 18" Spice Drawer Insert', category: 'revashelf', price: 198, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-4WCT-1', description: 'Rev-A-Shelf Cutlery Tray Insert', category: 'revashelf', price: 132, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-4DPS-3021', description: 'Rev-A-Shelf Drawer Peg System 30×21"', category: 'revashelf', price: 179, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-6012-18-11-52', description: 'Rev-A-Shelf 18" Full-Circle Lazy Susan', category: 'revashelf', price: 344, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-5PSP-15-CR', description: 'Rev-A-Shelf 15" Blind Corner Pull-Out', category: 'revashelf', price: 853, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RAS-544-10C-1', description: 'Rev-A-Shelf Under-Sink Pull-Out Caddy', category: 'revashelf', price: 242, doors: 0, drawers: 0, imageType: 'accessory' },
    ],
  },
  wallDiagonal: {
    name: 'Wall Diagonal Cabinets',
    items: [
      { model: 'WD2430L', description: '24" Wall Diagonal 30"H Left', category: 'wallDiagonal', price: 355, priceZ: 419, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WD2430R', description: '24" Wall Diagonal 30"H Right', category: 'wallDiagonal', price: 355, priceZ: 419, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WD2436L', description: '24" Wall Diagonal 36"H Left', category: 'wallDiagonal', price: 415, priceZ: 490, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WD2436R', description: '24" Wall Diagonal 36"H Right', category: 'wallDiagonal', price: 415, priceZ: 490, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WD2442L', description: '24" Wall Diagonal 42"H Left', category: 'wallDiagonal', price: 473, priceZ: 559, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WD2442R', description: '24" Wall Diagonal 42"H Right', category: 'wallDiagonal', price: 473, priceZ: 559, doors: 1, drawers: 0, imageType: 'wall-corner' },
      { model: 'WD2736R', description: '27" Wall Diagonal 36"H Right', category: 'wallDiagonal', price: 485, priceZ: 573, doors: 1, drawers: 0, imageType: 'wall-corner' },
    ],
  },
  baseEnd: {
    name: 'Base End Cabinets',
    items: [
      { model: 'BEC24L', description: '24" Base End Cabinet Left', category: 'baseEnd', price: 360, priceZ: 425, doors: 1, drawers: 0, imageType: 'base-1d' },
      { model: 'BEC24R', description: '24" Base End Cabinet Right', category: 'baseEnd', price: 360, priceZ: 425, doors: 1, drawers: 0, imageType: 'base-1d' },
    ],
  },
  diagSinkBase: {
    name: 'Diagonal Sink Base Cabinets',
    items: [
      { model: 'DSB36L', description: '36" Diagonal Sink Base Left', category: 'diagSinkBase', price: 715, priceZ: 845, doors: 2, drawers: 0, imageType: 'base-corner' },
      { model: 'DSB36R', description: '36" Diagonal Sink Base Right', category: 'diagSinkBase', price: 715, priceZ: 845, doors: 2, drawers: 0, imageType: 'base-corner' },
    ],
  },
  ovenCabinet: {
    name: 'Oven Cabinets',
    items: [
      { model: 'OC3084', description: '30" Oven Cabinet 84"H', category: 'ovenCabinet', price: 1100, priceZ: 1299, doors: 2, drawers: 1, imageType: 'tall' },
      { model: 'OC3096', description: '30" Oven Cabinet 96"H', category: 'ovenCabinet', price: 1230, priceZ: 1453, doors: 2, drawers: 1, imageType: 'tall' },
    ],
  },
  wasteBasket: {
    name: 'Waste Basket Cabinets',
    items: [
      { model: 'BWBK18', description: '18" Double Waste Basket Base', category: 'wasteBasket', price: 450, priceZ: 531, doors: 1, drawers: 0, imageType: 'base-1d' },
      { model: 'BWKW15', description: '15" Single Waste Basket Base', category: 'wasteBasket', price: 420, priceZ: 496, doors: 1, drawers: 0, imageType: 'base-1d' },
    ],
  },
  wineRack: {
    name: 'Wine Rack Cabinets',
    items: [
      { model: 'WR3018', description: '30" Wine Rack Wall 18"H', category: 'wineRack', price: 265, priceZ: 313, doors: 0, drawers: 0, imageType: 'specialty' },
    ],
  },
  applianceGarage: {
    name: 'Appliance Garage Cabinets',
    items: [
      { model: 'AGD2418', description: '24" Diagonal Appliance Garage 18"H', category: 'applianceGarage', price: 290, priceZ: 343, doors: 1, drawers: 0, imageType: 'specialty' },
    ],
  },
  woodHood: {
    name: 'Wood Hood Cabinets',
    items: [
      { model: 'WH30', description: '30" Double Door Wood Hood', category: 'woodHood', price: 440, priceZ: 520, doors: 2, drawers: 0, imageType: 'specialty' },
    ],
  },
  microwaveWall: {
    name: 'Microwave Wall Cabinets',
    items: [
      { model: 'MW3015', description: '30" Microwave Wall Cabinet 15"H', category: 'microwaveWall', price: 190, priceZ: 224, doors: 1, drawers: 0, imageType: 'specialty' },
      { model: 'MW3018', description: '30" Microwave Wall Cabinet 18"H', category: 'microwaveWall', price: 228, priceZ: 269, doors: 1, drawers: 0, imageType: 'specialty' },
      { model: 'MW3024', description: '30" Microwave Wall Cabinet 24"H', category: 'microwaveWall', price: 304, priceZ: 359, doors: 1, drawers: 0, imageType: 'specialty' },
      { model: 'MW3030', description: '30" Microwave Wall Cabinet 30"H', category: 'microwaveWall', price: 380, priceZ: 449, doors: 1, drawers: 0, imageType: 'specialty' },
    ],
  },
  panels: {
    name: 'Panels & Fillers',
    items: [
      { model: 'FP4896-3/4', description: 'Island Panel 48×96 ¾"', category: 'panels', price: 495, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'FP4896-1/4', description: 'Island Panel 48×96 ¼"', category: 'panels', price: 110, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'RP2496', description: 'Refrigerator Panel 24×96"', category: 'panels', price: 358, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'REP84', description: 'Refrigerator End Panel 84"', category: 'panels', price: 394, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'REP96', description: 'Refrigerator End Panel 96"', category: 'panels', price: 473, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'REP843', description: 'Refrigerator End Panel 84" (3" wide)', category: 'panels', price: 394, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'REP963', description: 'Refrigerator End Panel 96" (3" wide)', category: 'panels', price: 473, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'BP4896', description: 'Back Panel 48×96"', category: 'panels', price: 395, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'DWP3', description: 'Dishwasher Panel ³⁄₈"', category: 'panels', price: 151, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'DWP3/4', description: 'Dishwasher Panel ¾"', category: 'panels', price: 96, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'DW3', description: 'Dishwasher Panel 3"', category: 'panels', price: 88, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'BDE24', description: 'Base Cabinet Decorative End 24"', category: 'panels', price: 143, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WDE1230', description: 'Wall Decorative End 12×30"', category: 'panels', price: 125, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WF330', description: 'Wall Filler 3×30"', category: 'panels', price: 44, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WF336', description: 'Wall Filler 3×36"', category: 'panels', price: 50, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WF342', description: 'Wall Filler 3×42"', category: 'panels', price: 58, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WF630', description: 'Wall Filler 6×30"', category: 'panels', price: 61, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WF636', description: 'Wall Filler 6×36"', category: 'panels', price: 66, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'WF642', description: 'Wall Filler 6×42"', category: 'panels', price: 77, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'BF3', description: 'Base Filler 3"', category: 'panels', price: 35, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'BF6', description: 'Base Filler 6"', category: 'panels', price: 57, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'TF3X96', description: 'Tall Filler 3×96"', category: 'panels', price: 73, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'TF6X96', description: 'Tall Filler 6×96"', category: 'panels', price: 96, doors: 0, drawers: 0, imageType: 'accessory' },
      { model: 'OWF6', description: 'Overlay Filler 6"', category: 'panels', price: 47, doors: 0, drawers: 0, imageType: 'accessory' },
    ],
  },
};

// Flat lookup for quick price/description resolution
export const cabinetLookup: Record<string, CabinetItem> = {};
Object.values(cabinetCatalog).forEach((cat) => {
  cat.items.forEach((item) => {
    cabinetLookup[item.model] = item;
  });
});

// ── Category system (single source of truth) ────────────────────────────

// Category sort order: wall → base → tall → accessories/panels
export const CATEGORY_ORDER: Record<string, number> = {
  wall12: 1, wall15: 2, wall18: 3, wall24: 4, wall30: 5, wall36: 6, wall42: 7,
  cornerWall: 8, blindWall: 9, cornerWallDiag: 10, squareCornerWall: 11, wallEnd: 12,
  wallDiagonal: 13,
  base: 20, sinkBase: 21, drawerBase: 22, blindBase: 23, cornerSinkBase: 24,
  lazySusanBase: 25, ezReachBase: 26, microwaveBase: 27, baseEnd: 28, diagSinkBase: 29,
  wasteBasket: 30,
  pantry: 40, utility: 41, specialty: 42, ovenCabinet: 43,
  vanity: 50,
  wineRack: 55, applianceGarage: 56, woodHood: 57, microwaveWall: 58,
  accessories: 60, revashelf: 61, panels: 62,
};

/** Map category keys to human-readable group labels */
const CATEGORY_GROUP: Record<string, string> = {};
const addGroup = (cats: string[], label: string) => cats.forEach(c => { CATEGORY_GROUP[c] = label; });
addGroup(['wall12','wall15','wall18','wall24','wall30','wall36','wall42','cornerWall','blindWall','cornerWallDiag','squareCornerWall','wallEnd','wallDiagonal'], 'Wall Cabinets');
addGroup(['base','sinkBase','blindBase','cornerSinkBase','lazySusanBase','ezReachBase','microwaveBase','baseEnd','diagSinkBase','wasteBasket'], 'Base Cabinets');
addGroup(['drawerBase'], 'Drawer Base Cabinets');
addGroup(['pantry','utility','specialty','ovenCabinet'], 'Pantry & Tall Cabinets');
addGroup(['vanity'], 'Vanity Cabinets');
addGroup(['wineRack','applianceGarage','woodHood','microwaveWall'], 'Specialty Cabinets');
addGroup(['accessories','revashelf'], 'Accessories');
addGroup(['panels'], 'Panels');

/** Get the display group label for a model */
export function getCategoryGroup(model: string): string {
  const cat = cabinetLookup[model]?.category || '';
  return CATEGORY_GROUP[cat] || 'Other';
}

/** Extract the numeric width from a model string (e.g. "W3036" → 30, "B24" → 24) */
function extractSize(model: string): number {
  const m = model.match(/^[A-Z]+(\d{2,3})/);
  return m ? parseInt(m[1], 10) : 999;
}

/** Sort cost breakdown items by category order, then by size small→big */
export function sortCostItems<T extends { model: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const catA = cabinetLookup[a.model]?.category || '';
    const catB = cabinetLookup[b.model]?.category || '';
    const orderA = CATEGORY_ORDER[catA] ?? 99;
    const orderB = CATEGORY_ORDER[catB] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return extractSize(a.model) - extractSize(b.model);
  });
}
