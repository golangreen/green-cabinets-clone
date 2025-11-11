/**
 * Product Preload Manager
 * Silent background component that handles product preloading
 */

import { useProductPreloader } from '../hooks/useProductPreloader';

interface PreloadManagerProps {
  /**
   * Number of products to prefetch (default: 20)
   */
  prefetchCount?: number;

  /**
   * Auto-refresh interval in milliseconds (default: 30 minutes)
   */
  autoRefreshInterval?: number;

  /**
   * Enable/disable preloading (default: true)
   */
  enabled?: boolean;
}

/**
 * PreloadManager Component
 * 
 * Renders nothing but manages background product preloading.
 * Should be placed at app root level.
 * 
 * @example
 * ```tsx
 * <PreloadManager 
 *   prefetchCount={20}
 *   autoRefreshInterval={30 * 60 * 1000}
 * />
 * ```
 */
export function PreloadManager({
  prefetchCount = 20,
  autoRefreshInterval = 30 * 60 * 1000,
  enabled = true,
}: PreloadManagerProps) {
  useProductPreloader({
    prefetchCount,
    autoRefreshInterval,
    enabled,
  });

  // Render nothing - this is a background manager
  return null;
}
