import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceService } from '@/services/performanceService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('Performance Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordMetric', () => {
    it('should record performance metric successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const metric = {
        metric_name: 'LCP',
        metric_value: 2500,
        url: '/test',
        user_agent: 'Mozilla/5.0',
        connection_type: '4g',
        device_memory: 8,
        timestamp: new Date().toISOString(),
        metadata: {},
      };

      const result = await performanceService.recordMetric(metric);
      
      expect(result).toEqual({ success: true });
      expect(mockInsert).toHaveBeenCalledWith(metric);
    });

    it('should handle database errors gracefully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        error: { message: 'Database error', code: '42501' },
      });
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const metric = {
        metric_name: 'CLS',
        metric_value: 0.05,
        url: '/test',
      };

      await expect(performanceService.recordMetric(metric)).rejects.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('should fetch metrics with filters', async () => {
      const mockData = [
        { metric_name: 'LCP', metric_value: 2500, timestamp: new Date().toISOString() },
      ];
      
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockGte = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ gte: mockGte });
      
      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await performanceService.getMetrics({
        metricName: 'LCP',
        hours: 24,
      });

      expect(result).toEqual(mockData);
      expect(mockSelect).toHaveBeenCalledWith('*');
    });
  });

  describe('getAverageMetrics', () => {
    it('should calculate average metrics correctly', async () => {
      const mockData = [
        { avg_lcp: 2500, avg_cls: 0.05, avg_inp: 180, avg_ttfb: 750 },
      ];
      
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData[0], error: null });
      const mockRpc = vi.fn().mockReturnValue({ single: mockSingle });
      
      (supabase.rpc as any).mockImplementation(mockRpc);

      const result = await performanceService.getAverageMetrics(24);

      expect(result).toBeDefined();
      expect(result?.avg_lcp).toBe(2500);
    });
  });
});
