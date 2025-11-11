/**
 * PWA & Service Worker Configuration
 * Settings for offline capabilities and caching strategies
 */

export const PWA_CONFIG = {
  /**
   * Service Worker caching settings
   */
  CACHE: {
    /**
     * Shopify API cache duration (default: 24 hours in seconds)
     */
    SHOPIFY_API_MAX_AGE_SECONDS: 60 * 60 * 24,

    /**
     * Shopify images cache duration (default: 30 days in seconds)
     */
    SHOPIFY_IMAGES_MAX_AGE_SECONDS: 60 * 60 * 24 * 30,

    /**
     * Maximum number of cached API entries
     */
    SHOPIFY_API_MAX_ENTRIES: 50,

    /**
     * Maximum number of cached image entries
     */
    SHOPIFY_IMAGES_MAX_ENTRIES: 100,
  },

  /**
   * Network strategy settings
   */
  NETWORK: {
    /**
     * Network timeout for NetworkFirst strategy (default: 10 seconds)
     */
    TIMEOUT_SECONDS: 10,

    /**
     * Retry attempts for failed requests
     */
    MAX_RETRY_ATTEMPTS: 3,
  },

  /**
   * Manifest settings
   */
  MANIFEST: {
    NAME: 'Green Cabinets - Custom Cabinetry NYC',
    SHORT_NAME: 'Green Cabinets',
    DESCRIPTION: 'Premium custom cabinetry for kitchens, bathrooms, and closets in Brooklyn, NYC since 2009',
    THEME_COLOR: '#1e7b5f',
    BACKGROUND_COLOR: '#030303',
  },

  /**
   * Update settings
   */
  UPDATE: {
    /**
     * Check for updates interval (default: 1 hour)
     */
    CHECK_INTERVAL_MS: 60 * 60 * 1000,

    /**
     * Auto-update on app activation
     */
    AUTO_UPDATE: true,
  },
} as const;

/**
 * Get cache name for a specific type
 */
export function getCacheName(type: 'api' | 'images' | 'static'): string {
  const prefix = 'green-cabinets';
  return `${prefix}-${type}-cache`;
}

/**
 * Convert seconds to milliseconds for Service Worker config
 */
export function cacheSecondsToMs(seconds: number): number {
  return seconds * 1000;
}
