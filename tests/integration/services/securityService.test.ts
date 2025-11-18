import { describe, it, expect, beforeEach, vi } from 'vitest';
import { securityService } from '@/services/securityService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('Security Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchSecurityEvents', () => {
    it('should fetch security events with filters', async () => {
      const mockEvents = [
        {
          id: '1',
          event_type: 'rate_limit_exceeded',
          severity: 'high',
          client_ip: '192.168.1.1',
          created_at: new Date().toISOString(),
        },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockEvents, error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockGte = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ gte: mockGte });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await securityService.fetchSecurityEvents({
        eventType: 'rate_limit_exceeded',
        hours: 24,
      });

      expect(result).toEqual(mockEvents);
      expect(mockSelect).toHaveBeenCalled();
    });
  });

  describe('blockIP', () => {
    it('should block IP address successfully', async () => {
      const mockResult = { success: true, message: 'IP blocked' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      
      (supabase.rpc as any).mockReturnValue({ single: mockSingle });

      const result = await securityService.blockIP(
        '192.168.1.100',
        'Suspicious activity',
        24
      );

      expect(result).toEqual(mockResult);
    });

    it('should handle blocking errors', async () => {
      const mockError = { message: 'Permission denied', code: '42501' };
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
      
      (supabase.rpc as any).mockReturnValue({ single: mockSingle });

      await expect(
        securityService.blockIP('192.168.1.100', 'Test', 24)
      ).rejects.toThrow();
    });
  });

  describe('getSecuritySummary', () => {
    it('should fetch security summary statistics', async () => {
      const mockSummary = [
        { event_type: 'rate_limit_exceeded', event_count: 50, unique_ips: 10 },
      ];

      const mockData = vi.fn().mockResolvedValue({ data: mockSummary, error: null });
      (supabase.rpc as any).mockReturnValue({ data: mockData });

      const result = await securityService.getSecuritySummary(60);

      expect(result).toBeDefined();
    });
  });
});
