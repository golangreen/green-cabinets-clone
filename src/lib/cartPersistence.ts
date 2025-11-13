/**
 * Cart Persistence Configuration
 * Handles localStorage persistence for cart store
 */

import { createJSONStorage, StateStorage } from 'zustand/middleware';
import { CACHE_KEYS } from '@/constants/cacheKeys';
import { logger } from '@/lib/logger';

/**
 * Custom storage with error handling and logging
 */
const createCartStorage = (): StateStorage => ({
  getItem: (name: string): string | null => {
    try {
      const value = localStorage.getItem(name);
      if (value) {
        logger.info('Cart loaded from storage', { component: 'CartPersistence' });
      }
      return value;
    } catch (error) {
      logger.error('Failed to load cart from storage', { component: 'CartPersistence', error });
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      logger.error('Failed to save cart to storage', { component: 'CartPersistence', error });
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      logger.error('Failed to remove cart from storage', { component: 'CartPersistence', error });
    }
  },
});

/**
 * Cart persistence configuration for Zustand
 */
export const cartPersistenceConfig = {
  name: CACHE_KEYS.CART,
  storage: createJSONStorage(() => createCartStorage()),
  version: 1,
  migrate: (persistedState: any, version: number) => {
    // Migration logic for future schema changes
    if (version === 0) {
      logger.info('Migrating cart store to version 1', { component: 'CartPersistence' });
      // Example: Add new fields, transform data structure
      return {
        ...persistedState,
        // Add any new required fields with defaults
      };
    }
    return persistedState;
  },
};
