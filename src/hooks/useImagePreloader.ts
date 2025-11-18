/**
 * Image Preloader Hook
 * Preloads priority images for faster rendering
 */

import { useEffect } from 'react';
import { preloadImages } from '@/lib/imageOptimization';
import { logger } from '@/lib/logger';

interface ImageToPreload {
  src: string;
  priority?: 'high' | 'low';
}

interface UseImagePreloaderOptions {
  /**
   * Images to preload
   */
  images: ImageToPreload[];
  
  /**
   * Whether to enable preloading
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Maximum number of images to preload concurrently
   * @default 3
   */
  maxConcurrent?: number;
  
  /**
   * Delay before starting preload (ms)
   * Useful to avoid competing with critical resources
   * @default 100
   */
  delay?: number;
}

/**
 * Hook to preload images for better performance
 * 
 * @example
 * ```tsx
 * useImagePreloader({
 *   images: galleryImages.slice(0, 6).map(img => ({ 
 *     src: img.path, 
 *     priority: 'high' 
 *   })),
 * });
 * ```
 */
export const useImagePreloader = ({
  images,
  enabled = true,
  maxConcurrent = 3,
  delay = 100,
}: UseImagePreloaderOptions): void => {
  useEffect(() => {
    if (!enabled || images.length === 0) return;

    const timeoutId = setTimeout(() => {
      logger.info('Starting image preload', { 
        count: images.length, 
        maxConcurrent 
      });

      preloadImages(images, maxConcurrent)
        .then(() => {
          logger.info('Image preload completed', { 
            count: images.length 
          });
        })
        .catch((error) => {
          logger.error('Image preload failed', { error });
        });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [images, enabled, maxConcurrent, delay]);
};
