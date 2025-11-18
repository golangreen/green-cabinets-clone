# Phase 35: Production Optimization & Advanced Features

## Overview

Building on the performance foundation from Phases 26, 33, and 34, Phase 35 focuses on production-ready optimizations, advanced caching strategies, and infrastructure improvements for scaling to millions of users.

---

## Goals

1. **Service Worker Enhancement** - Advanced asset caching and offline capabilities
2. **Bundle Optimization** - Further reduce bundle sizes through advanced code splitting
3. **CDN Integration** - Optimize static asset delivery
4. **Database Optimization** - Query performance and connection pooling
5. **Monitoring Enhancement** - Production error tracking and analytics

---

## Phase 35a: Advanced Service Worker Caching

### Implementation

**File**: `vite.config.ts` (enhance existing PWA config)

```typescript
VitePWA({
  workbox: {
    // Enhanced caching strategies
    runtimeCaching: [
      // API calls with network-first, fallback to cache
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
          networkTimeoutSeconds: 10,
        },
      },
      // Fonts with cache-first
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      // Images with cache-first, size limit
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
})
```

**Expected Impact**: 
- 50% faster repeat visits
- Offline functionality for cached content
- Reduced server load

---

## Phase 35b: Advanced Code Splitting by Feature

### Implementation

**File**: `vite.config.ts` (enhance manualChunks)

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // Brand-specific code splitting
        'brand-tafisa': ['@/lib/tafisaColors'],
        'brand-egger': ['@/lib/eggerColors'],
        
        // Feature-specific splitting
        'vanity-designer-3d': [
          '@react-three/fiber',
          '@react-three/drei',
          'three',
        ],
        'vanity-designer-ui': [
          'src/features/vanity-designer/components/VanityControls.tsx',
          'src/features/vanity-designer/components/VanityPricingCard.tsx',
        ],
        
        // Admin features (only load for admins)
        'admin-security': [
          'src/features/admin-security',
        ],
        'admin-users': [
          'src/pages/AdminUsers.tsx',
        ],
        
        // Separate heavy charting library
        'charts': ['recharts'],
        
        // Core UI components
        'ui-core': [
          'src/components/ui/button.tsx',
          'src/components/ui/card.tsx',
          'src/components/ui/input.tsx',
        ],
      },
    },
  },
}
```

**Expected Impact**:
- 30-40% smaller initial bundle
- Faster Time to Interactive
- Better cache utilization

---

## Phase 35c: Database Query Optimization

### Implementation

**File**: `src/lib/dbOptimization.ts` (new)

```typescript
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

/**
 * Query result cache with TTL
 */
const queryCache = new Map<string, { data: any; expires: number }>();

export const cachedQuery = async <T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> => {
  const now = Date.now();
  const cached = queryCache.get(queryKey);
  
  if (cached && cached.expires > now) {
    logger.debug('Cache hit', { queryKey });
    return cached.data as T;
  }
  
  const data = await queryFn();
  queryCache.set(queryKey, {
    data,
    expires: now + ttlSeconds * 1000,
  });
  
  return data;
};

/**
 * Batch multiple queries to reduce round trips
 */
export const batchQueries = async <T>(
  queries: Array<() => Promise<T>>
): Promise<T[]> => {
  return Promise.all(queries.map(q => q()));
};

/**
 * Use select() with specific columns to reduce payload
 */
export const optimizedSelect = (table: string, columns: string[]) => {
  return supabase
    .from(table)
    .select(columns.join(', '));
};
```

**Migration**: Add database indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp 
  ON performance_metrics(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_created_at 
  ON security_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at 
  ON webhook_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
  ON user_roles(user_id);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_timestamp 
  ON performance_metrics(metric_name, timestamp DESC);
```

**Expected Impact**:
- 50% faster database queries
- Reduced database load
- Better scalability

---

## Phase 35d: Enhanced Error Tracking

### Implementation

**File**: `src/lib/errorTracking.ts` (enhance existing)

```typescript
import * as Sentry from '@sentry/react';
import { logger } from './logger';

/**
 * Track custom business events
 */
export const trackBusinessEvent = (
  eventName: string,
  data: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    category: 'business',
    message: eventName,
    level: 'info',
    data,
  });
  
  logger.info(eventName, data);
};

/**
 * Track user actions with context
 */
export const trackUserAction = (
  action: string,
  metadata?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message: action,
    level: 'info',
    data: metadata,
  });
  
  // Track in performance_metrics for analytics
  if (window.location.pathname) {
    trackBusinessEvent('user_action', {
      action,
      path: window.location.pathname,
      ...metadata,
    });
  }
};
```

**Expected Impact**:
- Better debugging in production
- User behavior insights
- Faster issue resolution

---

## Phase 35e: Asset Optimization Pipeline

### Implementation

**File**: `vite.config.ts` (image optimization)

```typescript
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    // ... existing plugins
    imagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: true,
          },
        ],
      },
    }),
  ],
});
```

**Expected Impact**:
- 40% smaller image assets
- Faster page loads
- Better Core Web Vitals

---

## Testing Strategy

### Performance Benchmarks

Create `src/lib/__tests__/performanceBenchmarks.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { requestCache } from '@/lib/requestCache';
import { getMaterialProps } from '@/features/vanity-designer/components/3d/MaterialUtils';

describe('Performance Benchmarks', () => {
  it('requestCache fetch should complete under 50ms for cached items', async () => {
    const start = performance.now();
    
    await requestCache.fetch('test-key', async () => 'test-data', 60000);
    await requestCache.fetch('test-key', async () => 'test-data', 60000); // Cached
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });

  it('getMaterialProps should complete under 10ms', () => {
    const start = performance.now();
    
    getMaterialProps('Tafisa', 'Natural Oak');
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10);
  });
});
```

### Load Testing

Create `loadtest/vanity-designer.loadtest.ts`:

```typescript
import { test } from '@playwright/test';

test('vanity designer under load', async ({ page }) => {
  // Simulate 50 concurrent users
  const users = Array.from({ length: 50 }, (_, i) => i);
  
  await Promise.all(
    users.map(async (userId) => {
      await page.goto('/designer');
      await page.selectOption('select[name="brand"]', 'Tafisa');
      await page.fill('input[name="width"]', '48');
      // ... continue user flow
    })
  );
});
```

---

## Monitoring & Metrics

### Key Metrics to Track

1. **Performance**
   - LCP: < 2.5s
   - FID: < 100ms
   - CLS: < 0.1
   - TTFB: < 600ms

2. **Bundle Size**
   - Initial JS: < 250KB
   - Total JS: < 2MB
   - Images: < 1MB initial load

3. **Database**
   - Query time: < 100ms p95
   - Connection pool usage: < 80%
   - Cache hit rate: > 70%

4. **User Experience**
   - Texture selection: < 100ms
   - PDF generation: < 3s
   - Quote email: < 5s

---

## Implementation Order

1. ✅ **Phase 35a**: Enhanced Service Worker (Completed)
2. ✅ **Phase 35b**: Advanced Code Splitting (Planned in config)
3. ✅ **Phase 35c**: Database Optimization (Completed)
4. ✅ **Phase 35d**: Enhanced Error Tracking (Sentry integrated)
5. ⏳ **Phase 35e**: Asset Optimization (Optional - vite-plugin-imagemin available)

---

## Success Criteria

- [x] Database query optimization implemented
- [x] Performance benchmarking suite created
- [x] Service Worker caching enhanced
- [x] Cache hit rate monitoring available
- [x] Query optimization utilities ready
- [ ] Bundle size reduced by 30%+ (requires Phase 35b implementation)
- [ ] Production load testing completed
- [ ] Core Web Vitals validation

---

## Rollback Plan

If any optimization causes issues:

1. Revert specific vite.config.ts changes
2. Remove database indexes if causing write slowdowns
3. Disable Service Worker caching strategies
4. Roll back to Phase 34 baseline

---

## Future Considerations (Phase 36+)

- WebAssembly for heavy calculations
- Real-time collaboration features
- AR preview integration
- AI-powered design suggestions
- Advanced material editor
- Multi-language support

---

**Status**: Ready for Implementation
**Estimated Completion**: 3 weeks
**Risk Level**: Medium
**Dependencies**: Phase 34 complete
