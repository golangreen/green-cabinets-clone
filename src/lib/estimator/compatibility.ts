// ── Door-style ↔ finish/brand compatibility rules ─────────────────────
// Single source of truth for which finishes can be paired with which door
// styles. Adding a new supplier brand? Add it to BRAND_DOOR_RULES below.
import type { MaterialBrand } from '@/types/materials';
import { getDoorStyleById, getFinishById, type FinishOption } from './finishes-data';

export type DoorStyleId = 'shaker' | 'slim-shaker' | 'flat-panel' | 'raised-panel';

/** Door styles each brand can actually be fabricated in. */
const BRAND_DOOR_RULES: Record<MaterialBrand, DoorStyleId[]> = {
  // TFL / HPL panels — flat slab only (can't be milled into shaker rails).
  Tafisa:         ['flat-panel'],
  Egger:          ['flat-panel'],
  Wilsonart:      ['flat-panel'],
  AGT:            ['flat-panel'],
  // Veneer — slab only; rail/stile veneer wrapping isn't offered.
  Shinnoki:       ['flat-panel'],
  // Engineered stone — slab fronts only, never raised/shaker.
  'Raphael Stone':['flat-panel'],
};

/** House finishes (painted / wood stain) work on every door style. */
const HOUSE_CATEGORY_ALL_DOORS: DoorStyleId[] = ['shaker', 'slim-shaker', 'flat-panel', 'raised-panel'];

export interface CompatResult {
  ok: boolean;
  reason?: string;
}

export function checkCompatibility(doorStyleId: string, finishId: string): CompatResult {
  if (!doorStyleId || !finishId) return { ok: true };
  const finish = getFinishById(finishId);
  if (!finish) return { ok: true };

  const allowed = finish.brand
    ? BRAND_DOOR_RULES[finish.brand as MaterialBrand] ?? HOUSE_CATEGORY_ALL_DOORS
    : HOUSE_CATEGORY_ALL_DOORS;

  if (allowed.includes(doorStyleId as DoorStyleId)) return { ok: true };

  const doorName = getDoorStyleById(doorStyleId)?.name ?? doorStyleId;
  const allowedNames = allowed.map(id => getDoorStyleById(id)?.name ?? id).join(', ');
  const label = finish.brand ? `${finish.brand} panels` : finish.name;
  return {
    ok: false,
    reason: `${label} can only be fabricated as ${allowedNames} — not ${doorName}.`,
  };
}

/** True if this finish can be paired with the given door style. */
export function isFinishAllowedForDoor(finish: FinishOption, doorStyleId: string): boolean {
  if (!doorStyleId) return true;
  const allowed = finish.brand
    ? BRAND_DOOR_RULES[finish.brand as MaterialBrand] ?? HOUSE_CATEGORY_ALL_DOORS
    : HOUSE_CATEGORY_ALL_DOORS;
  return allowed.includes(doorStyleId as DoorStyleId);
}

/** Door styles available for a given finish (used to nudge users). */
export function allowedDoorStylesForFinish(finishId: string): DoorStyleId[] {
  const finish = getFinishById(finishId);
  if (!finish) return HOUSE_CATEGORY_ALL_DOORS;
  return finish.brand
    ? BRAND_DOOR_RULES[finish.brand as MaterialBrand] ?? HOUSE_CATEGORY_ALL_DOORS
    : HOUSE_CATEGORY_ALL_DOORS;
}
