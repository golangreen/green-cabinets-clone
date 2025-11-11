/**
 * Product Preloader Hook
 * Background fetching and caching of Shopify products
 */

import { useEffect, useRef } from 'react';
import { fetchProducts } from '@/lib/shopify/client';
import { useProductCacheStore } from '../stores/productCacheStore';
import { logger } from '@/lib/logger';
import { PRELOAD_CONFIG, validatePrefetchCount, validateRefreshInterval } from '../config/preloadConfig';

interface UseProductPreloaderOptions {
  /**
   * Number of products to prefetch (default: 20)
   */
  prefetchCount?: number;

  /**
   * Auto-refresh interval in milliseconds (default: 30 minutes)
   * Set to 0 to disable auto-refresh
   */
  autoRefreshInterval?: number;

  /**
   * Enable/disable preloading (default: true)
   */
  enabled?: boolean;
}

/**
 * Hook to preload and cache Shopify products in the background
 * 
 * @example
 * ```tsx
 * // In a component
 * useProductPreloader({
 *   prefetchCount: 20,
 *   autoRefreshInterval: 30 * 60 * 1000, // 30 minutes
 * });
 * ```
 */
export function useProductPreloader(options: UseProductPreloaderOptions = {}) {
  const {
    prefetchCount = PRELOAD_CONFIG.DEFAULT_PREFETCH_COUNT,
    autoRefreshInterval = PRELOAD_CONFIG.DEFAULT_AUTO_REFRESH_INTERVAL,
    enabled = true,
  } = options;

  const { setProducts, setLoading, isCacheValid } = useProductCacheStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPreloadingRef = useRef(false);

  // Validate configuration
  const validatedCount = validatePrefetchCount(prefetchCount);
  const validatedInterval = validateRefreshInterval(autoRefreshInterval);

  const preloadProducts = async (force = false) => {
    // Skip if already preloading
    if (isPreloadingRef.current) {
      logger.info('Preload already in progress, skipping', { component: 'ProductPreloader' });
      return;
    }

    // Skip if cache is valid and not forced
    if (!force && isCacheValid()) {
      logger.info('Cache is valid, skipping preload', { component: 'ProductPreloader' });
      return;
    }

    // Skip during SSR
    if (typeof window === 'undefined') {
      return;
    }

    isPreloadingRef.current = true;
    setLoading(true);

    try {
      logger.info('Starting product preload', {
        component: 'ProductPreloader',
        count: validatedCount,
        force,
      });

      const products = await fetchProducts(validatedCount);

      if (products.length > 0) {
        setProducts(products);
        logger.info('Products preloaded successfully', {
          component: 'ProductPreloader',
          count: products.length,
        });
      } else {
        logger.warn('No products returned from preload', { component: 'ProductPreloader' });
      }
    } catch (error) {
      logger.error('Product preload failed', {
        component: 'ProductPreloader',
        error,
      });
      // Don't throw - preload failures should be silent
    } finally {
      setLoading(false);
      isPreloadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!enabled) {
      logger.info('Product preloader disabled', { component: 'ProductPreloader' });
      return;
    }

    // Initial preload
    preloadProducts();

    // Setup auto-refresh if enabled
    if (validatedInterval > 0) {
      logger.info('Setting up auto-refresh', {
        component: 'ProductPreloader',
        intervalMs: validatedInterval,
      });

      intervalRef.current = setInterval(() => {
        logger.info('Auto-refresh triggered', { component: 'ProductPreloader' });
        preloadProducts(true);
      }, validatedInterval);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        logger.info('Auto-refresh cleared', { component: 'ProductPreloader' });
      }
    };
  }, [enabled, validatedCount, validatedInterval]);

  return {
    /**
     * Manually trigger a preload (bypasses cache validation)
     */
    refresh: () => preloadProducts(true),
    
    /**
     * Check if preload is currently running
     */
    isPreloading: isPreloadingRef.current,
  };
}
