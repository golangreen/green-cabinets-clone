export interface VanityConfig {
  width: number;
  height: number;
  depth: number;
  finish: string;
  countertop: string;
  hardware: string;
  sinks: number;
  drawers?: number;
  doors?: number;
  mirror?: boolean;
  lighting?: boolean;
}

export interface VanityTemplateConfig {
  brand: string;
  finish: string;
  width: string;
  widthFraction: string;
  height: string;
  heightFraction: string;
  depth: string;
  depthFraction: string;
  doorStyle: string;
  numDrawers: number;
  handleStyle: string;
  cabinetPosition?: string;
}

export interface VanityTemplate {
  id: string;
  name: string;
  description?: string;
  config: VanityTemplateConfig;
  thumbnail?: string;
  price?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface VanityPricing {
  basePrice: number;
  finishPrice: number;
  countertopPrice: number;
  hardwarePrice: number;
  sinkPrice: number;
  drawerPrice: number;
  doorPrice: number;
  mirrorPrice: number;
  lightingPrice: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface FinishOption {
  id: string;
  name: string;
  brand: 'egger' | 'tafisa' | 'wilsonart' | 'shinnoki';
  color: string;
  texture?: string;
  image?: string;
  priceMultiplier: number;
}

export interface CountertopOption {
  id: string;
  name: string;
  material: 'quartz' | 'granite' | 'marble' | 'laminate' | 'solid-surface';
  color: string;
  image?: string;
  pricePerSqFt: number;
}

export interface HardwareOption {
  id: string;
  name: string;
  brand: 'blum' | 'richelieu' | 'standard';
  type: 'hinges' | 'slides' | 'handles' | 'knobs';
  finish: string;
  pricePerUnit: number;
}

export interface VanityDimensions {
  width: {
    min: number;
    max: number;
    default: number;
  };
  height: {
    min: number;
    max: number;
    default: number;
  };
  depth: {
    min: number;
    max: number;
    default: number;
  };
}

export interface SavedVanityDesign {
  id: string;
  user_id: string;
  name: string;
  config: VanityConfig;
  pricing: VanityPricing;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}
