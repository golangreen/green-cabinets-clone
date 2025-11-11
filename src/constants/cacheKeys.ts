/**
 * Cache Keys Constants
 * Central definition for all localStorage/cache keys used throughout the application
 */

export const CACHE_KEYS = {
  // Product & Shopping
  PRODUCTS: 'product-cache',
  CART: 'shopify-cart',
  
  // Background Sync
  SYNC_QUEUE: 'sync-queue',
  
  // Query & Documentation
  QUERY_HISTORY: 'query-history',
  QUERY_BOOKMARKS: 'query-bookmarks',
  
  // Room Scanner
  ROOM_SCANS: 'room-scans',
  
  // Vanity Designer
  VANITY_TEMPLATES: 'vanity-templates',
  
  // UI Preferences
  THEME: 'theme-preference',
  NOTIFICATION_SETTINGS: 'notification-settings',
  
  // Performance Testing
  PERFORMANCE_TEST: 'performance-test',
} as const;

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];

/**
 * Categorize a cache key by type
 */
export function categorizeCacheKey(key: string): 'product' | 'cart' | 'sync-queue' | 'settings' | 'other' {
  if (key.includes('product')) return 'product';
  if (key.includes('cart')) return 'cart';
  if (key.includes('queue')) return 'sync-queue';
  if (key.includes('theme') || key.includes('notification') || key.includes('settings')) return 'settings';
  return 'other';
}
