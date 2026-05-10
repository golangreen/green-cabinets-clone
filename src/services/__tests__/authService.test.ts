import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockSupabase } = vi.hoisted(() => {
  return {
    mockSupabase: {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        getUser: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
    },
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Import after mock so the service uses the mocked client
import { AuthService } from '../authService';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
  });

  describe('signUp', () => {
    it('returns user on success', async () => {
      const mockUser = { id: 'u-1', email: 't@x.com' };
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await service.signUp('t@x.com', 'pw12345678');
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('returns error when signUp fails', async () => {
      const err = { message: 'Email already exists', name: 'AuthError', status: 400 };
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: err,
      });

      const result = await service.signUp('t@x.com', 'pw12345678');
      expect(result.user).toBeNull();
      expect(result.error).toEqual(err);
    });
  });

  describe('signIn', () => {
    it('returns session on success', async () => {
      const mockUser = { id: 'u-1', email: 't@x.com' };
      const mockSession = { user: mockUser, access_token: 'tok' };
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await service.signIn('t@x.com', 'pw12345678');
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('returns error on invalid credentials', async () => {
      const err = { message: 'Invalid credentials', name: 'AuthError', status: 400 };
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: err,
      });

      const result = await service.signIn('t@x.com', 'wrong');
      expect(result.error).toEqual(err);
    });
  });

  describe('signOut', () => {
    it('calls supabase signOut', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });
      await service.signOut();
      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
