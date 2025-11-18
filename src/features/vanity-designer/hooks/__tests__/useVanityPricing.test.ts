import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVanityPricing } from '../useVanityPricing';

describe('useVanityPricing', () => {
  it('calculates pricing correctly for basic vanity', () => {
    const { result } = renderHook(() => useVanityPricing({
      width: 48,
      height: 36,
      depth: 21,
      brand: 'blum',
      finish: 'natural-oak',
      doorStyle: 'shaker',
      numDrawers: 3,
      handleStyle: 'bar',
      includeRoom: false,
      roomLength: 0,
      roomWidth: 0,
      floorTileStyle: '',
    }));

    expect(result.current.basePrice).toBeGreaterThan(0);
    expect(result.current.totalPrice).toBeGreaterThan(result.current.basePrice);
    expect(result.current.tax).toBeGreaterThan(0);
    expect(result.current.shipping).toBeGreaterThan(0);
  });

  it('updates pricing when dimensions change', () => {
    const { result, rerender } = renderHook(
      ({ width }) => useVanityPricing({
        width,
        height: 36,
        depth: 21,
        brand: 'blum',
        finish: 'natural-oak',
        doorStyle: 'shaker',
        numDrawers: 3,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      }),
      { initialProps: { width: 48 } }
    );

    const initialPrice = result.current.basePrice;

    rerender({ width: 60 });

    expect(result.current.basePrice).toBeGreaterThan(initialPrice);
  });

  it('updates pricing when brand changes', () => {
    const { result, rerender } = renderHook(
      ({ brand }) => useVanityPricing({
        width: 48,
        height: 36,
        depth: 21,
        brand,
        finish: 'natural-oak',
        doorStyle: 'shaker',
        numDrawers: 3,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      }),
      { initialProps: { brand: 'blum' as const } }
    );

    const blumPrice = result.current.basePrice;

    rerender({ brand: 'hafele' as const });

    expect(result.current.basePrice).toBeGreaterThan(blumPrice);
  });

  it('includes room pricing when enabled', () => {
    const { result } = renderHook(() => useVanityPricing({
      width: 48,
      height: 36,
      depth: 21,
      brand: 'blum',
      finish: 'natural-oak',
      doorStyle: 'shaker',
      numDrawers: 3,
      handleStyle: 'bar',
      includeRoom: true,
      roomLength: 120,
      roomWidth: 96,
      floorTileStyle: 'white-marble',
    }));

    expect(result.current.wallPrice).toBeGreaterThan(0);
    expect(result.current.floorPrice).toBeGreaterThan(0);
    expect(result.current.subtotal).toBeGreaterThan(result.current.basePrice);
  });

  it('returns consistent pricing for same inputs', () => {
    const props = {
      width: 48,
      height: 36,
      depth: 21,
      brand: 'blum' as const,
      finish: 'natural-oak',
      doorStyle: 'shaker',
      numDrawers: 3,
      handleStyle: 'bar',
      includeRoom: false,
      roomLength: 0,
      roomWidth: 0,
      floorTileStyle: '',
    };

    const { result: result1 } = renderHook(() => useVanityPricing(props));
    const { result: result2 } = renderHook(() => useVanityPricing(props));

    expect(result1.current.basePrice).toBe(result2.current.basePrice);
    expect(result1.current.totalPrice).toBe(result2.current.totalPrice);
  });

  it('handles zero drawer count', () => {
    const { result } = renderHook(() => useVanityPricing({
      width: 48,
      height: 36,
      depth: 21,
      brand: 'blum',
      finish: 'natural-oak',
      doorStyle: 'shaker',
      numDrawers: 0,
      handleStyle: 'bar',
      includeRoom: false,
      roomLength: 0,
      roomWidth: 0,
      floorTileStyle: '',
    }));

    expect(result.current.basePrice).toBeGreaterThan(0);
  });

  it('memoizes pricing result when inputs do not change', () => {
    const { result, rerender } = renderHook(() => useVanityPricing({
      width: 48,
      height: 36,
      depth: 21,
      brand: 'blum',
      finish: 'natural-oak',
      doorStyle: 'shaker',
      numDrawers: 3,
      handleStyle: 'bar',
      includeRoom: false,
      roomLength: 0,
      roomWidth: 0,
      floorTileStyle: '',
    }));

    const firstResult = result.current;
    
    rerender();

    expect(result.current).toBe(firstResult); // Same reference due to useMemo
  });
});
