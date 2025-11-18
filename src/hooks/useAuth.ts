/**
 * Custom hook for authentication operations
 * Centralizes auth logic for reuse across components
 */
import { useState, useEffect } from 'react';
import { authService } from '@/services';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    authService.getUser().then(({ user }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const unsubscribe = authService.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (result.user) setUser(result.user);
    return result;
  };

  const signUp = async (email: string, password: string) => {
    const result = await authService.signUp(email, password);
    if (result.user) setUser(result.user);
    return result;
  };

  const signOut = async () => {
    const result = await authService.signOut();
    if (!result.error) setUser(null);
    return result;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
}
