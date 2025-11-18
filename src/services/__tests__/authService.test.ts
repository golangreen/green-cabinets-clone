import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../authService';
import { createMockSupabaseClient } from '@/test/utils';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
    service = new AuthService();
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await service.signUp('test@example.com', 'password123');

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeUndefined();
    });

    it('should handle signup errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Email already exists', name: 'AuthError', status: 400 },
      });

      const result = await service.signUp('test@example.com', 'password123');

      expect(result.error).toBe('Email already exists');
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      });

      const result = await service.signIn('test@example.com', 'password123');

      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeUndefined();
    });

    it('should handle invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials', name: 'AuthError', status: 400 },
      });

      const result = await service.signIn('test@example.com', 'wrong-password');

      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

      await service.signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
