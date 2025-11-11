/**
 * Performance Configuration
 * Centralized performance-related settings (timeouts, intervals, delays)
 */

export const PERFORMANCE_CONFIG = {
  /**
   * Network request timeout (default: 10 seconds)
   * Can be overridden via VITE_NETWORK_TIMEOUT environment variable (in milliseconds)
   */
  NETWORK_TIMEOUT: Number(import.meta.env.VITE_NETWORK_TIMEOUT) || 10 * 1000,

  /**
   * Debounce delay for search inputs (default: 300ms)
   * Can be overridden via VITE_SEARCH_DEBOUNCE environment variable
   */
  SEARCH_DEBOUNCE_MS: Number(import.meta.env.VITE_SEARCH_DEBOUNCE) || 300,

  /**
   * Toast notification duration (default: 2 seconds)
   */
  TOAST_DURATION_MS: 2000,

  /**
   * Splash screen display duration (default: 2 seconds)
   */
  SPLASH_SCREEN_DURATION_MS: 2000,

  /**
   * Fade animation duration (default: 300ms)
   */
  FADE_ANIMATION_DURATION_MS: 300,

  /**
   * Auto-refresh intervals
   */
  AUTO_REFRESH: {
    /**
     * Stats auto-refresh interval (default: 5 minutes)
     */
    STATS_INTERVAL_MS: 5 * 60 * 1000,

    /**
     * Realtime connection retry interval (default: 30 seconds)
     */
    REALTIME_RETRY_MS: 30 * 1000,
  },

  /**
   * Animation delays
   */
  ANIMATIONS: {
    /**
     * Hero carousel slide duration (default: 8 seconds)
     */
    CAROUSEL_DURATION_MS: 8000,

    /**
     * Banner auto-hide delay (default: 3 seconds)
     */
    BANNER_AUTO_HIDE_MS: 3000,
  },
} as const;

/**
 * Convert milliseconds to seconds
 */
export function msToSeconds(ms: number): number {
  return Math.round(ms / 1000);
}

/**
 * Convert seconds to milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Convert minutes to milliseconds
 */
export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

/**
 * Convert hours to milliseconds
 */
export function hoursToMs(hours: number): number {
  return hours * 60 * 60 * 1000;
}

/**
 * Convert days to milliseconds
 */
export function daysToMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}
