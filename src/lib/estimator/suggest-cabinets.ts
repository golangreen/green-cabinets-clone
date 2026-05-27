// ── Suggested cabinets from blueprint analysis ──────────────────────────
//
// Standard kitchen layout rules:
//   • 1 linear foot of wall ≈ 12" of cabinet width
//   • Upper cabinets typically cover ~60-70% of wall run (sink window, range hood gaps)
//   • Base cabinets cover ~80-90% of wall run (appliance gaps for fridge, range, dishwasher)
//   • Standard appliance widths: fridge 36", range 30", dishwasher 24" — subtracted from base run
//   • Corner kitchens (≥16 lf) get blind/corner cabs; L-shape starts at ~20 lf
//   • Island sizing: parse "WxD" from islandSize, fill with base cabs (24" wide each)

import type { Analysis, SelectedCabinet, SuggestionResult, RoomSuggestion } from '@/lib/types';

const FRIDGE_WIDTH = 36; // inches
const RANGE_WIDTH = 30;
const DISHWASHER_WIDTH = 24;
const APPLIANCE_GAP = FRIDGE_WIDTH + RANGE_WIDTH + DISHWASHER_WIDTH; // 90"
const RANGE_HOOD_GAP = 30; // wall gap above range

function parseIslandInches(islandSize: string): number {
  const match = islandSize.match(/([\d.]+)\s*(?:ft|'|")?/i);
  if (!match) return 48;
  const val = parseFloat(match[1]);
  return val <= 20 ? val * 12 : val;
}

function fillWallRun(inches: number, add: (m: string, q: number) => void, height: '30' | '36' = '36') {
  const widths = [36, 30, 24, 18, 15, 12, 9];
  let remaining = inches;

  for (const w of widths) {
    if (remaining <= 0) break;
    const count = Math.floor(remaining / w);
    if (count > 0) {
      const model = `W${String(w).padStart(2, '0')}${height}`;
      add(model, count);
      remaining -= count * w;
    }
  }
}

function fillBaseRun(inches: number, add: (m: string, q: number) => void) {
  let remaining = inches;

  const drawerBases = Math.max(0, Math.floor(inches / 72));
  if (drawerBases > 0) {
    add('DB24', drawerBases);
    remaining -= drawerBases * 24;
  }

  const baseWidths = [36, 30, 24, 21, 18, 15, 12, 9];
  for (const w of baseWidths) {
    if (remaining <= 0) break;
    const count = Math.floor(remaining / w);
    if (count > 0) {
      add(`B${String(w).padStart(2, '0')}`, count);
      remaining -= count * w;
    }
  }
}

export function suggestCabinets(analysis: Analysis): SuggestionResult {
  const allSuggestions: Record<string, number> = {};
  const rooms: RoomSuggestion[] = [];

  const globalAdd = (model: string, qty: number) => {
    if (qty <= 0) return;
    allSuggestions[model] = (allSuggestions[model] || 0) + qty;
  };

  // ── Kitchen suggestions ──────────────────────────────────────────────
  analysis.kitchens.forEach((k) => {
    const roomItems: Record<string, number> = {};
    const add = (model: string, qty: number) => {
      if (qty <= 0) return;
      roomItems[model] = (roomItems[model] || 0) + qty;
      globalAdd(model, qty);
    };

    const totalInches = k.linearFeet * 12;
    const baseRunInches = Math.max(0, totalInches - APPLIANCE_GAP);
    const upperRunInches = Math.max(0, totalInches * 0.65 - RANGE_HOOD_GAP);
    const minUppers = k.upperCabinets || 0;
    const minLowers = k.lowerCabinets || 0;

    if (upperRunInches > 0 || minUppers > 0) {
      if (upperRunInches > 36) {
        fillWallRun(upperRunInches, add, '36');
      } else if (minUppers > 0) {
        add('W3036', minUppers);
      }
    }

    if (baseRunInches > 0 || minLowers > 0) {
      if (baseRunInches > 24) {
        fillBaseRun(baseRunInches, add);
      } else if (minLowers > 0) {
        add('B24', minLowers);
      }
    }

    if (k.linearFeet >= 16) add('WDC2436', 1);
    if (k.linearFeet >= 24) add('WDC2436', 1);

    add('SB36', 1);
    add('DWP3/4', 1);

    if (k.island) {
      const islandInches = parseIslandInches(k.islandSize || '6ft');
      const islandBases = Math.max(2, Math.round(islandInches / 24));
      add('B24', islandBases);
      add('FP4896-3/4', 2);
    }

    add('WMC3036', 1);

    const moldingFeet = k.linearFeet + (k.island ? 8 : 0);
    add('CMD4', Math.max(1, Math.ceil(moldingFeet / 8)));
    add('TLM8', Math.max(1, Math.ceil(k.linearFeet / 8)));

    const approxBases = Math.round(baseRunInches / 24);
    if (approxBases > 0) {
      add('ROT24', Math.max(1, Math.round(approxBases / 4)));
    }

    const parts: string[] = [`${k.linearFeet} linear ft`];
    if (k.island) parts.push(`island (${k.islandSize || '6ft'})`);
    if (k.linearFeet >= 24) parts.push('U-shape layout');
    else if (k.linearFeet >= 16) parts.push('L-shape layout');

    rooms.push({
      roomName: k.name,
      roomType: 'kitchen',
      reasoning: parts.join(' · '),
      items: Object.entries(roomItems).map(([model, qty]) => ({ model, qty, finishSide: 'none' as const })),
    });
  });

  // ── Bathroom suggestions ─────────────────────────────────────────────
  analysis.bathrooms.forEach((b) => {
    const roomItems: Record<string, number> = {};
    const add = (model: string, qty: number) => {
      if (qty <= 0) return;
      roomItems[model] = (roomItems[model] || 0) + qty;
      globalAdd(model, qty);
    };

    const vanityWidth = parseInt(b.vanitySize) || 36;

    if (vanityWidth >= 60) {
      add('SB36', 1);
      add('DB24', 1);
    } else if (vanityWidth >= 48) {
      add('SB36', 1);
      add('DB18', 1);
    } else if (vanityWidth >= 36) {
      add('SB36', 1);
    } else if (vanityWidth >= 30) {
      add('SB30', 1);
    } else {
      add('SB24', 1);
    }

    if (vanityWidth >= 48) {
      add('W3030', b.sinks >= 2 ? 2 : 1);
      if (b.sinks >= 2) add('W1530', 1);
    } else {
      add('W2430', 1);
    }

    if (b.storage?.toLowerCase().includes('full') || b.storage?.toLowerCase().includes('linen')) {
      add('PC1884', 1);
    } else if (b.storage?.toLowerCase().includes('tower')) {
      add('PC1584', 1);
    }

    add('WF330', 1);

    const parts: string[] = [`${b.vanitySize} vanity`, `${b.sinks} sink${b.sinks !== 1 ? 's' : ''}`];
    if (b.storage) parts.push(b.storage.toLowerCase());

    rooms.push({
      roomName: b.name,
      roomType: 'bathroom',
      reasoning: parts.join(' · '),
      items: Object.entries(roomItems).map(([model, qty]) => ({ model, qty, finishSide: 'none' as const })),
    });
  });

  // ── Closet suggestions ───────────────────────────────────────────────
  analysis.closets.forEach((c) => {
    const roomItems: Record<string, number> = {};
    const add = (model: string, qty: number) => {
      if (qty <= 0) return;
      roomItems[model] = (roomItems[model] || 0) + qty;
      globalAdd(model, qty);
    };

    const totalInches = c.linearFeet * 12;

    if (c.type === 'Walk-in') {
      const tallSections = Math.max(1, Math.round(totalInches / 24));
      const wide = Math.ceil(tallSections * 0.6);
      const narrow = tallSections - wide;
      add('PC2484', wide);
      if (narrow > 0) add('PC1884', narrow);
    } else {
      const sections = Math.max(1, Math.round(totalInches / 18));
      add('PC1584', sections);
    }

    if (c.drawers > 0) {
      add('DB18', Math.max(1, Math.ceil(c.drawers / 3)));
    }

    if (c.shelving && totalInches >= 36) {
      add('ROT18', Math.max(1, Math.round(totalInches / 36)));
    }

    const parts: string[] = [c.type, `${c.linearFeet} linear ft`];
    if (c.drawers > 0) parts.push(`${c.drawers} drawers`);
    if (c.shelving) parts.push('shelving');

    rooms.push({
      roomName: c.name,
      roomType: 'closet',
      reasoning: parts.join(' · '),
      items: Object.entries(roomItems).map(([model, qty]) => ({ model, qty, finishSide: 'none' as const })),
    });
  });

  return {
    rooms,
    combined: Object.entries(allSuggestions).map(([model, qty]) => ({ model, qty, finishSide: 'none' as const })),
  };
}
