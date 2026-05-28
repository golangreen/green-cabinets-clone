import { describe, it, expect, afterEach } from 'vitest';
import {
  checkCompatibility,
  allowedDoorStylesForFinish,
  applyCompatibilityOverrides,
  getEffectiveCompatibilityRules,
} from '../compatibility';

// Sample finishes (verified in compatibility.test.ts)
const MELAMINE = 'tafisa-muse';      // brand: Tafisa, tier: melamine
const VENEER   = 'shinnoki-s4-bondi-oak'; // brand: Shinnoki, tier: veneer
const PAINTED  = 'pure-white';

// Always reset to defaults so tests don't leak state.
afterEach(() => applyCompatibilityOverrides({}));

describe('runtime overrides — tier rules', () => {
  it('default: melamine blocks shaker', () => {
    expect(checkCompatibility('shaker', MELAMINE).ok).toBe(false);
  });

  it('admin can widen a tier (melamine → allow shaker)', () => {
    applyCompatibilityOverrides({
      tiers: { melamine: ['flat-panel', 'shaker'] },
    });
    expect(checkCompatibility('shaker', MELAMINE).ok).toBe(true);
    expect(checkCompatibility('flat-panel', MELAMINE).ok).toBe(true);
    // Other doors still blocked
    expect(checkCompatibility('raised-panel', MELAMINE).ok).toBe(false);
  });

  it('admin can narrow a tier (painted → flat-panel only)', () => {
    applyCompatibilityOverrides({
      tiers: { painted: ['flat-panel'] },
    });
    expect(checkCompatibility('flat-panel', PAINTED).ok).toBe(true);
    expect(checkCompatibility('shaker', PAINTED).ok).toBe(false);
  });

  it('reset (empty overrides) restores defaults', () => {
    applyCompatibilityOverrides({ tiers: { melamine: ALL() } });
    expect(checkCompatibility('shaker', MELAMINE).ok).toBe(true);
    applyCompatibilityOverrides({});
    expect(checkCompatibility('shaker', MELAMINE).ok).toBe(false);
    expect(checkCompatibility('flat-panel', MELAMINE).ok).toBe(true);
  });
});

describe('runtime overrides — brand rules', () => {
  it('brand override widens a single supplier beyond its tier', () => {
    // Tafisa (melamine tier) → also allow shaker, leave Egger (same tier) blocked
    applyCompatibilityOverrides({
      brands: { Tafisa: ['flat-panel', 'shaker'] },
    });
    expect(checkCompatibility('shaker', MELAMINE).ok).toBe(true);
    expect(allowedDoorStylesForFinish(MELAMINE).sort())
      .toEqual(['flat-panel', 'shaker'].sort());
  });

  it('brand override narrows a supplier below its tier', () => {
    applyCompatibilityOverrides({
      brands: { Shinnoki: [] }, // empty array = ignored (treated as no override)
    });
    // Empty array is dropped — falls back to tier rule (flat-panel)
    expect(allowedDoorStylesForFinish(VENEER)).toEqual(['flat-panel']);

    applyCompatibilityOverrides({
      brands: { Shinnoki: ['flat-panel', 'shaker'] },
    });
    expect(checkCompatibility('shaker', VENEER).ok).toBe(true);
  });

  it('brand override takes precedence over tier override', () => {
    applyCompatibilityOverrides({
      tiers: { melamine: ['flat-panel'] },          // tier: slab only
      brands: { Tafisa: ['flat-panel', 'shaker'] }, // brand: also shaker
    });
    expect(checkCompatibility('shaker', MELAMINE).ok).toBe(true);
  });
});

describe('getEffectiveCompatibilityRules', () => {
  it('reflects current overrides and exposes defaults', () => {
    applyCompatibilityOverrides({
      tiers: { hpl: ['flat-panel', 'slim-shaker'] },
      brands: { Wilsonart: ['flat-panel', 'slim-shaker', 'shaker'] },
    });
    const rules = getEffectiveCompatibilityRules();
    expect(rules.tiers.hpl).toEqual(['flat-panel', 'slim-shaker']);
    expect(rules.brands.Wilsonart).toEqual(['flat-panel', 'slim-shaker', 'shaker']);
    // Defaults remain untouched
    expect(rules.defaults.hpl).toEqual(['flat-panel']);
  });
});

function ALL() {
  return ['shaker', 'slim-shaker', 'flat-panel', 'raised-panel'] as const as unknown as
    ('shaker' | 'slim-shaker' | 'flat-panel' | 'raised-panel')[];
}
