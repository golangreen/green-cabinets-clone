import { describe, it, expect } from 'vitest';
import { calculateVanityPrice, calculateTilePrice, calculateWoodFloorPrice } from '../vanityPricingService';

describe('vanityPricingService', () => {
  describe('calculateVanityPrice', () => {
    it('calculates base price correctly for standard dimensions', () => {
      const result = calculateVanityPrice({
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
      });

      expect(result.basePrice).toBeGreaterThan(0);
      expect(result.wallPrice).toBe(0);
      expect(result.floorPrice).toBe(0);
      expect(result.subtotal).toBe(result.basePrice);
    });

    it('applies brand premium for hafele', () => {
      const blumPrice = calculateVanityPrice({
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
      });

      const hafelePrice = calculateVanityPrice({
        width: 48,
        height: 36,
        depth: 21,
        brand: 'hafele',
        finish: 'natural-oak',
        doorStyle: 'shaker',
        numDrawers: 3,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      });

      expect(hafelePrice.basePrice).toBeGreaterThan(blumPrice.basePrice);
    });

    it('applies finish premium for walnut', () => {
      const oakPrice = calculateVanityPrice({
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
      });

      const walnutPrice = calculateVanityPrice({
        width: 48,
        height: 36,
        depth: 21,
        brand: 'blum',
        finish: 'walnut',
        doorStyle: 'shaker',
        numDrawers: 3,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      });

      expect(walnutPrice.basePrice).toBeGreaterThan(oakPrice.basePrice);
    });

    it('scales price with dimensions', () => {
      const smallVanity = calculateVanityPrice({
        width: 36,
        height: 30,
        depth: 18,
        brand: 'blum',
        finish: 'natural-oak',
        doorStyle: 'shaker',
        numDrawers: 2,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      });

      const largeVanity = calculateVanityPrice({
        width: 60,
        height: 36,
        depth: 24,
        brand: 'blum',
        finish: 'natural-oak',
        doorStyle: 'shaker',
        numDrawers: 4,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      });

      expect(largeVanity.basePrice).toBeGreaterThan(smallVanity.basePrice);
    });

    it('adds drawer cost correctly', () => {
      const twoDrawers = calculateVanityPrice({
        width: 48,
        height: 36,
        depth: 21,
        brand: 'blum',
        finish: 'natural-oak',
        doorStyle: 'shaker',
        numDrawers: 2,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      });

      const fourDrawers = calculateVanityPrice({
        width: 48,
        height: 36,
        depth: 21,
        brand: 'blum',
        finish: 'natural-oak',
        doorStyle: 'shaker',
        numDrawers: 4,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      });

      expect(fourDrawers.basePrice).toBeGreaterThan(twoDrawers.basePrice);
    });

    it('calculates room pricing when includeRoom is true', () => {
      const withRoom = calculateVanityPrice({
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
      });

      expect(withRoom.wallPrice).toBeGreaterThan(0);
      expect(withRoom.floorPrice).toBeGreaterThan(0);
      expect(withRoom.subtotal).toBeGreaterThan(withRoom.basePrice);
    });

    it('includes tax and shipping in total price', () => {
      const result = calculateVanityPrice({
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
      });

      expect(result.tax).toBeGreaterThan(0);
      expect(result.shipping).toBeGreaterThan(0);
      expect(result.totalPrice).toBe(result.subtotal + result.tax + result.shipping);
    });

    it('returns zero prices for invalid dimensions', () => {
      const result = calculateVanityPrice({
        width: 0,
        height: 0,
        depth: 0,
        brand: 'blum',
        finish: 'natural-oak',
        doorStyle: 'shaker',
        numDrawers: 3,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      });

      expect(result.basePrice).toBe(0);
      expect(result.totalPrice).toBe(0);
    });
  });

  describe('calculateTilePrice', () => {
    it('calculates basic tile price for standard room', () => {
      const price = calculateTilePrice(120, 96, 'white-marble');
      expect(price).toBeGreaterThan(0);
    });

    it('applies premium for natural-stone tiles', () => {
      const marblePrice = calculateTilePrice(120, 96, 'white-marble');
      const stonePrice = calculateTilePrice(120, 96, 'natural-stone');
      expect(stonePrice).toBeGreaterThan(marblePrice);
    });

    it('scales price with room area', () => {
      const smallRoom = calculateTilePrice(96, 72, 'white-marble');
      const largeRoom = calculateTilePrice(144, 120, 'white-marble');
      expect(largeRoom).toBeGreaterThan(smallRoom);
    });

    it('returns zero for invalid dimensions', () => {
      expect(calculateTilePrice(0, 96, 'white-marble')).toBe(0);
      expect(calculateTilePrice(120, 0, 'white-marble')).toBe(0);
      expect(calculateTilePrice(0, 0, 'white-marble')).toBe(0);
    });

    it('calculates correctly for minimum room size', () => {
      const price = calculateTilePrice(60, 60, 'white-marble');
      expect(price).toBeGreaterThan(0);
    });

    it('calculates correctly for large room size', () => {
      const price = calculateTilePrice(240, 180, 'white-marble');
      expect(price).toBeGreaterThan(0);
    });
  });

  describe('calculateWoodFloorPrice', () => {
    it('calculates basic wood floor price', () => {
      const price = calculateWoodFloorPrice(120, 96, 'natural-oak');
      expect(price).toBeGreaterThan(0);
    });

    it('applies premium for exotic wood finishes', () => {
      const oakPrice = calculateWoodFloorPrice(120, 96, 'natural-oak');
      const walnutPrice = calculateWoodFloorPrice(120, 96, 'walnut');
      expect(walnutPrice).toBeGreaterThan(oakPrice);
    });

    it('scales price with room area', () => {
      const smallRoom = calculateWoodFloorPrice(96, 72, 'natural-oak');
      const largeRoom = calculateWoodFloorPrice(144, 120, 'natural-oak');
      expect(largeRoom).toBeGreaterThan(smallRoom);
    });

    it('returns zero for invalid dimensions', () => {
      expect(calculateWoodFloorPrice(0, 96, 'natural-oak')).toBe(0);
      expect(calculateWoodFloorPrice(120, 0, 'natural-oak')).toBe(0);
      expect(calculateWoodFloorPrice(0, 0, 'natural-oak')).toBe(0);
    });

    it('handles various wood finish types', () => {
      const finishes = ['natural-oak', 'walnut', 'maple', 'cherry'];
      
      finishes.forEach(finish => {
        const price = calculateWoodFloorPrice(120, 96, finish);
        expect(price).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles minimum vanity dimensions', () => {
      const result = calculateVanityPrice({
        width: 24,
        height: 24,
        depth: 15,
        brand: 'blum',
        finish: 'natural-oak',
        doorStyle: 'shaker',
        numDrawers: 1,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      });

      expect(result.basePrice).toBeGreaterThan(0);
    });

    it('handles maximum vanity dimensions', () => {
      const result = calculateVanityPrice({
        width: 96,
        height: 48,
        depth: 30,
        brand: 'hafele',
        finish: 'walnut',
        doorStyle: 'shaker',
        numDrawers: 6,
        handleStyle: 'bar',
        includeRoom: false,
        roomLength: 0,
        roomWidth: 0,
        floorTileStyle: '',
      });

      expect(result.basePrice).toBeGreaterThan(0);
    });

    it('handles all drawer counts from 0 to 6', () => {
      for (let drawers = 0; drawers <= 6; drawers++) {
        const result = calculateVanityPrice({
          width: 48,
          height: 36,
          depth: 21,
          brand: 'blum',
          finish: 'natural-oak',
          doorStyle: 'shaker',
          numDrawers: drawers,
          handleStyle: 'bar',
          includeRoom: false,
          roomLength: 0,
          roomWidth: 0,
          floorTileStyle: '',
        });

        expect(result.basePrice).toBeGreaterThan(0);
      }
    });

    it('handles room without floor pricing when includeRoom but no floorTileStyle', () => {
      const result = calculateVanityPrice({
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
        floorTileStyle: '',
      });

      expect(result.wallPrice).toBeGreaterThan(0);
      expect(result.floorPrice).toBe(0);
    });
  });
});
