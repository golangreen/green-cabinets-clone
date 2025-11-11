/**
 * Product Preload Configuration
 * Re-exports centralized cache configuration for backward compatibility
 * @deprecated Use @/config directly instead
 */

import { 
  CACHE_CONFIG, 
  validatePrefetchCount, 
  validateRefreshInterval 
} from '@/config';

/**
 * @deprecated Use CACHE_CONFIG from @/config instead
 */
export const PRELOAD_CONFIG = {
  DEFAULT_PREFETCH_COUNT: CACHE_CONFIG.PRELOAD_COUNT,
  DEFAULT_AUTO_REFRESH_INTERVAL: CACHE_CONFIG.PRELOAD_REFRESH_INTERVAL,
  MAX_PREFETCH_COUNT: CACHE_CONFIG.MAX_PRELOAD_COUNT,
  MIN_REFRESH_INTERVAL: CACHE_CONFIG.MIN_REFRESH_INTERVAL,
} as const;

// Re-export validation functions
export { validatePrefetchCount, validateRefreshInterval };
