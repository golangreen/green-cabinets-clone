import { describe, it, expect, beforeEach, vi, waitFor } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { createMockSupabaseClient, TestWrapper } from '@/test/utils';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient(),
}));

describe('useAuth', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('should load user session on mount', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: {
        session: {
          user: mockUser,
          access_token: 'token-123',
        },
      },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should handle sign in', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        user: mockUser,
        session: { user: mockUser, access_token: 'token' },
      },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await result.current.signIn('test@example.com', 'password123');

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('should handle sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper,
    });

    await result.current.signOut();

    expect(result.current.user).toBeNull();
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
