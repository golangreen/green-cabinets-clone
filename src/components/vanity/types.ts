// Shared types for vanity configurator components

export interface VanityConfig {
  // Brand & Finish
  selectedBrand: string;
  selectedFinish: string;
  
  // Dimensions
  width: string;
  widthFraction: string;
  height: string;
  heightFraction: string;
  depth: string;
  depthFraction: string;
  zipCode: string;
  
  // Cabinet
  doorStyle: string;
  numDrawers: number;
  handleStyle: string;
  cabinetPosition: string;
  
  // Countertop
  countertopMaterial: 'marble' | 'quartz' | 'granite';
  countertopEdge: 'straight' | 'beveled' | 'bullnose' | 'waterfall';
  countertopColor: string;
  
  // Sink
  sinkStyle: 'undermount' | 'vessel' | 'integrated';
  sinkShape: 'oval' | 'rectangular' | 'square';
  
  // Faucet
  includeFaucet: boolean;
  faucetStyle: 'modern' | 'traditional' | 'waterfall';
  faucetFinish: 'chrome' | 'brushed-nickel' | 'matte-black' | 'gold';
  
  // Backsplash
  includeBacksplash: boolean;
  backsplashMaterial: 'subway-tile' | 'marble-slab' | 'glass-tile' | 'stone';
  backsplashHeight: '4-inch' | 'full-height';
  
  // Vanity Lighting
  includeVanityLighting: boolean;
  vanityLightingStyle: 'sconce' | 'led-strip' | 'pendant';
  vanityLightBrightness: number;
  vanityLightTemp: number;
  
  // Mirror
  includeMirror: boolean;
  mirrorType: 'mirror' | 'medicine-cabinet';
  mirrorSize: 'small' | 'medium' | 'large';
  mirrorShape: 'rectangular' | 'round' | 'oval' | 'arched';
  mirrorFrame: 'none' | 'black' | 'chrome' | 'gold' | 'wood';
  
  // Accessories
  includeTowelBar: boolean;
  towelBarPosition: 'left' | 'right' | 'center';
  includeToiletPaperHolder: boolean;
  includeRobeHooks: boolean;
  robeHookCount: number;
  includeShelving: boolean;
  shelvingType: 'floating' | 'corner' | 'ladder';
}

export interface PricingInfo {
  basePrice: number;
  wallPrice: number;
  floorPrice: number;
  tax: number;
  shipping: number;
  totalPrice: number;
  state: string;
}

export const BRAND_INFO = {
  'Tafisa': {
    price: 250,
    description: 'Premium melamine panels - 60+ colors available',
  },
  'Egger': {
    price: 300,
    description: 'Premium TFL & HPL panels - 98+ woodgrain and solid colors',
  },
  'Shinnoki': {
    price: 350,
    description: 'Prefinished wood veneer panels - Natural wood beauty',
  },
};

export const TAX_RATES: { [key: string]: number } = {
  "NY": 0.08875,
  "NJ": 0.06625,
  "CT": 0.0635,
  "PA": 0.06,
  "other": 0,
};

export const SHIPPING_RATES: { [key: string]: number } = {
  "NY": 150,
  "NJ": 200,
  "CT": 250,
  "PA": 300,
  "other": 400,
};
