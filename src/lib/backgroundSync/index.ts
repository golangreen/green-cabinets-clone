/**
 * Background Sync Manager
 * Handles offline cart operations with automatic retry when connection restored
 */

import { logger } from '@/lib/logger';
import { CACHE_KEYS } from '@/constants/cacheKeys';
import { SECURITY_CONFIG } from '@/config';

interface QueuedOperation {
  id: string;
  type: 'add' | 'update' | 'remove' | 'checkout';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface QueueStatus {
  count: number;
  operations: QueuedOperation[];
}

type CartActionsProvider = () => {
  addItem: (item: any) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  createCheckout: () => Promise<string | null>;
};

class BackgroundSyncManager {
  private queue: QueuedOperation[] = [];
  private maxRetries = SECURITY_CONFIG.MAX_RETRIES;
  private actionsProvider: CartActionsProvider | null = null;

  constructor() {
    this.loadQueue();
  }

  /**
   * Register cart actions provider
   * This decouples the sync manager from cart store implementation
   */
  registerActionsProvider(provider: CartActionsProvider): void {
    this.actionsProvider = provider;
    logger.info('Cart actions provider registered', { component: 'BackgroundSync' });
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(CACHE_KEYS.SYNC_QUEUE);
      if (stored) {
        this.queue = JSON.parse(stored);
        logger.info('Queue loaded from storage', {
          component: 'BackgroundSync',
          count: this.queue.length,
        });
      }
    } catch (error) {
      logger.error('Failed to load queue', { component: 'BackgroundSync', error });
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(this.queue));
    } catch (error) {
      logger.error('Failed to save queue', { component: 'BackgroundSync', error });
    }
  }

  /**
   * Add operation to queue
   */
  enqueue(type: QueuedOperation['type'], data: any): void {
    const operation: QueuedOperation = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(operation);
    this.saveQueue();

    logger.info('Operation queued', {
      component: 'BackgroundSync',
      type,
      queueSize: this.queue.length,
    });
  }

  /**
   * Get queue status
   */
  getQueueStatus(): QueueStatus {
    return {
      count: this.queue.length,
      operations: [...this.queue],
    };
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
    logger.info('Queue cleared', { component: 'BackgroundSync' });
  }

  /**
   * Process queued operations
   */
  async processQueue(): Promise<{ success: number; failed: number }> {
    if (this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    if (!this.actionsProvider) {
      logger.warn('Cannot process queue - no actions provider registered', {
        component: 'BackgroundSync',
      });
      return { success: 0, failed: 0 };
    }

    if (!navigator.onLine) {
      logger.warn('Cannot process queue - offline', { component: 'BackgroundSync' });
      return { success: 0, failed: 0 };
    }

    logger.info('Processing queue', { component: 'BackgroundSync', count: this.queue.length });

    let successCount = 0;
    let failedCount = 0;
    const actions = this.actionsProvider();

    for (const operation of this.queue) {
      try {
        await this.executeOperation(operation, actions);
        successCount++;
        logger.info('Operation succeeded', {
          component: 'BackgroundSync',
          type: operation.type,
          id: operation.id,
        });
      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount >= this.maxRetries) {
          failedCount++;
          logger.error('Operation failed permanently', {
            component: 'BackgroundSync',
            type: operation.type,
            id: operation.id,
            retryCount: operation.retryCount,
            error,
          });
        } else {
          logger.warn('Operation failed, will retry', {
            component: 'BackgroundSync',
            type: operation.type,
            id: operation.id,
            retryCount: operation.retryCount,
          });
        }
      }
    }

    // Remove successful operations and permanently failed ones
    this.queue = this.queue.filter(op => op.retryCount > 0 && op.retryCount < this.maxRetries);
    this.saveQueue();

    logger.info('Queue processed', { component: 'BackgroundSync', successCount, failedCount });

    return { success: successCount, failed: failedCount };
  }

  /**
   * Execute a queued operation
   */
  private async executeOperation(
    operation: QueuedOperation,
    actions: ReturnType<CartActionsProvider>
  ): Promise<void> {
    switch (operation.type) {
      case 'add':
        await actions.addItem(operation.data);
        break;
      case 'update':
        await actions.updateQuantity(operation.data.variantId, operation.data.quantity);
        break;
      case 'remove':
        await actions.removeItem(operation.data.variantId);
        break;
      case 'checkout':
        await actions.createCheckout();
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }
}

// Export singleton instance
export const backgroundSync = new BackgroundSyncManager();

/**
 * Setup online/offline listeners to process queue
 */
export function setupBackgroundSync(actionsProvider: CartActionsProvider): void {
  // Register the actions provider
  backgroundSync.registerActionsProvider(actionsProvider);

  // Process queue when coming online
  window.addEventListener('online', async () => {
    logger.info('Connection restored, processing queue', { component: 'BackgroundSync' });
    const result = await backgroundSync.processQueue();
    logger.info('Queue processed', { component: 'BackgroundSync', ...result });
  });

  // Process queue on load if online
  if (navigator.onLine) {
    backgroundSync.processQueue();
  }
}
