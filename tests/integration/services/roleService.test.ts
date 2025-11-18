import { describe, it, expect, beforeEach, vi } from 'vitest';
import { roleService } from '@/services/roleService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe('Role Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addUserRole', () => {
    it('should add role successfully', async () => {
      const mockResult = { success: true, message: 'Role assigned' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      
      (supabase.rpc as any).mockReturnValue({ single: mockSingle });

      const result = await roleService.addUserRole(
        'user-id-123',
        'moderator'
      );

      expect(result).toEqual(mockResult);
      expect(supabase.rpc).toHaveBeenCalledWith('add_user_role', {
        target_user_id: 'user-id-123',
        target_role: 'moderator',
        expiration_date: undefined,
      });
    });

    it('should add temporary role with expiration', async () => {
      const mockResult = { success: true, message: 'Temporary role assigned' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      
      (supabase.rpc as any).mockReturnValue({ single: mockSingle });

      const expiresAt = new Date('2025-12-31');
      const result = await roleService.addUserRole(
        'user-id-123',
        'admin',
        expiresAt
      );

      expect(result).toEqual(mockResult);
      expect(supabase.rpc).toHaveBeenCalledWith('add_user_role', {
        target_user_id: 'user-id-123',
        target_role: 'admin',
        expiration_date: expiresAt.toISOString(),
      });
    });
  });

  describe('removeUserRole', () => {
    it('should remove role successfully', async () => {
      const mockResult = { success: true, message: 'Role removed' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      
      (supabase.rpc as any).mockReturnValue({ single: mockSingle });

      const result = await roleService.removeUserRole(
        'user-id-123',
        'moderator'
      );

      expect(result).toEqual(mockResult);
    });

    it('should handle last admin protection', async () => {
      const mockError = { message: 'Cannot remove last admin', code: 'P0001' };
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
      
      (supabase.rpc as any).mockReturnValue({ single: mockSingle });

      await expect(
        roleService.removeUserRole('user-id-123', 'admin')
      ).rejects.toThrow();
    });
  });

  describe('bulkAddUserRole', () => {
    it('should add role to multiple users', async () => {
      const mockResult = { 
        success: true, 
        affected_count: 3,
        total_users: 3 
      };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      
      (supabase.rpc as any).mockReturnValue({ single: mockSingle });

      const userIds = ['user-1', 'user-2', 'user-3'];
      const result = await roleService.bulkAddUserRole(userIds, 'moderator');

      expect(result.affected_count).toBe(3);
      expect(supabase.rpc).toHaveBeenCalledWith('bulk_add_user_role', {
        target_user_ids: userIds,
        target_role: 'moderator',
      });
    });
  });

  describe('extendRoleExpiration', () => {
    it('should extend role expiration', async () => {
      const mockResult = { success: true, message: 'Role extended' };
      const mockSingle = vi.fn().mockResolvedValue({ data: mockResult, error: null });
      
      (supabase.rpc as any).mockReturnValue({ single: mockSingle });

      const newExpiration = new Date('2025-12-31');
      const result = await roleService.extendRoleExpiration(
        'user-id-123',
        'admin',
        newExpiration
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('fetchAuditLogs', () => {
    it('should fetch audit logs with filters', async () => {
      const mockLogs = [
        {
          id: '1',
          action: 'assigned',
          role: 'admin',
          target_user_email: 'user@example.com',
          performed_by_email: 'admin@example.com',
          created_at: new Date().toISOString(),
        },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockLogs, error: null });
      const mockRange = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ range: mockRange });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await roleService.fetchAuditLogs();

      expect(result).toEqual(mockLogs);
    });
  });
});
