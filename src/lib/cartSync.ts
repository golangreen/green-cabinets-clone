/**
 * Cart Background Sync
 * Handles offline cart operations with background sync
 */

import { backgroundSync } from './backgroundSync';
import { logger } from './logger';
import { CartItem } from '@/features/shopping-cart/stores/cartStore';

/**
 * Cart sync operation types
 */
export type CartSyncOperation = 'add' | 'update' | 'remove' | 'checkout';

/**
 * Check if operation should be queued for offline sync
 */
export function shouldQueueOperation(): boolean {
  return !navigator.onLine;
}

/**
 * Queue cart add operation
 */
export function queueAddItem(item: CartItem): void {
  if (shouldQueueOperation()) {
    logger.warn('Offline - queueing add item operation', { 
      component: 'CartSync', 
      variantId: item.variantId 
    });
    backgroundSync.enqueue('add', item);
  }
}

/**
 * Queue cart update operation
 */
export function queueUpdateQuantity(variantId: string, quantity: number): void {
  if (shouldQueueOperation()) {
    logger.warn('Offline - queueing update quantity operation', { 
      component: 'CartSync', 
      variantId, 
      quantity 
    });
    backgroundSync.enqueue('update', { variantId, quantity });
  }
}

/**
 * Queue cart remove operation
 */
export function queueRemoveItem(variantId: string): void {
  if (shouldQueueOperation()) {
    logger.warn('Offline - queueing remove item operation', { 
      component: 'CartSync', 
      variantId 
    });
    backgroundSync.enqueue('remove', { variantId });
  }
}

/**
 * Queue checkout operation
 */
export function queueCheckout(): void {
  if (shouldQueueOperation()) {
    logger.warn('Offline - queueing checkout operation', { 
      component: 'CartSync' 
    });
    backgroundSync.enqueue('checkout', {});
  }
}

/**
 * Initialize cart sync with background sync manager
 */
export function setupCartSync(actionsProvider: () => {
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  createCheckout: () => Promise<string | null>;
}): void {
  backgroundSync.registerActionsProvider(actionsProvider);
  logger.info('Cart sync initialized', { component: 'CartSync' });
}
