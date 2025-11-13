/**
 * Centralized React Query Configuration
 * Defines default options and stale time values for consistent caching behavior
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * Stale time constants (in milliseconds)
 */
export const STALE_TIME = {
  /** Never stale - use for data that rarely changes */
  NEVER: Infinity,
  
  /** 5 minutes - good for frequently accessed data */
  FIVE_MINUTES: 5 * 60 * 1000,
  
  /** 30 seconds - use for real-time data */
  THIRTY_SECONDS: 30 * 1000,
  
  /** 1 minute - balanced option */
  ONE_MINUTE: 60 * 1000,
  
  /** 10 minutes - use for semi-static data */
  TEN_MINUTES: 10 * 60 * 1000,
  
  /** 1 hour - use for static data */
  ONE_HOUR: 60 * 60 * 1000,
} as const;

/**
 * Default React Query options
 */
const defaultOptions: DefaultOptions = {
  queries: {
    // Default stale time for all queries (1 minute)
    staleTime: STALE_TIME.ONE_MINUTE,
    
    // Time before inactive queries are garbage collected (5 minutes)
    gcTime: STALE_TIME.FIVE_MINUTES,
    
    // Refetch on window focus for fresh data
    refetchOnWindowFocus: true,
    
    // Don't retry failed requests in development
    retry: import.meta.env.PROD ? 3 : false,
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    // Don't retry mutations by default
    retry: false,
  },
};

/**
 * Create configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions,
  });
}

/**
 * Feature-specific stale times
 */
export const FEATURE_STALE_TIMES = {
  // Security data - refresh every 30 seconds for real-time monitoring
  SECURITY: STALE_TIME.THIRTY_SECONDS,
  
  // Admin data - refresh every minute
  ADMIN: STALE_TIME.ONE_MINUTE,
  
  // Performance metrics - refresh every 5 minutes
  PERFORMANCE: STALE_TIME.FIVE_MINUTES,
  
  // User settings - rarely change, 10 minutes is fine
  USER_SETTINGS: STALE_TIME.TEN_MINUTES,
  
  // Email settings - rarely change
  EMAIL_SETTINGS: STALE_TIME.TEN_MINUTES,
  
  // Cron jobs - check every 5 minutes
  CRON_JOBS: STALE_TIME.FIVE_MINUTES,
} as const;
