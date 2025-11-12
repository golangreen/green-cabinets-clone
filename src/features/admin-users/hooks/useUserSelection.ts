/**
 * useUserSelection Hook
 * Manages user selection state for bulk operations
 */

import { useState } from 'react';
import type { UserWithRoles } from '@/services/roleService';

export function useUserSelection() {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<'admin' | 'moderator' | 'user'>('moderator');

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = (users: UserWithRoles[]) => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.user_id)));
    }
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  const isSelected = (userId: string) => {
    return selectedUsers.has(userId);
  };

  const isAllSelected = (users: UserWithRoles[]) => {
    return users.length > 0 && selectedUsers.size === users.length;
  };

  return {
    selectedUsers,
    bulkRole,
    setBulkRole,
    toggleUserSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
  };
}
