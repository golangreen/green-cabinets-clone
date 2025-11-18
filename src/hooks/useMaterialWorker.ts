import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/logger';

interface MaterialProps {
  color: string;
  roughness: number;
  metalness: number;
  bumpScale: number;
  type: 'wood' | 'metallic' | 'painted';
}

let workerInstance: Worker | null = null;
let workerRefCount = 0;

export const useMaterialWorker = () => {
  const pendingRequests = useRef(new Map<string, (value: any) => void>());

  useEffect(() => {
    // Create worker on first mount
    if (!workerInstance && typeof Worker !== 'undefined') {
      try {
        workerInstance = new Worker(
          new URL('../workers/materialCalculations.worker.ts', import.meta.url),
          { type: 'module' }
        );

        workerInstance.onmessage = (e: MessageEvent) => {
          const { type, payload, id } = e.data;
          const resolver = pendingRequests.current.get(id);
          
          if (resolver) {
            if (type === 'ERROR') {
              logger.error('Worker error', payload.message);
              resolver(null);
            } else {
              resolver(payload);
            }
            pendingRequests.current.delete(id);
          }
        };

        workerInstance.onerror = (error) => {
          logger.error('Worker error', error);
        };

        logger.info('Material worker initialized');
      } catch (error) {
        logger.error('Failed to initialize worker', error);
      }
    }

    workerRefCount++;

    return () => {
      workerRefCount--;
      // Terminate worker when no components are using it
      if (workerRefCount === 0 && workerInstance) {
        workerInstance.terminate();
        workerInstance = null;
        logger.info('Material worker terminated');
      }
    };
  }, []);

  const calculateMaterialProps = useCallback(
    (brand: string, finish: string): Promise<MaterialProps | null> => {
      return new Promise((resolve) => {
        if (!workerInstance) {
          // Fallback to main thread if worker unavailable
          import('@/features/vanity-designer/components/3d/MaterialUtils').then(
            ({ getMaterialProps }) => {
              resolve(getMaterialProps(brand, finish));
            }
          );
          return;
        }

        const id = `material-${Date.now()}-${Math.random()}`;
        pendingRequests.current.set(id, resolve);

        workerInstance.postMessage({
          type: 'CALCULATE_MATERIAL_PROPS',
          payload: { brand, finish },
          id,
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          if (pendingRequests.current.has(id)) {
            pendingRequests.current.delete(id);
            resolve(null);
          }
        }, 5000);
      });
    },
    []
  );

  return { calculateMaterialProps };
};
