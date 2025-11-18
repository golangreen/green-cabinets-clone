import { describe, it, expect } from 'vitest';
import { requestCache } from '@/lib/requestCache';
import { getMaterialProps } from '@/features/vanity-designer/components/3d/MaterialUtils';

describe('Performance Benchmarks', () => {
  it('requestCache fetch should complete under 50ms for cached items', async () => {
    const start = performance.now();
    
    // First call caches
    await requestCache.fetch('test-key-perf', async () => 'test-data', 60000);
    
    // Second call should be instant from cache
    const cacheStart = performance.now();
    await requestCache.fetch('test-key-perf', async () => 'test-data', 60000);
    const cacheDuration = performance.now() - cacheStart;
    
    expect(cacheDuration).toBeLessThan(50);
  });

  it('getMaterialProps should complete under 10ms', () => {
    const start = performance.now();
    
    getMaterialProps('Tafisa', 'Natural Oak');
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10);
  });

  it('multiple getMaterialProps calls should be fast', () => {
    const brands = ['Tafisa', 'Egger', 'Shinnoki'];
    const finishes = ['Natural Oak', 'White', 'Walnut'];
    
    const start = performance.now();
    
    brands.forEach(brand => {
      finishes.forEach(finish => {
        getMaterialProps(brand, finish);
      });
    });
    
    const duration = performance.now() - start;
    const avgPerCall = duration / (brands.length * finishes.length);
    
    expect(avgPerCall).toBeLessThan(5);
  });

  it('requestCache should handle concurrent requests efficiently', async () => {
    const start = performance.now();
    
    // Simulate 10 concurrent cache requests
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        requestCache.fetch(`concurrent-${i}`, async () => `data-${i}`, 60000)
      )
    );
    
    const duration = performance.now() - start;
    const avgPerRequest = duration / 10;
    
    expect(avgPerRequest).toBeLessThan(20);
  });
});
