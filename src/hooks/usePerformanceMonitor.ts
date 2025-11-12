/**
 * Performance Monitor Hook
 * Wraps components with automatic performance tracking
 */

import { useEffect, useRef } from 'react';
import { markPerformance, measurePerformance } from '@/lib/performance';
import { logger } from '@/lib/logger';

interface UsePerformanceMonitorOptions {
  /**
   * Name of the component/operation being monitored
   */
  name: string;

  /**
   * Additional metadata to track
   */
  metadata?: Record<string, any>;

  /**
   * Whether to track render time
   */
  trackRender?: boolean;

  /**
   * Whether to track mount time
   */
  trackMount?: boolean;
}

/**
 * Hook to automatically monitor component performance
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   usePerformanceMonitor({
 *     name: 'MyComponent',
 *     trackRender: true,
 *     trackMount: true,
 *   });
 * 
 *   return <div>Content</div>;
 * }
 * ```
 */
export function usePerformanceMonitor({
  name,
  metadata,
  trackRender = false,
  trackMount = true,
}: UsePerformanceMonitorOptions) {
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  // Track mount time
  useEffect(() => {
    if (trackMount) {
      const mountMark = `${name}-mount`;
      markPerformance(mountMark, { ...metadata, type: 'mount' });
      mountTimeRef.current = performance.now();

      return () => {
        const unmountTime = performance.now();
        const totalMountedTime = unmountTime - mountTimeRef.current;
        
        logger.info('Component unmounted', {
          name,
          totalMountedTime,
          renderCount: renderCountRef.current,
          metadata,
        });
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Track render time
  useEffect(() => {
    if (trackRender) {
      const renderTime = performance.now();
      renderCountRef.current += 1;

      if (lastRenderTimeRef.current > 0) {
        const timeSinceLastRender = renderTime - lastRenderTimeRef.current;
        
        if (timeSinceLastRender > 16) { // More than one frame (60fps = ~16ms)
          logger.warn('Slow render detected', {
            name,
            timeSinceLastRender,
            renderCount: renderCountRef.current,
            metadata,
          });
        }
      }

      lastRenderTimeRef.current = renderTime;
    }
  });

  return {
    markStart: (operationName: string) => {
      return markPerformance(`${name}-${operationName}`, {
        ...metadata,
        component: name,
      });
    },
    measureOperation: (operationName: string, startMark: string) => {
      return measurePerformance(
        `${name}-${operationName}`,
        startMark,
        undefined,
        {
          ...metadata,
          component: name,
        }
      );
    },
  };
}
