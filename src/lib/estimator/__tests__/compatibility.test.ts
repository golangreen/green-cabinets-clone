import { describe, it, expect } from 'vitest';
import {
  checkCompatibility,
  isFinishAllowedForDoor,
  allowedDoorStylesForFinish,
  allowedDoorStylesForTier,
  getFinishTier,
} from '../compatibility';
import { getFinishById } from '../finishes-data';

const DOORS = ['shaker', 'slim-shaker', 'flat-panel', 'raised-panel'] as const;

// Representative finish per tier (verified against generated catalog).
const SAMPLES = {
  painted:     'pure-white',          // house painted
  'solid-wood':'walnut',              // house wood tone
  melamine:    'tafisa-muse',         // TFL
  hpl:         'wilsonart-4951-38',   // High-pressure laminate
  veneer:      'shinnoki-s4-bondi-oak',
  stone:       'raphael-montreux',
} as const;

describe('compatibility — tier classification', () => {
  it.each(Object.entries(SAMPLES))('classifies %s sample to correct tier', (tier, id) => {
    const f = getFinishById(id);
    expect(f, `missing fixture finish ${id}`).toBeDefined();
    expect(getFinishTier(f!)).toBe(tier);
  });
});

describe('compatibility — door style rules', () => {
  it('painted house finish works with every door style', () => {
    for (const door of DOORS) {
      expect(checkCompatibility(door, SAMPLES.painted).ok).toBe(true);
    }
  });

  it('solid wood works with every door style', () => {
    for (const door of DOORS) {
      expect(checkCompatibility(door, SAMPLES['solid-wood']).ok).toBe(true);
    }
  });

  for (const tier of ['melamine', 'hpl', 'veneer', 'stone'] as const) {
    describe(`${tier} (slab-only tier)`, () => {
      const id = SAMPLES[tier];

      it('allows flat-panel', () => {
        const r = checkCompatibility('flat-panel', id);
        expect(r.ok).toBe(true);
        expect(r.tier).toBe(tier);
      });

      it.each(['shaker', 'slim-shaker', 'raised-panel'])('blocks %s with tier-aware reason', (door) => {
        const r = checkCompatibility(door, id);
        expect(r.ok).toBe(false);
        expect(r.tier).toBe(tier);
        expect(r.reason).toMatch(/can only be fabricated as/);
        // Reason should name the tier label so the user sees *why*
        expect(r.reason?.toLowerCase()).toMatch(/melamine|laminate|veneer|stone/);
      });
    });
  }
});

describe('compatibility — helpers', () => {
  it('isFinishAllowedForDoor mirrors checkCompatibility', () => {
    const veneer = getFinishById(SAMPLES.veneer)!;
    expect(isFinishAllowedForDoor(veneer, 'flat-panel')).toBe(true);
    expect(isFinishAllowedForDoor(veneer, 'shaker')).toBe(false);
    expect(isFinishAllowedForDoor(veneer, '')).toBe(true); // no door yet → permissive
  });

  it('allowedDoorStylesForFinish returns slab-only list for melamine', () => {
    expect(allowedDoorStylesForFinish(SAMPLES.melamine)).toEqual(['flat-panel']);
  });

  it('allowedDoorStylesForFinish returns all doors for painted', () => {
    expect(allowedDoorStylesForFinish(SAMPLES.painted).sort()).toEqual([...DOORS].sort());
  });

  it('allowedDoorStylesForTier matches per-tier rules', () => {
    expect(allowedDoorStylesForTier('stone')).toEqual(['flat-panel']);
    expect(allowedDoorStylesForTier('painted').sort()).toEqual([...DOORS].sort());
  });
});

describe('compatibility — edge cases', () => {
  it('returns ok when door or finish is empty', () => {
    expect(checkCompatibility('', SAMPLES.melamine).ok).toBe(true);
    expect(checkCompatibility('flat-panel', '').ok).toBe(true);
    expect(checkCompatibility('', '').ok).toBe(true);
  });

  it('returns ok for unknown finish id (fail-open, do not block submit)', () => {
    expect(checkCompatibility('shaker', 'nonexistent-finish-xyz').ok).toBe(true);
  });
});
