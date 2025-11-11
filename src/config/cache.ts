/**
 * Cache Configuration
 * Centralized cache-related settings with environment variable support
 */

export const CACHE_CONFIG = {
  /**
   * Product cache duration (default: 5 minutes)
   * Can be overridden via VITE_PRODUCT_CACHE_DURATION environment variable (in milliseconds)
   */
  PRODUCT_CACHE_DURATION: Number(import.meta.env.VITE_PRODUCT_CACHE_DURATION) || 5 * 60 * 1000,

  /**
   * Number of products to prefetch on app load (default: 20)
   * Can be overridden via VITE_PRELOAD_COUNT environment variable
   */
  PRELOAD_COUNT: Number(import.meta.env.VITE_PRELOAD_COUNT) || 20,

  /**
   * Auto-refresh interval for preloaded products (default: 30 minutes)
   * Can be overridden via VITE_PRELOAD_INTERVAL environment variable (in milliseconds)
   */
  PRELOAD_REFRESH_INTERVAL: Number(import.meta.env.VITE_PRELOAD_INTERVAL) || 30 * 60 * 1000,

  /**
   * Maximum products that can be prefetched (safety limit)
   */
  MAX_PRELOAD_COUNT: 50,

  /**
   * Minimum refresh interval (5 minutes)
   */
  MIN_REFRESH_INTERVAL: 5 * 60 * 1000,
} as const;

/**
 * Validate and clamp prefetch count
 */
export function validatePrefetchCount(count: number): number {
  return Math.min(Math.max(1, count), CACHE_CONFIG.MAX_PRELOAD_COUNT);
}

/**
 * Validate and clamp refresh interval
 */
export function validateRefreshInterval(interval: number): number {
  return Math.max(interval, CACHE_CONFIG.MIN_REFRESH_INTERVAL);
}
