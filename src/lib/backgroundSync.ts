import { logger } from './logger';

interface QueuedOperation {
  id: string;
  type: 'add' | 'update' | 'remove' | 'checkout';
  data: any;
  timestamp: number;
  retryCount: number;
}

const SYNC_TAG = 'cart-operations-sync';
const QUEUE_KEY = 'cart-operations-queue';
const MAX_RETRIES = 3;

// Extend ServiceWorkerRegistration type for Background Sync API
declare global {
  interface ServiceWorkerRegistration {
    sync: {
      register(tag: string): Promise<void>;
      getTags(): Promise<string[]>;
    };
  }
}

/**
 * Background Sync Queue Manager
 * Handles queueing and retrying failed cart operations
 */
class BackgroundSyncManager {
  private queue: QueuedOperation[] = [];

  constructor() {
    this.loadQueue();
  }

  /**
   * Load queued operations from localStorage
   */
  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        logger.info('Loaded queued operations', { component: 'BackgroundSync', count: this.queue.length });
      }
    } catch (error) {
      logger.error('Failed to load queue', { component: 'BackgroundSync', error });
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      logger.error('Failed to save queue', { component: 'BackgroundSync', error });
    }
  }

  /**
   * Add operation to queue
   */
  enqueue(type: QueuedOperation['type'], data: any) {
    const operation: QueuedOperation = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(operation);
    this.saveQueue();
    
    logger.info('Operation queued', { component: 'BackgroundSync', type, id: operation.id });

    // Register for background sync if supported
    this.registerSync();
  }

  /**
   * Register background sync
   */
  private async registerSync() {
    if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
      logger.warn('Background Sync not supported', { component: 'BackgroundSync' });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(SYNC_TAG);
      logger.info('Sync registered', { component: 'BackgroundSync' });
    } catch (error) {
      logger.error('Failed to register sync', { component: 'BackgroundSync', error });
    }
  }

  /**
   * Process queued operations
   */
  async processQueue(cartActions?: any): Promise<{ success: number; failed: number }> {
    if (this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    if (!cartActions) {
      logger.warn('Cannot process queue without cart actions', { component: 'BackgroundSync' });
      return { success: 0, failed: 0 };
    }

    logger.info('Processing queue', { component: 'BackgroundSync', count: this.queue.length });

    let successCount = 0;
    let failedCount = 0;
    const remainingQueue: QueuedOperation[] = [];

    for (const operation of this.queue) {
      try {
        await this.executeOperation(operation, cartActions);
        successCount++;
        logger.info('Operation succeeded', { 
          component: 'BackgroundSync',
          type: operation.type, 
          id: operation.id 
        });
      } catch (error) {
        operation.retryCount++;
        
        if (operation.retryCount >= MAX_RETRIES) {
          failedCount++;
          logger.error('Operation failed after max retries', {
            component: 'BackgroundSync',
            type: operation.type,
            id: operation.id,
            retries: operation.retryCount,
            error
          });
        } else {
          remainingQueue.push(operation);
          logger.warn('Operation failed, will retry', {
            component: 'BackgroundSync',
            type: operation.type,
            id: operation.id,
            retries: operation.retryCount,
            error
          });
        }
      }
    }

    this.queue = remainingQueue;
    this.saveQueue();

    return { success: successCount, failed: failedCount };
  }

  /**
   * Execute a queued operation
   */
  private async executeOperation(operation: QueuedOperation, cartActions: any): Promise<void> {
    switch (operation.type) {
      case 'add':
        await cartActions.addItem(operation.data);
        break;
      case 'update':
        await cartActions.updateQuantity(operation.data.variantId, operation.data.quantity);
        break;
      case 'remove':
        await cartActions.removeItem(operation.data.variantId);
        break;
      case 'checkout':
        await cartActions.createCheckout();
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      count: this.queue.length,
      operations: this.queue.map(op => ({
        id: op.id,
        type: op.type,
        timestamp: op.timestamp,
        retryCount: op.retryCount,
      })),
    };
  }

  /**
   * Clear queue
   */
  clearQueue() {
    this.queue = [];
    this.saveQueue();
    logger.info('Queue cleared', { component: 'BackgroundSync' });
  }
}

// Singleton instance
export const backgroundSync = new BackgroundSyncManager();

/**
 * Setup online/offline listeners to process queue
 */
export function setupBackgroundSync(cartActions: any) {
  // Process queue when coming online
  window.addEventListener('online', async () => {
    logger.info('Connection restored, processing queue', { component: 'BackgroundSync' });
    const result = await backgroundSync.processQueue(cartActions);
    logger.info('Queue processed', { component: 'BackgroundSync', ...result });
  });

  // Process queue on load if online
  if (navigator.onLine) {
    backgroundSync.processQueue(cartActions);
  }
}
