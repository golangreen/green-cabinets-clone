import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestCache } from '../requestCache';

describe('requestCache', () => {
  beforeEach(() => {
    requestCache.clear();
  });

  it('caches successful requests', async () => {
    const fetchFn = vi.fn().mockResolvedValue('data');
    
    const result1 = await requestCache.fetch('key1', fetchFn);
    const result2 = await requestCache.fetch('key1', fetchFn);

    expect(result1).toBe('data');
    expect(result2).toBe('data');
    expect(fetchFn).toHaveBeenCalledTimes(1); // Only called once due to cache
  });

  it('deduplicates concurrent requests', async () => {
    const fetchFn = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('data'), 100))
    );

    // Make concurrent requests
    const [result1, result2, result3] = await Promise.all([
      requestCache.fetch('key2', fetchFn),
      requestCache.fetch('key2', fetchFn),
      requestCache.fetch('key2', fetchFn),
    ]);

    expect(result1).toBe('data');
    expect(result2).toBe('data');
    expect(result3).toBe('data');
    expect(fetchFn).toHaveBeenCalledTimes(1); // Only one fetch for all three
  });

  it('respects TTL expiration', async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce('data1')
      .mockResolvedValueOnce('data2');

    // Fetch with 100ms TTL
    const result1 = await requestCache.fetch('key3', fetchFn, 100);
    expect(result1).toBe('data1');

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should fetch again
    const result2 = await requestCache.fetch('key3', fetchFn, 100);
    expect(result2).toBe('data2');
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('clears expired entries', async () => {
    requestCache.configure({ ttl: 50 });
    
    const fetchFn = vi.fn().mockResolvedValue('data');
    await requestCache.fetch('key4', fetchFn);

    expect(requestCache.get('key4')).toBe('data');

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 100));
    const cleared = requestCache.clearExpired();

    expect(cleared).toBeGreaterThan(0);
    expect(requestCache.get('key4')).toBeNull();
  });

  it('enforces size limit', async () => {
    requestCache.configure({ maxSize: 3 });

    const fetchFn = vi.fn().mockResolvedValue('data');

    await requestCache.fetch('key5', fetchFn);
    await requestCache.fetch('key6', fetchFn);
    await requestCache.fetch('key7', fetchFn);
    await requestCache.fetch('key8', fetchFn); // Should evict key5

    const stats = requestCache.getStats();
    expect(stats.size).toBeLessThanOrEqual(3);
  });

  it('handles fetch errors correctly', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      requestCache.fetch('key9', fetchFn)
    ).rejects.toThrow('Network error');

    // Failed request should not be cached
    expect(requestCache.get('key9')).toBeNull();
  });

  it('provides cache statistics', () => {
    const stats = requestCache.getStats();
    
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('maxSize');
    expect(stats).toHaveProperty('ttl');
  });

  it('allows manual cache operations', () => {
    requestCache.set('manual-key', 'manual-data');
    
    expect(requestCache.get('manual-key')).toBe('manual-data');
    
    requestCache.delete('manual-key');
    expect(requestCache.get('manual-key')).toBeNull();
  });
});
