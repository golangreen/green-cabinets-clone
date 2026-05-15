/**
 * Custom hook to check if the current user has admin role
 * Uses Supabase RPC function to verify role without exposing service logic
 */
import { useState, useEffect } from 'react';
import { roleService } from '@/services/roleService';
import { useAuth } from './useAuth';

export function useAdminCheck() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminRole() {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        setIsAdmin(await roleService.hasRole(user.id, 'admin'));
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  return {
    isAdmin,
    loading: authLoading || loading,
  };
}
