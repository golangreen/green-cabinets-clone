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
 * Per-brand door-style overrides. Empty by default — only fill in when a
 * brand deviates from its tier's standard rule (e.g. a supplier that offers
 * shaker-millable melamine doors).
 */
const BRAND_DOOR_RULES: Partial<Record<MaterialBrand, DoorStyleId[]>> = {};

// ── Tier resolution ───────────────────────────────────────────────────
export function getFinishTier(finish: FinishOption): MaterialTier {
  if (finish.brand) return BRAND_TIERS[finish.brand as MaterialBrand] ?? 'melamine';
  if (finish.category === 'wood') return 'solid-wood';
  return 'painted';
}

export function getTierLabel(tier: MaterialTier): string {
  return TIER_LABELS[tier];
}

function allowedDoorsFor(finish: FinishOption): DoorStyleId[] {
  if (finish.brand) {
    const override = BRAND_DOOR_RULES[finish.brand as MaterialBrand];
    if (override) return override;
  }
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
