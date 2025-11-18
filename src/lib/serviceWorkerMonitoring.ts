/**
 * Service Worker Monitoring & Debugging Utilities
 * Tracks SW lifecycle, updates, cache operations, and errors
 */

import { logger } from './logger';

export interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  waiting: boolean;
  updating: boolean;
  controller: boolean;
  registration?: ServiceWorkerRegistration;
  error?: Error;
}

export interface ServiceWorkerUpdate {
  timestamp: string;
  oldVersion?: string;
  newVersion?: string;
  updateFound: boolean;
  activated: boolean;
}

/**
 * Get current Service Worker status
 */
export const getServiceWorkerStatus = async (): Promise<ServiceWorkerStatus> => {
  if (!('serviceWorker' in navigator)) {
    return {
      registered: false,
      active: false,
      waiting: false,
      updating: false,
      controller: false,
      error: new Error('Service Worker not supported'),
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    return {
      registered: !!registration,
      active: !!registration?.active,
      waiting: !!registration?.waiting,
      updating: !!registration?.installing,
      controller: !!navigator.serviceWorker.controller,
      registration,
    };
  } catch (error) {
    logger.error('Failed to get SW status', { error });
    return {
      registered: false,
      active: false,
      waiting: false,
      updating: false,
      controller: false,
      error: error as Error,
    };
  }
};

/**
 * Monitor Service Worker lifecycle events
 */
export const monitorServiceWorker = (): (() => void) => {
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Worker monitoring unavailable - not supported');
    return () => {};
  }

  const handleControllerChange = () => {
    logger.info('Service Worker controller changed', {
      controller: navigator.serviceWorker.controller?.state,
      scriptURL: navigator.serviceWorker.controller?.scriptURL,
    });
    
    // Page will reload automatically due to clientsClaim
    if (navigator.serviceWorker.controller) {
      logger.info('New Service Worker took control');
    }
  };

  const handleMessage = (event: MessageEvent) => {
    logger.info('Service Worker message received', {
      data: event.data,
      origin: event.origin,
    });
  };

  navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
  navigator.serviceWorker.addEventListener('message', handleMessage);

  // Monitor registration updates
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (!registration) return;

    const handleUpdateFound = () => {
      logger.info('Service Worker update found', {
        installing: registration.installing?.state,
        waiting: registration.waiting?.state,
        active: registration.active?.state,
      });

      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          logger.info('Service Worker state changed', {
            state: newWorker.state,
            scriptURL: newWorker.scriptURL,
          });

          if (newWorker.state === 'activated') {
            logger.info('New Service Worker activated successfully');
          }
        });
      }
    };

    registration.addEventListener('updatefound', handleUpdateFound);
  });

  // Cleanup function
  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.removeEventListener('message', handleMessage);
  };
};

/**
 * Check for Service Worker updates manually
 */
export const checkForUpdates = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      logger.warn('No Service Worker registration found');
      return false;
    }

    logger.info('Checking for Service Worker updates...');
    await registration.update();
    
    const hasUpdate = !!registration.waiting || !!registration.installing;
    logger.info('Update check complete', { hasUpdate });
    
    return hasUpdate;
  } catch (error) {
    logger.error('Failed to check for updates', { error });
    return false;
  }
};

/**
 * Get cache storage statistics
 */
export const getCacheStats = async (): Promise<{
  cacheNames: string[];
  totalSize: number;
  cacheCount: number;
  oldestCache?: string;
  newestCache?: string;
}> => {
  if (!('caches' in window)) {
    return {
      cacheNames: [],
      totalSize: 0,
      cacheCount: 0,
    };
  }

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    // Estimate cache sizes (approximate)
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      totalSize += keys.length * 10000; // Rough estimate: 10KB per cached item
    }

    return {
      cacheNames,
      totalSize,
      cacheCount: cacheNames.length,
      oldestCache: cacheNames[0],
      newestCache: cacheNames[cacheNames.length - 1],
    };
  } catch (error) {
    logger.error('Failed to get cache stats', { error });
    return {
      cacheNames: [],
      totalSize: 0,
      cacheCount: 0,
    };
  }
};

/**
 * Clear all Service Worker caches manually
 */
export const clearAllCaches = async (): Promise<number> => {
  if (!('caches' in window)) {
    return 0;
  }

  try {
    const cacheNames = await caches.keys();
    const deletedCount = await Promise.all(
      cacheNames.map(name => caches.delete(name))
    ).then(results => results.filter(Boolean).length);

    logger.info('Cleared all Service Worker caches', {
      deletedCount,
      cacheNames,
    });

    return deletedCount;
  } catch (error) {
    logger.error('Failed to clear caches', { error });
    return 0;
  }
};

/**
 * Unregister Service Worker completely
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      logger.warn('No Service Worker to unregister');
      return false;
    }

    const unregistered = await registration.unregister();
    logger.info('Service Worker unregistered', { success: unregistered });

    return unregistered;
  } catch (error) {
    logger.error('Failed to unregister Service Worker', { error });
    return false;
  }
};

/**
 * Force Service Worker to skip waiting and activate immediately
 */
export const skipWaiting = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.waiting) {
      logger.warn('No waiting Service Worker to activate');
      return;
    }

    logger.info('Sending SKIP_WAITING message to Service Worker');
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  } catch (error) {
    logger.error('Failed to skip waiting', { error });
  }
};

/**
 * Log comprehensive Service Worker diagnostics
 */
export const logServiceWorkerDiagnostics = async (): Promise<void> => {
  const status = await getServiceWorkerStatus();
  const cacheStats = await getCacheStats();

  logger.info('Service Worker Diagnostics', {
    status: {
      registered: status.registered,
      active: status.active,
      waiting: status.waiting,
      updating: status.updating,
      controller: status.controller,
      hasError: !!status.error,
    },
    caches: cacheStats,
    navigator: {
      online: navigator.onLine,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    },
    location: {
      href: window.location.href,
      origin: window.location.origin,
      protocol: window.location.protocol,
    },
  });
};
