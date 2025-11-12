/**
 * Vanity Configuration Service
 * Business logic for vanity configuration operations
 */

import { logger } from '@/lib/logger';

export interface ScannedMeasurements {
  measurements: {
    width: number;
    height: number;
    depth: number;
  };
  roomName: string;
}

export interface VanityTemplate {
  brand: string;
  finish: string;
  width: string;
  widthFraction: string;
  height: string;
  heightFraction: string;
  depth: string;
  depthFraction: string;
  doorStyle: string;
  numDrawers: number;
  handleStyle: string;
  cabinetPosition?: string;
}

/**
 * Convert scanned measurements from meters to inches
 */
export function convertScannedMeasurements(scan: ScannedMeasurements): {
  width: string;
  height: string;
  depth: string;
} {
  // Convert meters to inches (1 meter = 39.3701 inches)
  const widthInches = Math.round(scan.measurements.width * 39.3701);
  const heightInches = Math.round(scan.measurements.height * 39.3701);
  const depthInches = Math.round(scan.measurements.depth * 39.3701);

  return {
    width: Math.floor(widthInches).toString(),
    height: Math.floor(heightInches).toString(),
    depth: Math.floor(depthInches).toString(),
  };
}

/**
 * Load scanned measurements from storage
 */
export function loadScannedMeasurementsFromStorage(): ScannedMeasurements | null {
  try {
    // Check sessionStorage first (from recent scan)
    const currentScanStr = sessionStorage.getItem('current_scan');
    if (currentScanStr) {
      return JSON.parse(currentScanStr);
    }

    // Check localStorage for saved scans
    const savedScansStr = localStorage.getItem('room_scans');
    if (savedScansStr) {
      const scans = JSON.parse(savedScansStr);
      if (Array.isArray(scans) && scans.length > 0) {
        return scans[scans.length - 1];
      }
    }

    return null;
  } catch (error) {
    logger.error('Failed to load scanned measurements from storage', error, {
      component: 'vanityConfigService',
    });
    return null;
  }
}

/**
 * Parse shared configuration from URL
 */
export function parseSharedConfigFromURL(): Partial<VanityTemplate> | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const configParam = params.get('config');
    
    if (!configParam) return null;

    const decoded = atob(configParam);
    const config = JSON.parse(decoded);
    
    return config;
  } catch (error) {
    logger.error('Failed to parse shared configuration from URL', error, {
      component: 'vanityConfigService',
    });
    return null;
  }
}

/**
 * Validate dimension value
 */
export function validateDimension(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 999;
}

/**
 * Validate fraction value (0-15 sixteenths)
 */
export function validateFraction(value: string): boolean {
  const num = parseInt(value);
  return !isNaN(num) && num >= 0 && num <= 15;
}

/**
 * Validate ZIP code format
 */
export function validateZipCode(zipCode: string): boolean {
  return /^\d{5}$/.test(zipCode);
}

/**
 * Format measurement display string
 */
export function formatMeasurementDisplay(
  width: number,
  depth: number,
  height: number
): string {
  return `${width}" W × ${depth}" D × ${height}" H`;
}
