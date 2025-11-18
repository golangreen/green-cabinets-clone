/**
 * Request Cache with Deduplication
 * Prevents redundant network requests and deduplicates in-flight requests
 */

import { logger } from './logger';

type CacheEntry<T> = {
  data: T | null;
  timestamp: number;
  promise?: Promise<T>;
};

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl: number = 5 * 60 * 1000; // 5 minutes default
  private maxSize: number = 100; // Max cache entries

  /**
   * Fetch data with automatic caching and deduplication
   */
  async fetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();
    const effectiveTtl = ttl ?? this.ttl;

    // Return cached data if still valid
    if (entry) {
      // Request in flight, return existing promise to deduplicate
      if (entry.promise) {
        logger.debug('Request deduplication hit', { key });
        return entry.promise;
      }

      // Check if cached data is still fresh
      if (entry.data !== null && now - entry.timestamp < effectiveTtl) {
        logger.debug('Cache hit', { key, age: now - entry.timestamp });
        return entry.data;
      }
    }

    // Create new request
    logger.debug('Cache miss, fetching', { key });
    const promise = fetchFn();
    
    // Store promise to enable deduplication
    this.cache.set(key, { 
      data: null, 
      timestamp: now, 
      promise 
    });

    // Enforce max cache size
    this.enforceSizeLimit();

    try {
      const data = await promise;
      this.cache.set(key, { data, timestamp: now });
      logger.debug('Cache set', { key });
      return data;
    } catch (error) {
      // Remove failed request from cache
      this.cache.delete(key);
      logger.error('Request failed', error, { key });
      throw error;
    }
  }

  /**
   * Get cached data without making a new request
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || entry.data === null) return null;

    const now = Date.now();
    if (now - entry.timestamp >= this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Manually set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.enforceSizeLimit();
    logger.debug('Manual cache set', { key });
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Remove expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.ttl) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      logger.info('Expired cache entries cleared', { count });
    }

    return count;
  }

  /**
   * Enforce maximum cache size (LRU eviction)
   */
  private enforceSizeLimit(): void {
    if (this.cache.size <= this.maxSize) return;

    // Remove oldest entries first (LRU)
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, this.cache.size - this.maxSize);
    toRemove.forEach(([key]) => this.cache.delete(key));

    logger.debug('Cache size limit enforced', { 
      removed: toRemove.length,
      currentSize: this.cache.size 
    });
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }

  /**
   * Configure cache settings
   */
  configure(options: { ttl?: number; maxSize?: number }): void {
    if (options.ttl !== undefined) {
      this.ttl = options.ttl;
    }
    if (options.maxSize !== undefined) {
      this.maxSize = options.maxSize;
    }
    logger.info('Cache configured', options);
  }
}

// Singleton instance
export const requestCache = new RequestCache();

// Periodic cleanup of expired entries
if (typeof window !== 'undefined') {
  setInterval(() => {
    requestCache.clearExpired();
  }, 60000); // Every minute
}
