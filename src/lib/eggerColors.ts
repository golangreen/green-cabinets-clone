// Comprehensive Egger color collection organized by wood type and finish
// Data sourced from https://www.egger.com/en/furniture-interior-design/

export interface EggerColor {
  name: string;
  code: string;
  category: string;
  imageUrl?: string;
}

export const EGGER_COLORS: EggerColor[] = [
  // CASELLA OAK SERIES (New Collection)
  { name: 'Light Natural Casella Oak', code: 'H1367 ST40', category: 'Oak', imageUrl: 'https://cdn.egger.com/img/pim/8854529048606/8854529081374/original.png' },
  { name: 'White Casella Oak', code: 'H1384 ST40', category: 'Oak', imageUrl: 'https://cdn.egger.com/img/pim/8854529900574/8854529933342/original.png' },
  { name: 'Natural Casella Oak', code: 'H1385 ST40', category: 'Oak', imageUrl: 'https://cdn.egger.com/img/pim/8854530293790/8854530326558/original.png' },
  { name: 'Brown Casella Oak', code: 'H1386 ST40', category: 'Oak', imageUrl: 'https://cdn.egger.com/img/pim/8854530687006/8854530719774/original.png' },
  
  // HALIFAX OAK SERIES
  { name: 'White Halifax Oak', code: 'H1176 ST37', category: 'Oak', imageUrl: 'https://cdn.egger.com/img/pim/8854364979230/8854522626078/original.png' },
  { name: 'Natural Halifax Oak', code: 'H1180 ST37', category: 'Oak', imageUrl: 'https://cdn.egger.com/img/pim/8854365372446/8854523117598/original.png' },
  { name: 'Tobacco Halifax Oak', code: 'H1181 ST37', category: 'Oak', imageUrl: 'https://cdn.egger.com/img/pim/8854365765662/8854523215902/original.png' },
  
  // ELM SERIES
  { name: 'Grey-Beige Tossini Elm', code: 'H1210 ST12', category: 'Elm', imageUrl: 'https://cdn.egger.com/img/pim/8854523969566/8860195356702/original.png' },
  { name: 'Fox Grey Tossini Elm', code: 'H1222 ST12', category: 'Elm', imageUrl: 'https://cdn.egger.com/img/pim/8854524166174/8854524198942/original.png' },
  
  // ASH SERIES
  { name: 'Sevilla Ash', code: 'H1223 ST19', category: 'Ash', imageUrl: 'https://cdn.egger.com/img/pim/8854524428318/8854524461086/original.png' },
  { name: 'Trondheim Ash', code: 'H1225 ST12', category: 'Ash', imageUrl: 'https://cdn.egger.com/img/pim/8854525018142/8854525050910/original.png' },
  
  // FROZEN WOOD SERIES
  { name: 'Stone Grey Frozen Wood', code: 'H1288 ST19', category: 'Contemporary', imageUrl: 'https://cdn.egger.com/img/pim/8854372057118/8860196438046/original.png' },
  { name: 'White Frozen Wood', code: 'H1290 ST19', category: 'Contemporary', imageUrl: 'https://cdn.egger.com/img/pim/8854372450334/8854526492702/original.png' },
  { name: 'Carbon Frozen Wood', code: 'H1292 ST19', category: 'Contemporary', imageUrl: 'https://cdn.egger.com/img/pim/8854373236766/8854526591006/original.png' },
  
  // WALNUT SERIES
  { name: 'Brown Warmia Walnut', code: 'H1307 ST19', category: 'Walnut', imageUrl: 'https://cdn.egger.com/img/pim/8854527180830/8854527213598/original.png' },
  { name: 'Dijon Walnut', code: 'H3154 ST12', category: 'Walnut' },
  { name: 'Natural Nebraska Oak', code: 'H3331 ST10', category: 'Walnut' },
  { name: 'Tobacco Gladstone Oak', code: 'H3332 ST10', category: 'Walnut' },
  { name: 'Cognac Gladstone Oak', code: 'H3133 ST12', category: 'Walnut' },
  { name: 'Natural Corbridge Oak', code: 'H1145 ST10', category: 'Walnut' },
  { name: 'Tobacco Corbridge Oak', code: 'H1146 ST10', category: 'Walnut' },
  
  // ALAND PINE SERIES
  { name: 'Sand Aland Pine', code: 'H1313 ST10', category: 'Pine' },
  { name: 'Brown Aland Pine', code: 'H1314 ST10', category: 'Pine' },
  
  // WHITERIVER OAK SERIES
  { name: 'Sand Whiteriver Oak', code: 'H1176 ST37', category: 'Oak' },
  { name: 'Natural Whiteriver Oak', code: 'H1344 ST22', category: 'Oak' },
  
  // SOLID COLORS - WHITES
  { name: 'White', code: 'U101 ST9', category: 'Solids' },
  { name: 'Porcelain White', code: 'U104 ST9', category: 'Solids' },
  { name: 'Alpline White', code: 'U106 ST9', category: 'Solids' },
  { name: 'Crystal White', code: 'U108 ST9', category: 'Solids' },
  { name: 'Polar White', code: 'U113 PM', category: 'Solids' },
  { name: 'White Premium', code: 'W1000 PM', category: 'Solids' },
  { name: 'Champagne White', code: 'U190 ST9', category: 'Solids' },
  { name: 'Ivory', code: 'U222 ST9', category: 'Solids' },
  { name: 'Cashmere', code: 'U223 ST9', category: 'Solids' },
  { name: 'Vanilla', code: 'U224 ST9', category: 'Solids' },
  { name: 'Cream', code: 'U225 ST9', category: 'Solids' },
  { name: 'Sand Beige', code: 'U702 ST9', category: 'Solids' },
  { name: 'Linen Beige', code: 'U717 ST9', category: 'Solids' },
  
  // SOLID COLORS - GRAYS
  { name: 'Light Grey', code: 'U107 ST9', category: 'Solids' },
  { name: 'Light Concrete Grey', code: 'U727 ST9', category: 'Solids' },
  { name: 'Concrete Grey', code: 'U728 ST9', category: 'Solids' },
  { name: 'Dark Concrete Grey', code: 'U732 ST9', category: 'Solids' },
  { name: 'Stone Grey', code: 'U733 ST9', category: 'Solids' },
  { name: 'Graphite Grey', code: 'U788 ST9', category: 'Solids' },
  { name: 'Dust Grey', code: 'U702 PM', category: 'Solids' },
  { name: 'Metallic Grey', code: 'U707 ST9', category: 'Solids' },
  { name: 'Pearl Grey', code: 'U708 ST9', category: 'Solids' },
  { name: 'Silver Grey', code: 'U763 ST9', category: 'Solids' },
  { name: 'Platinum Grey', code: 'U765 ST9', category: 'Solids' },
  { name: 'Anthracite', code: 'U961 ST2', category: 'Solids' },
  { name: 'Lava Grey', code: 'U790 ST9', category: 'Solids' },
  
  // SOLID COLORS - BLACKS & DARKS
  { name: 'Black', code: 'U999 ST2', category: 'Solids' },
  { name: 'Matt Black', code: 'U999 ST9', category: 'Solids' },
  { name: 'Deep Black', code: 'U961 ST76', category: 'Solids' },
  { name: 'Onyx Black', code: 'U963 ST9', category: 'Solids' },
  
  // SOLID COLORS - BLUES
  { name: 'Indigo Blue', code: 'U522 ST9', category: 'Solids' },
  { name: 'Marine Blue', code: 'U525 ST9', category: 'Solids' },
  { name: 'Nordic Blue', code: 'U515 ST9', category: 'Solids' },
  
  // SOLID COLORS - REDS
  { name: 'Signal Red', code: 'U321 ST9', category: 'Solids' },
  
  // SOLID COLORS - GREENS
  { name: 'Olive Green', code: 'U626 ST9', category: 'Solids' },
  
  // MAPLE SERIES
  { name: 'Mountain Maple', code: 'H3700 ST10', category: 'Maple' },
  { name: 'Natural Pacific Walnut', code: 'H1486 ST22', category: 'Maple' },
  { name: 'Cognac Pacific Walnut', code: 'H1487 ST22', category: 'Maple' },
  
  // LARCH SERIES
  { name: 'Brown-Grey Grained Larch', code: 'H1113 ST10', category: 'Larch' },
  { name: 'Havanna Larch', code: 'H1114 ST10', category: 'Larch' },
  
  // ADDITIONAL OAK VARIETIES
  { name: 'Light Grey Kendal Oak', code: 'H3303 ST10', category: 'Oak' },
  { name: 'Natural Kendal Oak', code: 'H1318 ST10', category: 'Oak' },
  { name: 'Dark Kendal Oak', code: 'H3309 ST10', category: 'Oak' },
  { name: 'Brown Grey Craft Oak', code: 'H3158 ST10', category: 'Oak' },
  { name: 'Natural Craft Oak', code: 'H3156 ST10', category: 'Oak' },
  { name: 'Sand Oak', code: 'H1145 ST10', category: 'Oak' },
  { name: 'Natural Sonoma Oak', code: 'H1334 ST10', category: 'Oak' },
  { name: 'Cognac Sonoma Oak', code: 'H1334 ST19', category: 'Oak' },
  { name: 'Light Odense Oak', code: 'H1332 ST10', category: 'Oak' },
  { name: 'Natural Odense Oak', code: 'H1333 ST10', category: 'Oak' },
  { name: 'Dark Odense Oak', code: 'H3304 ST10', category: 'Oak' },
  { name: 'Natural Bardolino Oak', code: 'H1137 ST12', category: 'Oak' },
  { name: 'Grey Bardolino Oak', code: 'H1146 ST10', category: 'Oak' },
  
  // CREATIVE MATERIALS
  { name: 'Urban Concrete', code: 'F812 ST9', category: 'Materials' },
  { name: 'Chicago Concrete', code: 'F186 ST9', category: 'Materials' },
  { name: 'Chromix White/Aluminum', code: 'F508 ST2', category: 'Materials' },
  { name: 'Metallic Brushed', code: 'F509 ST2', category: 'Materials' },
];

// Helper function to get colors by category
export const getEggerColorsByCategory = (category: string) => {
  return EGGER_COLORS.filter(color => color.category === category);
};

// Get all unique categories
export const getEggerCategories = () => {
  return [...new Set(EGGER_COLORS.map(color => color.category))];
};

// Get color names only (for simple dropdown)
export const getEggerColorNames = () => {
  return EGGER_COLORS.map(color => color.name);
};
