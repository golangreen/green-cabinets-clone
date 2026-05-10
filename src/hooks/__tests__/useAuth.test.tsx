import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const { mockAuthService } = vi.hoisted(() => ({
  mockAuthService: {
    getUser: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}));

vi.mock('@/services', () => ({
  authService: mockAuthService,
}));

import { useAuth } from '../useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthService.getUser.mockResolvedValue({ user: null, error: null });
    mockAuthService.onAuthStateChange.mockReturnValue(() => {});
  });

  it('starts in loading state then resolves to no user', async () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('loads existing user on mount', async () => {
    const mockUser = { id: 'u-1', email: 't@x.com' } as never;
    mockAuthService.getUser.mockResolvedValueOnce({ user: mockUser, error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('signIn sets user on success', async () => {
    const mockUser = { id: 'u-2', email: 'a@b.com' } as never;
    mockAuthService.signIn.mockResolvedValueOnce({ user: mockUser, session: {}, error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn('a@b.com', 'pw12345678');
    });
    expect(mockAuthService.signIn).toHaveBeenCalledWith('a@b.com', 'pw12345678');
    expect(result.current.user).toEqual(mockUser);
  });

  it('signOut clears user when no error', async () => {
    const mockUser = { id: 'u-3', email: 'x@y.com' } as never;
    mockAuthService.getUser.mockResolvedValueOnce({ user: mockUser, error: null });
    mockAuthService.signOut.mockResolvedValueOnce({ error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    await act(async () => {
      await result.current.signOut();
    });
    expect(result.current.user).toBeNull();
    expect(mockAuthService.signOut).toHaveBeenCalledTimes(1);
  });
});
