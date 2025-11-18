import { describe, it, expect, beforeEach } from 'vitest';
import {
  isRateLimited,
  getRemainingRequests,
  getResetTime,
  clearRateLimit,
} from '@/lib/security/rateLimit';

describe('Rate Limiting', () => {
  const testKey = 'test-action';
  const config = {
    maxRequests: 3,
    windowMs: 1000, // 1 second for testing
  };

  beforeEach(() => {
    clearRateLimit(testKey);
  });

  describe('isRateLimited', () => {
    it('should allow requests within limit', () => {
      expect(isRateLimited(testKey, config)).toBe(false);
      expect(isRateLimited(testKey, config)).toBe(false);
      expect(isRateLimited(testKey, config)).toBe(false);
    });

    it('should block requests exceeding limit', () => {
      // Use up the limit
      isRateLimited(testKey, config);
      isRateLimited(testKey, config);
      isRateLimited(testKey, config);
      
      // Next request should be blocked
      expect(isRateLimited(testKey, config)).toBe(true);
    });

    it('should reset after time window', async () => {
      // Use up the limit
      isRateLimited(testKey, config);
      isRateLimited(testKey, config);
      isRateLimited(testKey, config);
      expect(isRateLimited(testKey, config)).toBe(true);
      
      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be allowed again
      expect(isRateLimited(testKey, config)).toBe(false);
    });
  });

  describe('getRemainingRequests', () => {
    it('should return correct remaining count', () => {
      expect(getRemainingRequests(testKey, config)).toBe(3);
      
      isRateLimited(testKey, config);
      expect(getRemainingRequests(testKey, config)).toBe(2);
      
      isRateLimited(testKey, config);
      expect(getRemainingRequests(testKey, config)).toBe(1);
      
      isRateLimited(testKey, config);
      expect(getRemainingRequests(testKey, config)).toBe(0);
    });

    it('should return max requests for new key', () => {
      expect(getRemainingRequests('new-key', config)).toBe(config.maxRequests);
    });
  });

  describe('getResetTime', () => {
    it('should return reset time in seconds', () => {
      isRateLimited(testKey, config);
      const resetTime = getResetTime(testKey);
      expect(resetTime).toBeGreaterThan(0);
      expect(resetTime).toBeLessThanOrEqual(1);
    });

    it('should return 0 for new key', () => {
      expect(getResetTime('new-key')).toBe(0);
    });
  });

  describe('clearRateLimit', () => {
    it('should clear rate limit for key', () => {
      // Use up some requests
      isRateLimited(testKey, config);
      isRateLimited(testKey, config);
      expect(getRemainingRequests(testKey, config)).toBe(1);
      
      // Clear and verify reset
      clearRateLimit(testKey);
      expect(getRemainingRequests(testKey, config)).toBe(3);
    });
  });
});
