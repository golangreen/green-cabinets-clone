import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as securityService from '../securityService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client');

describe('securityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchSecurityEvents', () => {
    it('fetches security events successfully', async () => {
      const mockEvents = [
        {
          id: '1',
          event_type: 'login_attempt',
          severity: 'low',
          function_name: 'auth',
          client_ip: '192.168.1.1',
          created_at: new Date().toISOString(),
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
      } as any);

      const result = await securityService.fetchSecurityEvents();

      expect(result).toEqual(mockEvents);
      expect(supabase.from).toHaveBeenCalledWith('security_events');
    });

    it('throws error when fetch fails', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('Fetch failed') }),
      } as any);

      await expect(securityService.fetchSecurityEvents()).rejects.toThrow('Fetch failed');
    });
  });

  describe('blockIP', () => {
    it('blocks IP successfully', async () => {
      const mockBlockedIP = {
        id: '1',
        ip_address: '192.168.1.100',
        reason: 'Manual block',
        auto_blocked: false,
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockBlockedIP, error: null }),
      } as any);

      const result = await securityService.blockIP('192.168.1.100', 'Manual block', 60);

      expect(result).toEqual(mockBlockedIP);
      expect(supabase.from).toHaveBeenCalledWith('blocked_ips');
    });
  });
});
