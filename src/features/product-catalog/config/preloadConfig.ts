/**
 * Product Preload Configuration
 * Configurable settings for background product caching
 */

export const PRELOAD_CONFIG = {
  /**
   * Number of products to prefetch on app load
   * Can be overridden via VITE_PRELOAD_COUNT environment variable
   */
  DEFAULT_PREFETCH_COUNT: Number(import.meta.env.VITE_PRELOAD_COUNT) || 20,

  /**
   * Auto-refresh interval in milliseconds (default 30 minutes)
   * Can be overridden via VITE_PRELOAD_INTERVAL environment variable
   */
  DEFAULT_AUTO_REFRESH_INTERVAL: Number(import.meta.env.VITE_PRELOAD_INTERVAL) || 30 * 60 * 1000,

  /**
   * Maximum products that can be prefetched (safety limit)
   */
  MAX_PREFETCH_COUNT: 50,

  /**
   * Minimum refresh interval (5 minutes)
   */
  MIN_REFRESH_INTERVAL: 5 * 60 * 1000,
} as const;

/**
 * Validate and clamp prefetch count
 */
export function validatePrefetchCount(count: number): number {
  return Math.min(Math.max(1, count), PRELOAD_CONFIG.MAX_PREFETCH_COUNT);
}

/**
 * Validate and clamp refresh interval
 */
export function validateRefreshInterval(interval: number): number {
  return Math.max(interval, PRELOAD_CONFIG.MIN_REFRESH_INTERVAL);
}
