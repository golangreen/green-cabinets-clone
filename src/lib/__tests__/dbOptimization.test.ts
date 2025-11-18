import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  cachedQuery,
  clearQueryCache,
  clearAllQueryCache,
  getQueryCacheStats,
  batchQueries,
  cleanupExpiredCache,
} from '../dbOptimization';

describe('Database Optimization Utilities', () => {
  beforeEach(() => {
    clearAllQueryCache();
  });

  describe('cachedQuery', () => {
    it('should cache query results', async () => {
      const queryFn = vi.fn().mockResolvedValue({ data: 'test' });
      
      // First call should execute
      const result1 = await cachedQuery('test-key', queryFn, 60);
      expect(queryFn).toHaveBeenCalledTimes(1);
      expect(result1).toEqual({ data: 'test' });
      
      // Second call should use cache
      const result2 = await cachedQuery('test-key', queryFn, 60);
      expect(queryFn).toHaveBeenCalledTimes(1); // Still 1
      expect(result2).toEqual({ data: 'test' });
    });

    it('should respect TTL and refetch after expiration', async () => {
      const queryFn = vi.fn()
        .mockResolvedValueOnce({ data: 'first' })
        .mockResolvedValueOnce({ data: 'second' });
      
      // First call
      await cachedQuery('test-ttl', queryFn, 0.1); // 100ms TTL
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should refetch after TTL
      const result = await cachedQuery('test-ttl', queryFn, 0.1);
      expect(queryFn).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ data: 'second' });
    });

    it('should handle different cache keys independently', async () => {
      const queryFn1 = vi.fn().mockResolvedValue({ data: 'query1' });
      const queryFn2 = vi.fn().mockResolvedValue({ data: 'query2' });
      
      await cachedQuery('key1', queryFn1, 60);
      await cachedQuery('key2', queryFn2, 60);
      
      expect(queryFn1).toHaveBeenCalledTimes(1);
      expect(queryFn2).toHaveBeenCalledTimes(1);
      
      // Both should use cache on second call
      await cachedQuery('key1', queryFn1, 60);
      await cachedQuery('key2', queryFn2, 60);
      
      expect(queryFn1).toHaveBeenCalledTimes(1);
      expect(queryFn2).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearQueryCache', () => {
    it('should clear specific cache entry', async () => {
      const queryFn = vi.fn().mockResolvedValue({ data: 'test' });
      
      await cachedQuery('clear-test', queryFn, 60);
      expect(queryFn).toHaveBeenCalledTimes(1);
      
      clearQueryCache('clear-test');
      
      await cachedQuery('clear-test', queryFn, 60);
      expect(queryFn).toHaveBeenCalledTimes(2); // Re-executed after clear
    });
  });

  describe('clearAllQueryCache', () => {
    it('should clear all cache entries', async () => {
      const queryFn1 = vi.fn().mockResolvedValue({ data: '1' });
      const queryFn2 = vi.fn().mockResolvedValue({ data: '2' });
      
      await cachedQuery('key1', queryFn1, 60);
      await cachedQuery('key2', queryFn2, 60);
      
      clearAllQueryCache();
      
      await cachedQuery('key1', queryFn1, 60);
      await cachedQuery('key2', queryFn2, 60);
      
      expect(queryFn1).toHaveBeenCalledTimes(2);
      expect(queryFn2).toHaveBeenCalledTimes(2);
    });
  });

  describe('getQueryCacheStats', () => {
    it('should return correct cache statistics', async () => {
      await cachedQuery('stats1', async () => 'data1', 60);
      await cachedQuery('stats2', async () => 'data2', 60);
      
      const stats = getQueryCacheStats();
      
      expect(stats.totalEntries).toBe(2);
      expect(stats.activeEntries).toBe(2);
      expect(stats.expiredEntries).toBe(0);
    });

    it('should track expired entries', async () => {
      await cachedQuery('expire1', async () => 'data', 0.05); // 50ms
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stats = getQueryCacheStats();
      
      expect(stats.totalEntries).toBe(1);
      expect(stats.expiredEntries).toBe(1);
      expect(stats.activeEntries).toBe(0);
    });
  });

  describe('batchQueries', () => {
    it('should execute multiple queries in parallel', async () => {
      const query1 = vi.fn().mockResolvedValue('result1');
      const query2 = vi.fn().mockResolvedValue('result2');
      const query3 = vi.fn().mockResolvedValue('result3');
      
      const results = await batchQueries([query1, query2, query3]);
      
      expect(results).toEqual(['result1', 'result2', 'result3']);
      expect(query1).toHaveBeenCalledTimes(1);
      expect(query2).toHaveBeenCalledTimes(1);
      expect(query3).toHaveBeenCalledTimes(1);
    });

    it('should complete faster than sequential execution', async () => {
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      const queries = [
        async () => { await delay(50); return '1'; },
        async () => { await delay(50); return '2'; },
        async () => { await delay(50); return '3'; },
      ];
      
      const start = performance.now();
      await batchQueries(queries);
      const duration = performance.now() - start;
      
      // Should be ~50ms (parallel) not ~150ms (sequential)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('cleanupExpiredCache', () => {
    it('should remove expired entries', async () => {
      await cachedQuery('cleanup1', async () => 'data', 0.05); // 50ms
      await cachedQuery('cleanup2', async () => 'data', 60); // 60s
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cleaned = cleanupExpiredCache();
      
      expect(cleaned).toBe(1); // Only cleanup1 expired
      
      const stats = getQueryCacheStats();
      expect(stats.totalEntries).toBe(1); // Only cleanup2 remains
    });

    it('should not remove active entries', async () => {
      await cachedQuery('active1', async () => 'data', 60);
      await cachedQuery('active2', async () => 'data', 60);
      
      const cleaned = cleanupExpiredCache();
      
      expect(cleaned).toBe(0);
      
      const stats = getQueryCacheStats();
      expect(stats.totalEntries).toBe(2);
    });
  });
});
