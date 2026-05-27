/**
 * Custom pricing for non-catalog cabinet dimensions.
 * Used when a cabinet has non-standard W × H × D that doesn't exist in the catalog.
 * Prices are estimated by bilinear interpolation between nearby catalog items,
 * with a depth surcharge for cabinets deeper than the catalog standard.
 * Items priced this way are marked with ✦ in the UI.
 */
import { cabinetLookup } from '@/lib/estimator/catalog-data';
import type { Collection } from '@/lib/estimator/types';

const WALL_HEIGHTS = [12, 15, 18, 24, 30, 36, 42];
const WALL_WIDTHS = [6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39];
const WALL_STD_DEPTH = 12;

export interface CustomPriceResult {
  price: number;
  priceZ: number;
  description: string;
  formula: string;
  doors: number;
  drawers: number;
}

function pad2(n: number) { return String(n).padStart(2, '0'); }

// ── Width-based price anchors from catalog ────────────────────────────────

const BASE_ANCHORS: [number, number, number][] = [
  // [width, L price, Z price]
  [9,  245, 289], [12, 270, 319], [15, 278, 328], [18, 305, 360],
  [21, 325, 384], [24, 377, 445], [27, 418, 494], [30, 437, 516],
  [33, 470, 555], [36, 490, 579], [39, 535, 632], [42, 567, 670],
  [48, 627, 741],
];

const DRAWER_BASE_ANCHORS: [number, number, number][] = [
  [12, 454, 536], [15, 470, 555], [18, 498, 588], [21, 512, 605],
  [24, 531, 627], [30, 685, 809], [33, 789, 932], [36, 891, 1052],
];

const SINK_BASE_ANCHORS: [number, number, number][] = [
  [24, 344, 406], [27, 352, 416], [30, 371, 438], [33, 380, 449],
  [36, 388, 458], [39, 441, 521], [42, 473, 559], [48, 567, 670],
];

const VANITY_ANCHORS: [number, number, number][] = [
  [24, 215, 254], [30, 270, 319], [36, 344, 406], [48, 462, 546], [60, 591, 698],
];

// ── Generic linear interpolation by width ─────────────────────────────────

function interpolateByWidth(width: number, anchors: [number, number, number][]): { L: number; Z: number } | null {
  if (anchors.length === 0) return null;
  const sorted = [...anchors].sort((a, b) => a[0] - b[0]);

  // Below range: use smallest
  if (width <= sorted[0][0]) return { L: sorted[0][1], Z: sorted[0][2] };
  // Above range: use largest
  if (width >= sorted[sorted.length - 1][0]) {
    const last = sorted[sorted.length - 1];
    return { L: last[1], Z: last[2] };
  }

  const lo = sorted.filter(a => a[0] <= width).at(-1)!;
  const hi = sorted.find(a => a[0] > width)!;
  const t = (width - lo[0]) / (hi[0] - lo[0]);

  return {
    L: Math.round(lo[1] + t * (hi[1] - lo[1])),
    Z: Math.round(lo[2] + t * (hi[2] - lo[2])),
  };
}

// ── Wall cabinet helpers ───────────────────────────────────────────────────

function catalogWallPrice(width: number, height: number, collection: Collection): number | null {
  const item = cabinetLookup[`W${pad2(width)}${pad2(height)}`];
  if (!item) return null;
  return collection === 'zuma' ? (item.priceZ ?? item.price) : item.price;
}

function clamp(val: number, arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  if (val <= sorted[0]) return sorted[0];
  if (val >= sorted[sorted.length - 1]) return sorted[sorted.length - 1];
  return val;
}

function nearestBelow(val: number, arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted.filter(v => v <= val).at(-1) ?? sorted[0];
}
function nearestAbove(val: number, arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted.find(v => v >= val) ?? sorted[sorted.length - 1];
}

function interpolateWallBase(width: number, height: number, collection: Collection): number | null {
  const w = clamp(width, WALL_WIDTHS);
  const h = clamp(height, WALL_HEIGHTS);

  const wLow = nearestBelow(w, WALL_WIDTHS);
  const wHigh = nearestAbove(w, WALL_WIDTHS);
  const hLow = nearestBelow(h, WALL_HEIGHTS);
  const hHigh = nearestAbove(h, WALL_HEIGHTS);

  const get = (ww: number, hh: number) => catalogWallPrice(ww, hh, collection);

  const p00 = get(wLow, hLow);
  const p10 = get(wHigh, hLow);
  const p01 = get(wLow, hHigh);
  const p11 = get(wHigh, hHigh);

  if (p00 == null) return null;

  const tW = wLow === wHigh ? 0 : (w - wLow) / (wHigh - wLow);
  const tH = hLow === hHigh ? 0 : (h - hLow) / (hHigh - hLow);

  const low  = p00 + tW * ((p10 ?? p00) - p00);
  const high = (p01 ?? p00) + tW * (((p11 ?? p01) ?? p00) - (p01 ?? p00));

  return low + tH * (high - low);
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Calculate a custom price for a 2020 Design wall cabinet code W[ww][hh][dd].
 * Returns null if the model doesn't match the expected pattern.
 */
export function calculateCustomCabinetPrice(model: string): CustomPriceResult | null {
  const upper = model.toUpperCase().trim();

  // ── Wall cabinet: W[ww][hh][dd] ──
  const mW = upper.match(/^W(\d{2})(\d{2})(\d{2})$/);
  if (mW) {
    const width  = parseInt(mW[1]);
    const height = parseInt(mW[2]);
    const depth  = parseInt(mW[3]);

    if (depth === WALL_STD_DEPTH && WALL_HEIGHTS.includes(height) && WALL_WIDTHS.includes(width)) {
      return null; // should be in catalog
    }

    const baseL = interpolateWallBase(width, height, 'luxor');
    const baseZ = interpolateWallBase(width, height, 'zuma');
    if (baseL == null || baseZ == null) return null;

    const depthMultiplier = 1 + ((depth - WALL_STD_DEPTH) / WALL_STD_DEPTH) * 0.40;
    const price  = Math.round(baseL * depthMultiplier);
    const priceZ = Math.round(baseZ * depthMultiplier);
    const doors  = width >= 24 ? 2 : 1;

    const parts: string[] = [];
    if (!WALL_HEIGHTS.includes(height)) {
      parts.push(`height ${height}" interpolated between ${nearestBelow(height, WALL_HEIGHTS)}"–${nearestAbove(height, WALL_HEIGHTS)}"`);
    }
    if (depth !== WALL_STD_DEPTH) {
      parts.push(`${depth}" depth (+${Math.round((depthMultiplier - 1) * 100)}% vs ${WALL_STD_DEPTH}" standard)`);
    }

    return {
      price, priceZ,
      description: `${width}" W × ${height}" H × ${depth}" D Wall Cabinet`,
      formula: parts.join(', ') || 'custom dimensions',
      doors, drawers: 0,
    };
  }

  // ── Base cabinet: B[ww] (non-catalog width) ──
  const mB = upper.match(/^B(\d{2})$/);
  if (mB) {
    const width = parseInt(mB[1]);
    if (cabinetLookup[upper]) return null; // in catalog
    const p = interpolateByWidth(width, BASE_ANCHORS);
    if (!p) return null;
    return {
      price: p.L, priceZ: p.Z,
      description: `${width}" Base Cabinet (custom width)`,
      formula: `${width}" width interpolated from catalog`,
      doors: width >= 24 ? 2 : 1, drawers: 1,
    };
  }

  // ── Drawer base: DB[ww] (non-catalog width) ──
  const mDB = upper.match(/^DB(\d{2})$/);
  if (mDB) {
    const width = parseInt(mDB[1]);
    if (cabinetLookup[upper]) return null; // in catalog
    const p = interpolateByWidth(width, DRAWER_BASE_ANCHORS);
    if (!p) return null;
    return {
      price: p.L, priceZ: p.Z,
      description: `${width}" 3-Drawer Base (custom width)`,
      formula: `${width}" width interpolated from catalog`,
      doors: 0, drawers: 3,
    };
  }

  // ── Sink base: SB[ww] (non-catalog width) ──
  const mSB = upper.match(/^SB(\d{2})$/);
  if (mSB) {
    const width = parseInt(mSB[1]);
    if (cabinetLookup[upper]) return null; // in catalog
    const p = interpolateByWidth(width, SINK_BASE_ANCHORS);
    if (!p) return null;
    return {
      price: p.L, priceZ: p.Z,
      description: `${width}" Sink Base (custom width)`,
      formula: `${width}" width interpolated from catalog`,
      doors: 2, drawers: 0,
    };
  }

  // ── Vanity: V[ww] (non-catalog width, e.g. V42, V54) ──
  const mV = upper.match(/^V(\d{2})$/);
  if (mV) {
    const width = parseInt(mV[1]);
    if (cabinetLookup[upper]) return null; // in catalog
    const p = interpolateByWidth(width, VANITY_ANCHORS);
    if (!p) return null;
    return {
      price: p.L, priceZ: p.Z,
      description: `${width}" Vanity (custom width)`,
      formula: `${width}" width interpolated from catalog`,
      doors: width >= 24 ? 2 : 1, drawers: width >= 36 ? 1 : 0,
    };
  }

  return null;
}
