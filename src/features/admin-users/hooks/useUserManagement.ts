import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { fetchUsersWithRoles } from '@/services/roleService';
import { useUserSelection } from './useUserSelection';
import { useRoleOperations } from './useRoleOperations';

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
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch all users with roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsersWithRoles,
  });

  // User selection state
  const {
    selectedUsers,
    bulkRole,
    setBulkRole,
    toggleUserSelection,
    toggleSelectAll,
    clearSelection,
  } = useUserSelection();

  // Role operations with notifications
  const {
    addRole,
    removeRole,
    bulkAddRole: bulkAddRoleMutation,
    bulkRemoveRole: bulkRemoveRoleMutation,
    extendRole,
  } = useRoleOperations(users);

  // Helper functions

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
    bulkRole,
    setBulkRole,
    debouncedSearch,
    
    // Data
    users: filteredUsers,
    allUsers: users,
    isLoading,
    
    // Mutations
    addRole,
    removeRole,
    bulkAddRole: () => {
      if (selectedUsers.size === 0) {
        toast.error('Please select at least one user');
        return;
      }
      bulkAddRoleMutation({
        userIds: Array.from(selectedUsers),
        role: bulkRole,
      });
      clearSelection();
    },
    bulkRemoveRole: () => {
      if (selectedUsers.size === 0) {
        toast.error('Please select at least one user');
        return;
      }
      bulkRemoveRoleMutation({
        userIds: Array.from(selectedUsers),
        role: bulkRole,
      });
      clearSelection();
    },
    extendRole,
    
    // Helpers
    toggleUserSelection,
    toggleSelectAll,
    clearSelection,
    getRoleDetail,
    isRoleExpiringSoon,
    refetch,
  };
};

export type { UserWithRoles, RoleDetail };
