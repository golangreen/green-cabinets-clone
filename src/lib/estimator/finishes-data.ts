// ── Green Cabinets NY — Finishes & Colors catalog ──────────────────────
// Update this file whenever you add/change finishes on your website.
// hex values are for UI swatches only — not used in production.

export interface DoorStyle {
  id: string;
  name: string;
  description: string;
}

export interface FinishOption {
  id: string;
  name: string;
  brand?: string;           // e.g. "Tafisa", "Shinnoki", "Painted"
  category: FinishCategory;
  hex: string;              // swatch color
  popular?: boolean;
  note?: string;            // e.g. "matte only", "+upcharge"
}

export type FinishCategory = 'painted' | 'wood' | 'laminate' | 'specialty';

export const FINISH_CATEGORY_LABELS: Record<FinishCategory, string> = {
  painted:   'Painted Colors',
  wood:      'Wood Tones',
  laminate:  'Laminate',
  specialty: 'Specialty / Veneer',
};

// ── Door Styles ────────────────────────────────────────────────────────
export const DOOR_STYLES: DoorStyle[] = [
  { id: 'shaker',        name: 'Shaker',        description: 'Recessed panel — most popular' },
  { id: 'slim-shaker',   name: 'Slim Shaker',   description: 'Narrow-rail modern shaker' },
  { id: 'flat-panel',    name: 'Flat Panel',    description: 'Slab / full overlay — clean & modern' },
  { id: 'raised-panel',  name: 'Raised Panel',  description: 'Traditional raised center panel' },
];

// ── Finishes & Colors ─────────────────────────────────────────────────
export const FINISHES: FinishOption[] = [

  // ── Painted ─────────────────────────────────────────────────────────
  { id: 'pure-white',     name: 'Pure White',     category: 'painted', hex: '#F9F9F7', popular: true },
  { id: 'off-white',      name: 'Off White',       category: 'painted', hex: '#F0EBE0' },
  { id: 'antique-white',  name: 'Antique White',   category: 'painted', hex: '#EDE3C8' },
  { id: 'cream',          name: 'Cream / Ivory',   category: 'painted', hex: '#FBF4DC' },
  { id: 'light-gray',     name: 'Light Gray',      category: 'painted', hex: '#D5D9E0', popular: true },
  { id: 'slate-gray',     name: 'Slate Gray',      category: 'painted', hex: '#8A9099' },
  { id: 'charcoal',       name: 'Charcoal',        category: 'painted', hex: '#4B5060' },
  { id: 'matte-black',    name: 'Matte Black',     category: 'painted', hex: '#242424' },
  { id: 'navy',           name: 'Navy Blue',       category: 'painted', hex: '#1E3A5F' },
  { id: 'sage-green',     name: 'Sage Green',      category: 'painted', hex: '#7A9E7A' },
  { id: 'forest-green',   name: 'Forest Green',    category: 'painted', hex: '#3A5A3A' },
  { id: 'greige',         name: 'Greige',          category: 'painted', hex: '#C9B9A8' },
  { id: 'taupe',          name: 'Taupe',           category: 'painted', hex: '#B0A090' },
  { id: 'terracotta',     name: 'Terracotta',      category: 'painted', hex: '#C4714A' },
  { id: 'mushroom',       name: 'Mushroom',        category: 'painted', hex: '#A89880' },
  { id: 'blue-gray',      name: 'Blue Gray',       category: 'painted', hex: '#8FA3B1' },
  { id: 'custom-paint',   name: 'Custom Color',    category: 'painted', hex: '#E8E8E8', note: 'Provide Benjamin Moore / Sherwin-Williams color code' },

  // ── Wood Tones ───────────────────────────────────────────────────────
  { id: 'natural-maple',  name: 'Natural Maple',   category: 'wood', hex: '#D4A96A', popular: true },
  { id: 'honey-maple',    name: 'Honey Maple',     category: 'wood', hex: '#C8883A' },
  { id: 'natural-oak',    name: 'Natural Oak',     category: 'wood', hex: '#C0925A' },
  { id: 'whitewash-oak',  name: 'Whitewash Oak',   category: 'wood', hex: '#E0D4C0' },
  { id: 'light-walnut',   name: 'Light Walnut',    category: 'wood', hex: '#9A7050' },
  { id: 'walnut',         name: 'Walnut',          category: 'wood', hex: '#6B4226' },
  { id: 'dark-walnut',    name: 'Dark Walnut',     category: 'wood', hex: '#3E240E' },
  { id: 'cherry',         name: 'Cherry',          category: 'wood', hex: '#8B3A3A' },
  { id: 'espresso',       name: 'Espresso',        category: 'wood', hex: '#2E1206' },

  // ── Laminate (Tafisa) ────────────────────────────────────────────────
  { id: 'tafisa-white',      name: 'White',           brand: 'Tafisa', category: 'laminate', hex: '#F5F5F3' },
  { id: 'tafisa-arctic',     name: 'Arctic White',    brand: 'Tafisa', category: 'laminate', hex: '#EAEEF0' },
  { id: 'tafisa-light-gray', name: 'Light Gray',      brand: 'Tafisa', category: 'laminate', hex: '#C8CDD4' },
  { id: 'tafisa-graphite',   name: 'Graphite',        brand: 'Tafisa', category: 'laminate', hex: '#6A6E74' },
  { id: 'tafisa-black',      name: 'Black',           brand: 'Tafisa', category: 'laminate', hex: '#1E1E1E' },
  { id: 'tafisa-maple',      name: 'Natural Maple',   brand: 'Tafisa', category: 'laminate', hex: '#C8904A' },
  { id: 'tafisa-wenge',      name: 'Wenge',           brand: 'Tafisa', category: 'laminate', hex: '#3A2012' },
  { id: 'tafisa-concrete',   name: 'Concrete Look',   brand: 'Tafisa', category: 'laminate', hex: '#B8B4B0' },

  // ── Specialty / Veneer (Shinnoki) ────────────────────────────────────
  { id: 'shinnoki-pure-oak',    name: 'Pure Oak',       brand: 'Shinnoki', category: 'specialty', hex: '#D4B870', note: 'Real veneer' },
  { id: 'shinnoki-smoked-oak',  name: 'Smoked Oak',     brand: 'Shinnoki', category: 'specialty', hex: '#7A6040', note: 'Real veneer' },
  { id: 'shinnoki-washed-oak',  name: 'Washed Oak',     brand: 'Shinnoki', category: 'specialty', hex: '#C8BCA8', note: 'Real veneer' },
  { id: 'shinnoki-dark-oak',    name: 'Dark Oak',       brand: 'Shinnoki', category: 'specialty', hex: '#4A3018', note: 'Real veneer' },
  { id: 'shinnoki-walnut',      name: 'American Walnut', brand: 'Shinnoki', category: 'specialty', hex: '#5A3A1A', note: 'Real veneer' },
  { id: 'shinnoki-black-oak',   name: 'Black Oak',      brand: 'Shinnoki', category: 'specialty', hex: '#2A2018', note: 'Real veneer' },
];

// ── Helpers ────────────────────────────────────────────────────────────
export function getFinishById(id: string): FinishOption | undefined {
  return FINISHES.find(f => f.id === id);
}

export function getDoorStyleById(id: string): DoorStyle | undefined {
  return DOOR_STYLES.find(s => s.id === id);
}

export const FINISH_CATEGORIES: FinishCategory[] = ['painted', 'wood', 'laminate', 'specialty'];
