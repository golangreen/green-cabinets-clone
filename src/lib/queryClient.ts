/**
 * React Query client configuration
 * Provides centralized query settings for data fetching
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys factory
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.products.lists(), { filters }] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (handle: string) => [...queryKeys.products.details(), handle] as const,
  },
  cart: {
    all: ['cart'] as const,
    items: () => [...queryKeys.cart.all, 'items'] as const,
  },
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
} as const;
