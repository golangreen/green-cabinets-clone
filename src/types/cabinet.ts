/**
 * Cabinet Catalog Types
 */

export interface CabinetProduct {
  id: string;
  name: string;
  category: 'base' | 'wall' | 'tall' | 'specialty';
  width: number;
  height: number;
  depth: number;
  basePrice: number;
  description?: string;
  imageUrl?: string;
}

export interface HardwareOption {
  id: string;
  name: string;
  type: 'handle' | 'knob' | 'pull';
  finish: string;
  pricePerUnit: number;
  imageUrl?: string;
}

export interface ProjectCalculation {
  cabinetCosts: number;
  hardwareCosts: number;
  installationCosts: number;
  subtotal: number;
  tax: number;
  total: number;
}
