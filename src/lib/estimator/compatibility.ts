// ── Door-style ↔ finish/material-tier compatibility rules ─────────────
// Two-layer validation:
//   1. Material tier (melamine / hpl / veneer / stone / painted / solid-wood)
//      vs door style — the fabrication-level rule.
//   2. Per-brand override hook (BRAND_DOOR_RULES) for one-off exceptions.
//
// Adding a new supplier? Register its tier in BRAND_TIERS below — door-style
// rules then flow automatically from TIER_DOOR_RULES.
import type { MaterialBrand } from '@/types/materials';
import { getDoorStyleById, getFinishById, type FinishOption } from './finishes-data';

export type DoorStyleId = 'shaker' | 'slim-shaker' | 'flat-panel' | 'raised-panel';

/**
 * Fabrication material tier. Drives what door profiles can be milled/built.
 * - painted / solid-wood: house-built, supports every profile.
 * - melamine / hpl / veneer / stone: slab panels — flat fronts only.
 */
export type MaterialTier =
  | 'painted'
  | 'solid-wood'
  | 'melamine'
  | 'hpl'
  | 'veneer'
  | 'stone';

const ALL_DOORS: DoorStyleId[] = ['shaker', 'slim-shaker', 'flat-panel', 'raised-panel'];

/** Which door styles each material tier supports — code defaults. */
const DEFAULT_TIER_DOOR_RULES: Record<MaterialTier, DoorStyleId[]> = {
  painted:      ALL_DOORS,
  'solid-wood': ALL_DOORS,
  melamine:     ['flat-panel'],
  hpl:          ['flat-panel'],
  veneer:       ['flat-panel'],
  stone:        ['flat-panel'],
};

/** Mutable runtime view — admin DB overrides patch this in-place. */
const TIER_DOOR_RULES: Record<MaterialTier, DoorStyleId[]> = { ...DEFAULT_TIER_DOOR_RULES };

/** Brand → tier classification. */
const BRAND_TIERS: Record<MaterialBrand, MaterialTier> = {
  Tafisa:          'melamine', // TFL
  AGT:             'melamine', // TFL
  Egger:           'melamine', // mostly TFL
  Wilsonart:       'hpl',      // High-pressure laminate
  Shinnoki:        'veneer',
  'Raphael Stone': 'stone',
};

const TIER_LABELS: Record<MaterialTier, string> = {
  painted:      'Painted',
  'solid-wood': 'Solid wood',
  melamine:     'Melamine / TFL',
  hpl:          'High-pressure laminate',
  veneer:       'Wood veneer',
  stone:        'Engineered stone',
};

/**
 * Per-brand door-style overrides. Patched at runtime from the
 * `compatibility_rules` DB table via `applyCompatibilityOverrides`.
 */
const BRAND_DOOR_RULES: Partial<Record<MaterialBrand, DoorStyleId[]>> = {};

/** Per-finish-id door-style overrides — highest priority (finish > brand > tier). */
const FINISH_DOOR_RULES: Record<string, DoorStyleId[]> = {};

// ── Runtime override API (DB → in-memory) ─────────────────────────────
export interface CompatibilityOverrides {
  tiers?: Partial<Record<MaterialTier, DoorStyleId[]>>;
  brands?: Partial<Record<MaterialBrand, DoorStyleId[]>>;
  finishes?: Record<string, DoorStyleId[]>;
}

/** Replace overrides with DB-sourced rules. Pass empty object to reset. */
export function applyCompatibilityOverrides(overrides: CompatibilityOverrides): void {
  (Object.keys(DEFAULT_TIER_DOOR_RULES) as MaterialTier[]).forEach(t => {
    TIER_DOOR_RULES[t] = overrides.tiers?.[t] ?? DEFAULT_TIER_DOOR_RULES[t];
  });
  (Object.keys(BRAND_DOOR_RULES) as MaterialBrand[]).forEach(b => delete BRAND_DOOR_RULES[b]);
  if (overrides.brands) {
    for (const [brand, doors] of Object.entries(overrides.brands)) {
      if (doors && doors.length) BRAND_DOOR_RULES[brand as MaterialBrand] = doors;
    }
  }
  Object.keys(FINISH_DOOR_RULES).forEach(k => delete FINISH_DOOR_RULES[k]);
  if (overrides.finishes) {
    for (const [id, doors] of Object.entries(overrides.finishes)) {
      if (doors && doors.length) FINISH_DOOR_RULES[id] = doors;
    }
  }
}

/** Current effective rules (for admin UI display). */
export function getEffectiveCompatibilityRules() {
  return {
    tiers: { ...TIER_DOOR_RULES } as Record<MaterialTier, DoorStyleId[]>,
    brands: { ...BRAND_DOOR_RULES } as Partial<Record<MaterialBrand, DoorStyleId[]>>,
    finishes: { ...FINISH_DOOR_RULES } as Record<string, DoorStyleId[]>,
    defaults: DEFAULT_TIER_DOOR_RULES,
  };
}


// ── Tier resolution ───────────────────────────────────────────────────
export function getFinishTier(finish: FinishOption): MaterialTier {
  if (finish.brand) return BRAND_TIERS[finish.brand as MaterialBrand] ?? 'melamine';
  if (finish.category === 'wood') return 'solid-wood';
  return 'painted';
}

export function getTierLabel(tier: MaterialTier): string {
  return TIER_LABELS[tier];
}

/** Plain-English "why" copy per tier — used in the estimator error UI. */
const TIER_WHY: Record<MaterialTier, string> = {
  painted:
    "This finish has been restricted to specific door profiles for the current configuration.",
  'solid-wood':
    "This wood species has been restricted to specific door profiles for the current configuration.",
  melamine:
    "Melamine / TFL panels are pressed sheets — they can't be milled into shaker rails or raised profiles, only cut as a flat slab.",
  hpl:
    "High-pressure laminate is bonded to a flat substrate; the surface would crack if milled into rails or raised profiles.",
  veneer:
    "Real-wood veneer is a thin layer applied to a flat panel — milling shaker rails or raised profiles would tear the grain.",
  stone:
    "Engineered stone fronts are cut from a rigid slab and can't be milled into door profiles.",
};

export function getTierIncompatibilityReason(tier: MaterialTier): string {
  return TIER_WHY[tier];
}


function allowedDoorsFor(finish: FinishOption): DoorStyleId[] {
  // 1. Per-finish override wins
  const finishOverride = FINISH_DOOR_RULES[finish.id];
  if (finishOverride) return finishOverride;
  // 2. Then brand override
  if (finish.brand) {
    const override = BRAND_DOOR_RULES[finish.brand as MaterialBrand];
    if (override) return override;
  }
  // 3. Fall back to tier rule
  return TIER_DOOR_RULES[getFinishTier(finish)];
}


// ── Public API ────────────────────────────────────────────────────────
export interface CompatResult {
  ok: boolean;
  reason?: string;
  tier?: MaterialTier;
}

export function checkCompatibility(doorStyleId: string, finishId: string): CompatResult {
  if (!doorStyleId || !finishId) return { ok: true };
  const finish = getFinishById(finishId);
  if (!finish) return { ok: true };

  const tier = getFinishTier(finish);
  const allowed = allowedDoorsFor(finish);
  if (allowed.includes(doorStyleId as DoorStyleId)) return { ok: true, tier };

  const doorName = getDoorStyleById(doorStyleId)?.name ?? doorStyleId;
  const allowedNames = allowed.map(id => getDoorStyleById(id)?.name ?? id).join(', ');
  const label = finish.brand
    ? `${finish.brand} (${TIER_LABELS[tier]})`
    : `${finish.name} (${TIER_LABELS[tier]})`;
  return {
    ok: false,
    tier,
    reason: `${label} can only be fabricated as ${allowedNames} — not ${doorName}.`,
  };
}

/** True if this finish can be paired with the given door style. */
export function isFinishAllowedForDoor(finish: FinishOption, doorStyleId: string): boolean {
  if (!doorStyleId) return true;
  return allowedDoorsFor(finish).includes(doorStyleId as DoorStyleId);
}

/** Door styles available for a given finish (used to nudge users). */
export function allowedDoorStylesForFinish(finishId: string): DoorStyleId[] {
  const finish = getFinishById(finishId);
  if (!finish) return ALL_DOORS;
  return allowedDoorsFor(finish);
}

/** Door styles supported by a given material tier (handy for filters). */
export function allowedDoorStylesForTier(tier: MaterialTier): DoorStyleId[] {
  return TIER_DOOR_RULES[tier];
}
