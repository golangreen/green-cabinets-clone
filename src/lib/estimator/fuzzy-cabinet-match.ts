/**
 * Fuzzy cabinet matching — when a model code isn't found in the catalog,
 * parse its dimensions and find the next size up for pricing.
 */
import { cabinetLookup } from '@/lib/estimator/catalog-data';
import type { CabinetItem } from '@/lib/estimator/types';

export interface FuzzyMatch {
  originalModel: string;
  matchedModel: string;
  matchedItem: CabinetItem;
  reason: string; // e.g. "Sized up from W1533 → W1536"
}

// Standard catalog heights for wall cabinets
const WALL_HEIGHTS = [12, 15, 18, 24, 30, 36, 42];
// Standard widths
const STANDARD_WIDTHS = [6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48];
// Tall cabinet heights
const TALL_HEIGHTS = [84, 90, 96];

function nextUp(value: number, options: number[]): number | null {
  const sorted = [...options].sort((a, b) => a - b);
  for (const opt of sorted) {
    if (opt >= value) return opt;
  }
  return sorted[sorted.length - 1] ?? null; // return largest if nothing bigger
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Try to parse a model code pattern and find the best catalog match.
 * Returns null if no reasonable match can be made.
 */
export function fuzzyMatchCabinet(model: string): FuzzyMatch | null {
  const m = model.toUpperCase().replace(/[-\s]/g, '');

  // Already in catalog — shouldn't be here, but just in case
  if (cabinetLookup[model]) return null;

  // ── Wall cabinets: W[ww][hh] ──
  let match = m.match(/^W(\d{2})(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const height = parseInt(match[2]);
    const bestHeight = nextUp(height, WALL_HEIGHTS);
    const bestWidth = nextUp(width, STANDARD_WIDTHS);
    if (bestHeight != null && bestWidth != null) {
      // Try exact width with upped height first, then up width too
      const candidates = [
        `W${pad2(bestWidth)}${bestHeight}`,
        `W${pad2(width)}${bestHeight}`,
        `W${pad2(bestWidth)}${height}`,
      ];
      for (const c of candidates) {
        if (cabinetLookup[c]) {
          return {
            originalModel: model,
            matchedModel: c,
            matchedItem: cabinetLookup[c],
            reason: `Closest match: ${model} → ${c}`,
          };
        }
      }
    }
  }

  // ── Base cabinets: B[ww] ──
  match = m.match(/^B(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const bestWidth = nextUp(width, STANDARD_WIDTHS);
    if (bestWidth != null) {
      const c = `B${pad2(bestWidth)}`;
      if (cabinetLookup[c]) {
        return {
          originalModel: model,
          matchedModel: c,
          matchedItem: cabinetLookup[c],
          reason: `Closest match: ${model} → ${c}`,
        };
      }
    }
  }

  // ── Sink base: SB[ww] ──
  match = m.match(/^SB(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const bestWidth = nextUp(width, STANDARD_WIDTHS);
    if (bestWidth != null) {
      const c = `SB${pad2(bestWidth)}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
      }
    }
  }

  // ── Drawer base: DB[ww] ──
  match = m.match(/^DB(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const bestWidth = nextUp(width, STANDARD_WIDTHS);
    if (bestWidth != null) {
      const c = `DB${pad2(bestWidth)}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
      }
    }
  }

  // ── Pantry: PC[ww][hh] ──
  match = m.match(/^PC(\d{2})(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const height = parseInt(match[2]);
    const bestHeight = nextUp(height, TALL_HEIGHTS);
    const bestWidth = nextUp(width, [15, 18, 24]);
    if (bestHeight != null && bestWidth != null) {
      const candidates = [
        `PC${pad2(bestWidth)}${bestHeight}`,
        `PC${pad2(width)}${bestHeight}`,
      ];
      for (const c of candidates) {
        if (cabinetLookup[c]) {
          return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
        }
      }
    }
  }

  // ── Utility: UC[ww][hh] ──
  match = m.match(/^UC(\d{2})(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const height = parseInt(match[2]);
    const bestHeight = nextUp(height, TALL_HEIGHTS);
    const bestWidth = nextUp(width, [18, 24, 27, 30]);
    if (bestHeight != null && bestWidth != null) {
      const candidates = [
        `UC${pad2(bestWidth)}${bestHeight}`,
        `UC${pad2(width)}${bestHeight}`,
      ];
      for (const c of candidates) {
        if (cabinetLookup[c]) {
          return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
        }
      }
    }
  }

  // ── Blind base: BLB[ww] ──
  match = m.match(/^BLB(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const bestWidth = nextUp(width, [36, 39, 42, 45, 48]);
    if (bestWidth != null) {
      const c = `BLB${pad2(bestWidth)}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
      }
    }
  }

  // ── Blind wall: BLW[ww][hh] or WBC[ww][hh] ──
  match = m.match(/^(?:BLW|WBC)(\d{2})(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const height = parseInt(match[2]);
    const prefix = m.startsWith('WBC') ? 'WBC' : 'BLW';
    const bestHeight = nextUp(height, WALL_HEIGHTS);
    if (bestHeight != null) {
      const candidates = [
        `${prefix}${pad2(width)}${bestHeight}`,
        `BLW${pad2(width)}${bestHeight}`,
        `WBC${pad2(width)}${bestHeight}`,
      ];
      for (const c of candidates) {
        if (cabinetLookup[c]) {
          return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
        }
      }
    }
  }

  // ── Corner wall: WDC[ww][hh] ──
  match = m.match(/^WDC(\d{2})(\d{2})$/);
  if (match) {
    const height = parseInt(match[2]);
    const bestHeight = nextUp(height, [30, 36, 42]);
    if (bestHeight != null) {
      const c = `WDC24${bestHeight}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
      }
    }
  }

  // ── Vanity: V[ww] ──
  match = m.match(/^V(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const bestWidth = nextUp(width, [24, 30, 36, 48, 60]);
    if (bestWidth != null) {
      const c = `V${bestWidth}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
      }
    }
  }

  // ── Corner sink base: CSB[ww] ──
  match = m.match(/^CSB(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const bestWidth = nextUp(width, [36, 42]);
    if (bestWidth != null) {
      const c = `CSB${bestWidth}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
      }
    }
  }

  // ── Blind Base: BB[ww] → BLB[ww] ──
  match = m.match(/^BB(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const bestWidth = nextUp(width, [36, 39, 42, 45, 48]);
    if (bestWidth != null) {
      const c = `BLB${pad2(bestWidth)}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Blind Base: ${model} → ${c}` };
      }
    }
  }

  // ── Full Door Base: FDB[ww]/FD[ww] → B[ww] ──
  match = m.match(/^FD[B]?(\d{2})/);
  if (match) {
    const width = parseInt(match[1]);
    const bestWidth = nextUp(width, STANDARD_WIDTHS);
    if (bestWidth != null) {
      const c = `B${pad2(bestWidth)}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Full door base: ${model} → ${c}` };
      }
    }
  }

  // ── WCOR corner wall: WCOR[ww][hh] → WDC[ww][hh] ──
  match = m.match(/^WCOR(\d{2})(\d{2})/);
  if (match) {
    const width = parseInt(match[1]);
    const height = parseInt(match[2]);
    const bestHeight = nextUp(height, [30, 36, 42]);
    if (bestHeight != null) {
      const candidates = [`WDC${pad2(width)}${bestHeight}`, `WDC24${bestHeight}`];
      for (const c of candidates) {
        if (cabinetLookup[c]) {
          return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Corner wall: ${model} → ${c}` };
        }
      }
    }
  }

  // ── Lazy Susan: LSB[ww] ──
  match = m.match(/^LSB(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const bestWidth = nextUp(width, [36, 42]);
    if (bestWidth != null) {
      const c = `LSB${bestWidth}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
      }
    }
  }

  // ── Microwave cab: WMC[ww][hh] ──
  match = m.match(/^WMC(\d{2})(\d{2})$/);
  if (match) {
    const height = parseInt(match[2]);
    const bestHeight = nextUp(height, [30, 36, 42]);
    if (bestHeight != null) {
      const c = `WMC30${bestHeight}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
      }
    }
  }

  // ── OVD (double oven): OVD[ww][hh] ──
  match = m.match(/^OVD(\d{2})(\d{2})$/);
  if (match) {
    const width = parseInt(match[1]);
    const height = parseInt(match[2]);
    const bestHeight = nextUp(height, TALL_HEIGHTS);
    const bestWidth = nextUp(width, [30, 33]);
    if (bestHeight != null && bestWidth != null) {
      const c = `OVD${pad2(bestWidth)}${bestHeight}`;
      if (cabinetLookup[c]) {
        return { originalModel: model, matchedModel: c, matchedItem: cabinetLookup[c], reason: `Closest match: ${model} → ${c}` };
      }
    }
  }

  // ── 2020 Design codes (W[ww][hh][dd]) and any misread variants — do not fuzzy-match ──
  // Covers 6-digit valid codes AND 7-digit AI misreads (e.g. W3012124 → should be W302124)
  if (/^W\d{5,}$/.test(m)) return null;

  // ── Generic: try stripping trailing L/R/D suffixes ──
  const stripped = model.replace(/[LRD]$/i, '');
  if (stripped !== model && cabinetLookup[stripped]) {
    return {
      originalModel: model,
      matchedModel: stripped,
      matchedItem: cabinetLookup[stripped],
      reason: `Matched without suffix: ${model} → ${stripped}`,
    };
  }

  // ── Try adding common suffixes (L/R) ──
  for (const suffix of ['L', 'R']) {
    if (cabinetLookup[model + suffix]) {
      return {
        originalModel: model,
        matchedModel: model + suffix,
        matchedItem: cabinetLookup[model + suffix],
        reason: `Matched with suffix: ${model} → ${model + suffix}`,
      };
    }
  }

  // ── Brute force: find items in the same family by prefix ──
  const familyPrefix = m.replace(/\d+.*$/, '');
  if (familyPrefix.length >= 1) {
    const familyItems = Object.values(cabinetLookup).filter(item =>
      item.model.toUpperCase().startsWith(familyPrefix)
    );
    if (familyItems.length > 0) {
      // Pick the cheapest (smallest) in the family as a conservative estimate
      // Actually pick the closest by price (next one up)
      const sortedByPrice = [...familyItems].sort((a, b) => a.price - b.price);
      // Try to extract a width from the original to get a reasonable match
      const numMatch = m.match(/(\d+)/);
      if (numMatch) {
        const origNum = parseInt(numMatch[1]);
        // Find closest item with model number >= origNum
        const candidate = sortedByPrice.find(item => {
          const itemNum = parseInt(item.model.replace(/\D+/g, '') || '0');
          return itemNum >= origNum;
        }) || sortedByPrice[sortedByPrice.length - 1];
        
        if (candidate) {
          return {
            originalModel: model,
            matchedModel: candidate.model,
            matchedItem: candidate,
            reason: `Best family match: ${model} → ${candidate.model}`,
          };
        }
      }
    }
  }

  return null;
}
