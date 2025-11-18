/**
 * Centralized Configuration
 * Barrel export for all application configuration modules
 */

export * from './cache';
export * from './security';
export * from './performance';
export * from './pwa';
export * from './validation';
export * from './presets';

/**
 * Application-wide configuration
 */
export const APP_CONFIG = {
  /**
   * Application name
   */
  APP_NAME: 'Green Cabinets Designer',

  /**
   * Application version
   */
  APP_VERSION: '1.0.0',

  /**
   * Environment
   */
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,

  /**
   * API URLs
   */
  API: {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  },

  /**
   * Feature flags
   */
  FEATURES: {
    /**
     * Enable/disable product preloading
     */
    ENABLE_PRODUCT_PRELOAD: import.meta.env.VITE_ENABLE_PRELOAD !== 'false',

    /**
     * Enable/disable offline mode
     */
    ENABLE_OFFLINE_MODE: import.meta.env.VITE_ENABLE_OFFLINE !== 'false',

    /**
     * Enable/disable analytics
     */
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',

    /**
     * Enable/disable error tracking (Sentry)
     */
    ENABLE_ERROR_TRACKING: import.meta.env.PROD,
  },
} as const;
