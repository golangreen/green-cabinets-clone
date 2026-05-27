// ── Green Cabinets NY — Estimator finish catalog ──────────────────────
// Single source of truth: src/data/finishes/index.ts
// Adding a new supplier in PANELS_BY_BRAND automatically wires it into
// the estimator (new tab + swatches) — no changes needed here.

import { ALL_PANELS, PANELS_BY_BRAND } from "@/data/finishes";
import type { MaterialBrand, MaterialPanel } from "@/types/materials";

export interface DoorStyle {
  id: string;
  name: string;
  description: string;
}

export type FinishCategory = "painted" | "wood" | MaterialBrand;

export interface FinishOption {
  id: string;
  name: string;
  brand?: string;
  category: FinishCategory;
  /** Fallback swatch color (used when thumb is unavailable). */
  hex: string;
  /** Real product image (preferred over hex). */
  thumb?: string;
  hiRes?: string;
  /** Manufacturer codes (TFL/HPL/decor). */
  codes?: string[];
  /** Texture/finish family (e.g. "Iconiq Textured"). */
  finishTexture?: string;
  detailUrl?: string;
  popular?: boolean;
  note?: string;
}

// ── Door Styles ────────────────────────────────────────────────────────
export const DOOR_STYLES: DoorStyle[] = [
  { id: "shaker",       name: "Shaker",       description: "Recessed panel — most popular" },
  { id: "slim-shaker",  name: "Slim Shaker",  description: "Narrow-rail modern shaker" },
  { id: "flat-panel",   name: "Flat Panel",   description: "Slab / full overlay — clean & modern" },
  { id: "raised-panel", name: "Raised Panel", description: "Traditional raised center panel" },
];

// ── House painted colors (no supplier — done in-shop) ─────────────────
const PAINTED: FinishOption[] = [
  { id: "pure-white",    name: "Pure White",    category: "painted", hex: "#F9F9F7", popular: true },
  { id: "off-white",     name: "Off White",     category: "painted", hex: "#F0EBE0" },
  { id: "antique-white", name: "Antique White", category: "painted", hex: "#EDE3C8" },
  { id: "cream",         name: "Cream / Ivory", category: "painted", hex: "#FBF4DC" },
  { id: "light-gray",    name: "Light Gray",    category: "painted", hex: "#D5D9E0", popular: true },
  { id: "slate-gray",    name: "Slate Gray",    category: "painted", hex: "#8A9099" },
  { id: "charcoal",      name: "Charcoal",      category: "painted", hex: "#4B5060" },
  { id: "matte-black",   name: "Matte Black",   category: "painted", hex: "#242424" },
  { id: "navy",          name: "Navy Blue",     category: "painted", hex: "#1E3A5F" },
  { id: "sage-green",    name: "Sage Green",    category: "painted", hex: "#7A9E7A" },
  { id: "forest-green",  name: "Forest Green",  category: "painted", hex: "#3A5A3A" },
  { id: "greige",        name: "Greige",        category: "painted", hex: "#C9B9A8" },
  { id: "taupe",         name: "Taupe",         category: "painted", hex: "#B0A090" },
  { id: "terracotta",    name: "Terracotta",    category: "painted", hex: "#C4714A" },
  { id: "mushroom",      name: "Mushroom",      category: "painted", hex: "#A89880" },
  { id: "blue-gray",     name: "Blue Gray",     category: "painted", hex: "#8FA3B1" },
  { id: "custom-paint",  name: "Custom Color",  category: "painted", hex: "#E8E8E8", note: "Provide Benjamin Moore / Sherwin-Williams color code" },
];

// ── House solid-wood tones (stains, not supplier panels) ──────────────
const WOOD: FinishOption[] = [
  { id: "natural-maple", name: "Natural Maple", category: "wood", hex: "#D4A96A", popular: true },
  { id: "honey-maple",   name: "Honey Maple",   category: "wood", hex: "#C8883A" },
  { id: "natural-oak",   name: "Natural Oak",   category: "wood", hex: "#C0925A" },
  { id: "whitewash-oak", name: "Whitewash Oak", category: "wood", hex: "#E0D4C0" },
  { id: "light-walnut",  name: "Light Walnut",  category: "wood", hex: "#9A7050" },
  { id: "walnut",        name: "Walnut",        category: "wood", hex: "#6B4226" },
  { id: "dark-walnut",   name: "Dark Walnut",   category: "wood", hex: "#3E240E" },
  { id: "cherry",        name: "Cherry",        category: "wood", hex: "#8B3A3A" },
  { id: "espresso",      name: "Espresso",      category: "wood", hex: "#2E1206" },
];

// ── Map a supplier MaterialPanel → estimator FinishOption ─────────────
function panelToFinish(p: MaterialPanel): FinishOption {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.brand,
    hex: p.swatchHex ?? "#D8D4CE",
    thumb: p.thumb || undefined,
    hiRes: p.hiRes || undefined,
    codes: p.codes,
    finishTexture: p.finish,
    detailUrl: p.detailUrl || undefined,
  };
}

const SUPPLIER_FINISHES: FinishOption[] = ALL_PANELS.map(panelToFinish);

// ── Public catalog ────────────────────────────────────────────────────
export const FINISHES: FinishOption[] = [...PAINTED, ...WOOD, ...SUPPLIER_FINISHES];

// Category list: house categories + every registered supplier brand.
// Adding a new brand to PANELS_BY_BRAND auto-adds its tab here.
const BRAND_KEYS = Object.keys(PANELS_BY_BRAND) as MaterialBrand[];

export const FINISH_CATEGORIES: FinishCategory[] = ["painted", "wood", ...BRAND_KEYS];

export const FINISH_CATEGORY_LABELS: Record<FinishCategory, string> = {
  painted: "Painted",
  wood: "Wood Tones",
  ...(Object.fromEntries(BRAND_KEYS.map(b => [b, b])) as Record<MaterialBrand, string>),
};

// ── Helpers ───────────────────────────────────────────────────────────
export function getFinishById(id: string): FinishOption | undefined {
  return FINISHES.find(f => f.id === id);
}

export function getDoorStyleById(id: string): DoorStyle | undefined {
  return DOOR_STYLES.find(s => s.id === id);
}

export function getFinishesByCategory(cat: FinishCategory): FinishOption[] {
  return FINISHES.filter(f => f.category === cat);
}
