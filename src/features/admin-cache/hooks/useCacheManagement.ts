import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { backgroundSync } from '@/lib/backgroundSync';

interface CacheEntry {
  key: string;
  size: number;
  timestamp?: number;
  type: 'product' | 'cart' | 'sync-queue' | 'other';
}

interface StorageStats {
  total: number;
  used: number;
  available: number;
  percentage: number;
  entries: CacheEntry[];
}

export function useCacheManagement() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateSize = (value: string): number => {
    return new Blob([value]).size;
  };

  const categorizeKey = (key: string): CacheEntry['type'] => {
    if (key.includes('product')) return 'product';
    if (key.includes('cart')) return 'cart';
    if (key.includes('queue')) return 'sync-queue';
    return 'other';
  };

  const loadStats = () => {
    try {
      setIsLoading(true);
      const entries: CacheEntry[] = [];
      let totalUsed = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        const value = localStorage.getItem(key) || '';
        const size = calculateSize(value);
        totalUsed += size;

        // Try to extract timestamp if it's JSON
        let timestamp: number | undefined;
        try {
          const parsed = JSON.parse(value);
          if (parsed.timestamp) timestamp = parsed.timestamp;
          if (parsed.lastFetched) timestamp = parsed.lastFetched;
        } catch {
          // Not JSON, skip timestamp
        }

        entries.push({
          key,
          size,
          timestamp,
          type: categorizeKey(key),
        });
      }

      // Estimate total storage (5MB for localStorage)
      const totalStorage = 5 * 1024 * 1024; // 5MB in bytes
      const available = totalStorage - totalUsed;
      const percentage = (totalUsed / totalStorage) * 100;

      setStats({
        total: totalStorage,
        used: totalUsed,
        available,
        percentage,
        entries: entries.sort((a, b) => b.size - a.size),
      });

      logger.info('Cache stats loaded', { component: 'CacheManagement', totalUsed, entriesCount: entries.length });
    } catch (error) {
      logger.error('Failed to load cache stats', { component: 'CacheManagement', error });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = (key: string) => {
    try {
      localStorage.removeItem(key);
      logger.info('Cache cleared', { component: 'CacheManagement', key });
      loadStats(); // Refresh stats
    } catch (error) {
      logger.error('Failed to clear cache', { component: 'CacheManagement', key, error });
      throw error;
    }
  };

  const clearAllCaches = () => {
    try {
      localStorage.clear();
      logger.info('All caches cleared', { component: 'CacheManagement' });
      loadStats(); // Refresh stats
    } catch (error) {
      logger.error('Failed to clear all caches', { component: 'CacheManagement', error });
      throw error;
    }
  };

  const clearByType = (type: CacheEntry['type']) => {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        
        if (categorizeKey(key) === type) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      logger.info('Cache type cleared', { component: 'CacheManagement', type, count: keysToRemove.length });
      loadStats(); // Refresh stats
    } catch (error) {
      logger.error('Failed to clear cache by type', { component: 'CacheManagement', type, error });
      throw error;
    }
  };

  const testPerformance = async (): Promise<{
    write: number;
    read: number;
    delete: number;
  }> => {
    const testKey = 'performance-test';
    const testData = JSON.stringify({ test: 'data', timestamp: Date.now() });

    try {
      // Test write
      const writeStart = performance.now();
      localStorage.setItem(testKey, testData);
      const writeTime = performance.now() - writeStart;

      // Test read
      const readStart = performance.now();
      localStorage.getItem(testKey);
      const readTime = performance.now() - readStart;

      // Test delete
      const deleteStart = performance.now();
      localStorage.removeItem(testKey);
      const deleteTime = performance.now() - deleteStart;

      logger.info('Performance test completed', {
        component: 'CacheManagement',
        writeTime,
        readTime,
        deleteTime,
      });

      return {
        write: writeTime,
        read: readTime,
        delete: deleteTime,
      };
    } catch (error) {
      logger.error('Performance test failed', { component: 'CacheManagement', error });
      throw error;
    }
  };

  const getSyncQueueStatus = () => {
    return backgroundSync.getQueueStatus();
  };

  const clearSyncQueue = () => {
    backgroundSync.clearQueue();
    loadStats();
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    isLoading,
    loadStats,
    clearCache,
    clearAllCaches,
    clearByType,
    testPerformance,
    getSyncQueueStatus,
    clearSyncQueue,
  };
}
