import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import type { User, AssignRoleParams, BulkAssignParams, ExtendRoleParams } from '@/types';

interface RoleDetail {
  role: 'admin' | 'moderator' | 'user';
  is_temporary: boolean;
  expires_at: string | null;
  reminder_sent: boolean;
}

interface UserWithRoles {
  user_id: string;
  email: string;
  created_at: string;
  roles: string[]; // Array of role names as strings
  role_details: RoleDetail[];
}

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<'admin' | 'moderator' | 'user'>('moderator');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch all users with roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users_with_roles');
      if (error) throw error;
      return data as unknown as UserWithRoles[];
    },
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role, expiresAt }: AssignRoleParams) => {
      const { error } = await supabase.rpc('add_user_role', {
        target_user_id: userId,
        target_role: role,
        expiration_date: expiresAt || null,
      });
      if (error) throw error;

      // Send notification email
      const targetUser = users?.find(u => u.user_id === userId);
      if (targetUser?.email) {
        const { data: { session } } = await supabase.auth.getSession();
        const performerEmail = session?.user?.email || 'System Administrator';

        try {
          await supabase.functions.invoke('send-role-notification', {
            body: {
              userEmail: targetUser.email,
              action: 'assigned',
              role,
              performedBy: performerEmail
            }
          });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.role} role assigned successfully`);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign role');
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'moderator' | 'user' }) => {
      const { error } = await supabase.rpc('remove_user_role', {
        target_user_id: userId,
        target_role: role,
      });
      if (error) throw error;

      // Send notification email
      const targetUser = users?.find(u => u.user_id === userId);
      if (targetUser?.email) {
        const { data: { session } } = await supabase.auth.getSession();
        const performerEmail = session?.user?.email || 'System Administrator';

        try {
          await supabase.functions.invoke('send-role-notification', {
            body: {
              userEmail: targetUser.email,
              action: 'removed',
              role,
              performedBy: performerEmail
            }
          });
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.role} role removed successfully`);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove role');
    }
  });

  // Bulk add role mutation
  const bulkAddRoleMutation = useMutation({
    mutationFn: async ({ userIds, role }: BulkAssignParams) => {
      const { error, data } = await supabase.rpc('bulk_add_user_role', {
        target_user_ids: userIds,
        target_role: role,
      });
      if (error) throw error;

      // Send notification emails
      const { data: { session } } = await supabase.auth.getSession();
      const performerEmail = session?.user?.email || 'System Administrator';

      const emailPromises = userIds.map(userId => {
        const targetUser = users?.find(u => u.user_id === userId);
        if (!targetUser?.email) return Promise.resolve();

        return supabase.functions.invoke('send-role-notification', {
          body: {
            userEmail: targetUser.email,
            action: 'assigned',
            role,
            performedBy: performerEmail
          }
        }).catch(err => console.error('Failed to send notification:', err));
      });

      await Promise.allSettled(emailPromises);
      return data;
    },
    onSuccess: (data) => {
      const message = (data as any)?.message || 'Roles assigned successfully';
      toast.success(message);
      setSelectedUsers(new Set());
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign roles');
    }
  });

  // Bulk remove role mutation
  const bulkRemoveRoleMutation = useMutation({
    mutationFn: async ({ userIds, role }: BulkAssignParams) => {
      const { error, data } = await supabase.rpc('bulk_remove_user_role', {
        target_user_ids: userIds,
        target_role: role,
      });
      if (error) throw error;

      // Send notification emails
      const { data: { session } } = await supabase.auth.getSession();
      const performerEmail = session?.user?.email || 'System Administrator';

      const emailPromises = userIds.map(userId => {
        const targetUser = users?.find(u => u.user_id === userId);
        if (!targetUser?.email) return Promise.resolve();

        return supabase.functions.invoke('send-role-notification', {
          body: {
            userEmail: targetUser.email,
            action: 'removed',
            role,
            performedBy: performerEmail
          }
        }).catch(err => console.error('Failed to send notification:', err));
      });

      await Promise.allSettled(emailPromises);
      return data;
    },
    onSuccess: (data) => {
      const message = (data as any)?.message || 'Roles removed successfully';
      toast.success(message);
      setSelectedUsers(new Set());
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove roles');
    }
  });

  // Extend role mutation
  const extendRoleMutation = useMutation({
    mutationFn: async ({ userId, role, newExpiresAt }: ExtendRoleParams) => {
      const { error } = await supabase.rpc('extend_role_expiration', {
        target_user_id: userId,
        target_role: role,
        new_expiration_date: newExpiresAt,
      });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.role} role expiration extended successfully`);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to extend role');
    }
  });

  // Helper functions
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = (filteredUsers: UserWithRoles[]) => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.user_id)));
    }
  };

  const getRoleDetail = (user: UserWithRoles, role: string): RoleDetail | undefined => {
    return user.role_details?.find(rd => rd.role === role);
  };

  const isRoleExpiringSoon = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 72; // Within 3 days
  };

  const filteredUsers = users?.filter(user =>
    user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return {
    // State
    searchTerm,
    setSearchTerm,
    selectedUsers,
    setSelectedUsers,
    bulkRole,
    setBulkRole,
    debouncedSearch,
    
    // Data
    users: filteredUsers,
    allUsers: users,
    isLoading,
    
    // Mutations
    addRole: addRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    bulkAddRole: () => {
      if (selectedUsers.size === 0) {
        toast.error('Please select at least one user');
        return;
      }
      bulkAddRoleMutation.mutate({
        userIds: Array.from(selectedUsers),
        role: bulkRole
      });
    },
    bulkRemoveRole: () => {
      if (selectedUsers.size === 0) {
        toast.error('Please select at least one user');
        return;
      }
      bulkRemoveRoleMutation.mutate({
        userIds: Array.from(selectedUsers),
        role: bulkRole
      });
    },
    extendRole: extendRoleMutation.mutate,
    
    // Helpers
    toggleUserSelection,
    toggleSelectAll,
    getRoleDetail,
    isRoleExpiringSoon,
    refetch,
  };
};

export type { UserWithRoles, RoleDetail };
