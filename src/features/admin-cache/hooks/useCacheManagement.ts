import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import * as cacheService from '@/services/cacheService';

export function useCacheManagement() {
  const [stats, setStats] = useState<cacheService.StorageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAdmin } = useAdminCheck();

  const loadStats = useCallback(() => {
    try {
      setIsLoading(true);
      const stats = cacheService.getStorageStats();
      setStats(stats);
    } catch (error) {
      toast.error('Failed to load cache statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback((key: string) => {
    if (!isAdmin) {
      toast.error('Unauthorized: Admin access required');
      return;
    }

    try {
      cacheService.clearCache(key);
      loadStats();
      toast.success('Cache entry cleared');
    } catch (error) {
      toast.error('Failed to clear cache entry');
    }
  }, [isAdmin, loadStats]);

  const clearAllCaches = useCallback(() => {
    if (!isAdmin) {
      toast.error('Unauthorized: Admin access required');
      return;
    }

    try {
      cacheService.clearAllCaches();
      loadStats();
      toast.success('All caches cleared');
    } catch (error) {
      toast.error('Failed to clear all caches');
    }
  }, [isAdmin, loadStats]);

  const clearByType = useCallback((type: cacheService.CacheEntry['type']) => {
    if (!isAdmin) {
      toast.error('Unauthorized: Admin access required');
      return;
    }

    try {
      cacheService.clearByType(type);
      loadStats();
      toast.success(`${type} caches cleared`);
    } catch (error) {
      toast.error(`Failed to clear ${type} caches`);
    }
  }, [isAdmin, loadStats]);

  const testPerformance = useCallback(async () => {
    if (!isAdmin) {
      toast.error('Unauthorized: Admin access required');
      return null;
    }

    try {
      return await cacheService.testPerformance();
    } catch (error) {
      toast.error('Performance test failed');
      return null;
    }
  }, [isAdmin]);

  const getSyncQueueStatus = useCallback(() => {
    return cacheService.getSyncQueueStatus();
  }, []);

  const clearSyncQueue = useCallback(() => {
    if (!isAdmin) {
      toast.error('Unauthorized: Admin access required');
      return;
    }

    try {
      cacheService.clearSyncQueue();
      loadStats();
      toast.success('Sync queue cleared');
    } catch (error) {
      toast.error('Failed to clear sync queue');
    }
  }, [isAdmin, loadStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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
