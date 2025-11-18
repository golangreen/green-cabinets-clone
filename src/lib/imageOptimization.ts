/**
 * Image Optimization Utilities
 * Provides utilities for efficient image loading and performance optimization
 */

import { logger } from './logger';

/**
 * Preload images for faster rendering
 * Uses <link rel="preload"> for critical images
 */
export const preloadImage = (src: string, priority: 'high' | 'low' = 'low'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.fetchPriority = priority;
    
    link.onload = () => {
      logger.debug('Image preloaded', { src, priority });
      resolve();
    };
    
    link.onerror = () => {
      logger.error('Failed to preload image', { src, priority });
      reject(new Error(`Failed to preload image: ${src}`));
    };
    
    document.head.appendChild(link);
  });
};

/**
 * Preload multiple images in priority order
 */
export const preloadImages = async (
  images: Array<{ src: string; priority?: 'high' | 'low' }>,
  maxConcurrent = 3
): Promise<void> => {
  const queue = [...images];
  const loading: Promise<void>[] = [];

  while (queue.length > 0 || loading.length > 0) {
    // Load images up to maxConcurrent limit
    while (loading.length < maxConcurrent && queue.length > 0) {
      const image = queue.shift();
      if (image) {
        const promise = preloadImage(image.src, image.priority).catch(() => {
          // Continue even if one image fails
        });
        loading.push(promise);
      }
    }

    // Wait for one to complete before continuing
    if (loading.length > 0) {
      await Promise.race(loading);
      // Remove completed promises
      const completed = loading.filter(p => {
        return Promise.race([p, Promise.resolve()]).then(() => true);
      });
      loading.splice(0, loading.length, ...completed);
    }
  }
};

/**
 * Generate a tiny blur placeholder data URL
 * This creates a 10x10 pixel solid color placeholder
 */
export const generateBlurPlaceholder = (color = '#e5e7eb'): string => {
  // Create a tiny 10x10 canvas
  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Fill with the color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 10, 10);
  
  // Convert to data URL
  return canvas.toDataURL('image/jpeg', 0.1);
};

/**
 * Check if an image is in viewport or near it
 */
export const isImageNearViewport = (element: HTMLElement, threshold = 200): boolean => {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  
  return (
    rect.top < viewportHeight + threshold &&
    rect.bottom > -threshold
  );
};

/**
 * Get optimal IntersectionObserver config based on device
 */
export const getOptimalObserverConfig = (): IntersectionObserverInit => {
  // Check if device has limited memory or slow connection
  const connection = (navigator as any).connection;
  const isSlowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
  const hasLimitedMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
  
  if (isSlowConnection || hasLimitedMemory) {
    // More conservative loading on slow devices
    return {
      rootMargin: '100px',
      threshold: 0.01,
    };
  }
  
  // Aggressive preloading on fast devices
  return {
    rootMargin: '300px',
    threshold: 0.01,
  };
};

/**
 * Decode image before rendering to avoid blocking main thread
 */
export const decodeImage = async (img: HTMLImageElement): Promise<void> => {
  if ('decode' in img) {
    try {
      await img.decode();
      logger.debug('Image decoded', { src: img.src });
    } catch (error) {
      logger.error('Failed to decode image', { src: img.src, error });
    }
  }
};
