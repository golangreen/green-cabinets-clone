export interface CabinetProduct {
  id: string;
  name: string;
  category: 'kitchen' | 'bathroom' | 'closet' | 'laundry' | 'office';
  type: 'base' | 'wall' | 'tall' | 'corner' | 'island' | 'specialty';
  width: number;
  height: number;
  depth: number;
  finish: string;
  doorStyle: string;
  hardware?: string;
  basePrice: number;
  image?: string;
  description?: string;
  inStock: boolean;
}

export interface CabinetTemplate {
  id: string;
  name: string;
  category: 'kitchen' | 'bathroom' | 'closet';
  description?: string;
  cabinets: CabinetProduct[];
  totalPrice: number;
  image?: string;
}

export interface DoorStyle {
  id: string;
  name: string;
  style: 'shaker' | 'flat-panel' | 'raised-panel' | 'glass' | 'louvered';
  image?: string;
  priceMultiplier: number;
}

export interface CabinetFinish {
  id: string;
  name: string;
  brand: 'egger' | 'tafisa' | 'wilsonart';
  color: string;
  type: 'wood' | 'laminate' | 'painted';
  image?: string;
  priceMultiplier: number;
}

export interface CabinetHardware {
  id: string;
  name: string;
  brand: 'blum' | 'richelieu';
  type: 'hinges' | 'slides' | 'lifts' | 'organizers';
  finish: string;
  pricePerUnit: number;
}

export interface CabinetConfiguration {
  products: CabinetProduct[];
  doorStyle: DoorStyle;
  finish: CabinetFinish;
  hardware: CabinetHardware[];
  layout?: string;
  measurements?: Record<string, number>;
}

export interface CabinetProject {
  id: string;
  user_id: string;
  name: string;
  category: 'kitchen' | 'bathroom' | 'closet' | 'laundry' | 'office';
  configuration: CabinetConfiguration;
  totalCost: number;
  status: 'draft' | 'quoted' | 'approved' | 'in-production' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface RoomMeasurements {
  length: number;
  width: number;
  height: number;
  doorLocations?: Array<{ x: number; y: number; width: number }>;
  windowLocations?: Array<{ x: number; y: number; width: number; height: number }>;
  obstacles?: Array<{ x: number; y: number; width: number; height: number }>;
}
