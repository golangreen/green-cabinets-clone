import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sign in successfully', async () => {
    const mockResponse = { data: { user: { id: '123' } }, error: null };
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(mockResponse as any);

    const result = await authService.signIn('test@example.com', 'password');
    
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(result.data.user?.id).toBe('123');
  });

  it('should sign out', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    await authService.signOut();
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
