/**
 * Cache Service
 * Centralized business logic for cache management operations
 */

import { logger } from '@/lib/logger';
import { backgroundSync } from '@/lib/backgroundSync';
import { CACHE_KEYS, categorizeCacheKey } from '@/constants/cacheKeys';

export interface CacheEntry {
  key: string;
  size: number;
  timestamp?: number;
  type: 'product' | 'cart' | 'sync-queue' | 'settings' | 'other';
}

export interface StorageStats {
  total: number;
  used: number;
  available: number;
  percentage: number;
  entries: CacheEntry[];
}

export interface PerformanceTestResult {
  write: number;
  read: number;
  delete: number;
}

/**
 * Calculate the byte size of a string value
 */
function calculateSize(value: string): number {
  return new Blob([value]).size;
}

/**
 * Extract timestamp from cached JSON data
 */
function extractTimestamp(value: string): number | undefined {
  try {
    const parsed = JSON.parse(value);
    return parsed.timestamp || parsed.lastFetched || parsed.state?.lastFetch;
  } catch {
    return undefined;
  }
}

/**
 * Get comprehensive localStorage statistics
 */
export function getStorageStats(): StorageStats {
  const entries: CacheEntry[] = [];
  let totalUsed = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    const value = localStorage.getItem(key) || '';
    const size = calculateSize(value);
    totalUsed += size;

    entries.push({
      key,
      size,
      timestamp: extractTimestamp(value),
      type: categorizeCacheKey(key),
    });
  }

  // Estimate total storage (5MB for localStorage)
  const totalStorage = 5 * 1024 * 1024;
  const available = totalStorage - totalUsed;
  const percentage = (totalUsed / totalStorage) * 100;

  logger.info('Storage stats calculated', {
    component: 'CacheService',
    totalUsed,
    entriesCount: entries.length,
    percentage: percentage.toFixed(2),
  });

  return {
    total: totalStorage,
    used: totalUsed,
    available,
    percentage,
    entries: entries.sort((a, b) => b.size - a.size),
  };
}

/**
 * Get all cached entries as array
 */
export function getCachedEntries(): CacheEntry[] {
  const stats = getStorageStats();
  return stats.entries;
}

/**
 * Clear a specific cache entry by key
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key);
    logger.info('Cache entry cleared', { component: 'CacheService', key });
  } catch (error) {
    logger.error('Failed to clear cache entry', { component: 'CacheService', key, error });
    throw error;
  }
}

/**
 * Clear all localStorage caches
 */
export function clearAllCaches(): void {
  try {
    localStorage.clear();
    logger.info('All caches cleared', { component: 'CacheService' });
  } catch (error) {
    logger.error('Failed to clear all caches', { component: 'CacheService', error });
    throw error;
  }
}

/**
 * Clear caches by type category
 */
export function clearByType(type: CacheEntry['type']): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      if (categorizeCacheKey(key) === type) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    logger.info('Cache type cleared', {
      component: 'CacheService',
      type,
      count: keysToRemove.length,
    });
  } catch (error) {
    logger.error('Failed to clear cache by type', { component: 'CacheService', type, error });
    throw error;
  }
}

/**
 * Test localStorage performance
 */
export async function testPerformance(): Promise<PerformanceTestResult> {
  const testData = JSON.stringify({ test: 'data', timestamp: Date.now() });

  try {
    // Test write
    const writeStart = performance.now();
    localStorage.setItem(CACHE_KEYS.PERFORMANCE_TEST, testData);
    const writeTime = performance.now() - writeStart;

    // Test read
    const readStart = performance.now();
    localStorage.getItem(CACHE_KEYS.PERFORMANCE_TEST);
    const readTime = performance.now() - readStart;

    // Test delete
    const deleteStart = performance.now();
    localStorage.removeItem(CACHE_KEYS.PERFORMANCE_TEST);
    const deleteTime = performance.now() - deleteStart;

    logger.info('Performance test completed', {
      component: 'CacheService',
      writeTime: writeTime.toFixed(2),
      readTime: readTime.toFixed(2),
      deleteTime: deleteTime.toFixed(2),
    });

    return {
      write: parseFloat(writeTime.toFixed(2)),
      read: parseFloat(readTime.toFixed(2)),
      delete: parseFloat(deleteTime.toFixed(2)),
    };
  } catch (error) {
    logger.error('Performance test failed', { component: 'CacheService', error });
    throw error;
  }
}

/**
 * Get background sync queue status
 */
export function getSyncQueueStatus() {
  return backgroundSync.getQueueStatus();
}

/**
 * Clear background sync queue
 */
export function clearSyncQueue(): void {
  backgroundSync.clearQueue();
  logger.info('Sync queue cleared', { component: 'CacheService' });
}

/**
 * Get size breakdown by cache type
 */
export function getSizeBreakdown(): Record<CacheEntry['type'], number> {
  const entries = getCachedEntries();
  const breakdown: Record<CacheEntry['type'], number> = {
    product: 0,
    cart: 0,
    'sync-queue': 0,
    settings: 0,
    other: 0,
  };

  entries.forEach(entry => {
    breakdown[entry.type] += entry.size;
  });

  return breakdown;
}

/**
 * Export cache data as JSON
 */
export function exportCacheData(): string {
  const data: Record<string, any> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    try {
      const value = localStorage.getItem(key);
      data[key] = value ? JSON.parse(value) : value;
    } catch {
      data[key] = localStorage.getItem(key);
    }
  }

  logger.info('Cache data exported', { component: 'CacheService', keys: Object.keys(data).length });
  return JSON.stringify(data, null, 2);
}

/**
 * Get specific cache entry value
 */
export function getCacheValue(key: string): string | null {
  return localStorage.getItem(key);
}
