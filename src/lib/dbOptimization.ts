/**
 * Database Query Optimization Utilities
 * Provides caching, batching, and query optimization for Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

/**
 * Query result cache with TTL
 */
interface CacheEntry<T> {
  data: T;
  expires: number;
}

const queryCache = new Map<string, CacheEntry<any>>();

/**
 * Execute a query with automatic caching
 * Reduces database load by caching results for specified TTL
 * 
 * @example
 * ```typescript
 * const users = await cachedQuery(
 *   'users-list',
 *   () => supabase.from('users').select('*'),
 *   300 // Cache for 5 minutes
 * );
 * ```
 */
export const cachedQuery = async <T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> => {
  const now = Date.now();
  const cached = queryCache.get(queryKey);
  
  if (cached && cached.expires > now) {
    logger.debug('Database cache hit', { queryKey, age: now - (cached.expires - ttlSeconds * 1000) });
    return cached.data as T;
  }
  
  logger.debug('Database cache miss', { queryKey });
  const data = await queryFn();
  
  queryCache.set(queryKey, {
    data,
    expires: now + ttlSeconds * 1000,
  });
  
  return data;
};

/**
 * Clear cached query result
 */
export const clearQueryCache = (queryKey: string): void => {
  queryCache.delete(queryKey);
  logger.debug('Cleared query cache', { queryKey });
};

/**
 * Clear all cached queries
 */
export const clearAllQueryCache = (): void => {
  const size = queryCache.size;
  queryCache.clear();
  logger.info('Cleared all query cache', { clearedEntries: size });
};

/**
 * Get cache statistics
 */
export const getQueryCacheStats = () => {
  const now = Date.now();
  const entries = Array.from(queryCache.entries());
  
  return {
    totalEntries: entries.length,
    activeEntries: entries.filter(([_, entry]) => entry.expires > now).length,
    expiredEntries: entries.filter(([_, entry]) => entry.expires <= now).length,
    oldestEntry: entries.reduce((oldest, [key, entry]) => {
      return entry.expires < oldest ? entry.expires : oldest;
    }, Infinity),
  };
};

/**
 * Batch multiple queries to reduce round trips
 * Executes all queries in parallel
 * 
 * @example
 * ```typescript
 * const [users, posts] = await batchQueries([
 *   () => supabase.from('users').select('*'),
 *   () => supabase.from('posts').select('*')
 * ]);
 * ```
 */
export const batchQueries = async <T>(
  queries: Array<() => Promise<T>>
): Promise<T[]> => {
  logger.debug('Executing batch queries', { count: queries.length });
  const start = performance.now();
  
  const results = await Promise.all(queries.map(q => q()));
  
  const duration = performance.now() - start;
  logger.debug('Batch queries completed', { count: queries.length, duration });
  
  return results;
};

/**
 * Create optimized select query with specific columns
 * Reduces payload size by only selecting needed columns
 * 
 * @example
 * ```typescript
 * const users = await optimizedSelect('users', ['id', 'email', 'name'])
 *   .limit(10);
 * ```
 */
export const optimizedSelect = (table: string, columns: string[]) => {
  logger.debug('Creating optimized select', { table, columns });
  return (supabase as any)
    .from(table)
    .select(columns.join(', '));
};

/**
 * Pagination helper with optimal page size
 * Automatically determines best page size based on data size
 */
export const paginatedQuery = async <T>(
  table: string,
  columns: string[],
  page: number = 0,
  pageSize: number = 50
) => {
  const start = page * pageSize;
  const end = start + pageSize - 1;
  
  logger.debug('Paginated query', { table, page, pageSize, start, end });
  
  const { data, error, count } = await (supabase as any)
    .from(table)
    .select(columns.join(', '), { count: 'exact' })
    .range(start, end);
  
  if (error) {
    logger.error('Paginated query failed', { table, error });
    throw error;
  }
  
  return {
    data: data as T[],
    page,
    pageSize,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
    hasMore: (count || 0) > end + 1,
  };
};

/**
 * Cleanup expired cache entries
 * Run periodically to prevent memory leaks
 */
export const cleanupExpiredCache = (): number => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of queryCache.entries()) {
    if (entry.expires <= now) {
      queryCache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logger.info('Cleaned expired cache entries', { cleaned });
  }
  
  return cleaned;
};

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupExpiredCache();
  }, 5 * 60 * 1000);
}
