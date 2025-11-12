/**
 * useRoleOperations Hook
 * Manages role assignment/removal operations with notifications
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { AssignRoleParams, BulkAssignParams, ExtendRoleParams } from '@/types/admin';
import type { UserWithRoles } from '@/services/roleService';
import {
  assignRole,
  removeRole,
  bulkAssignRole,
  bulkRemoveRole,
  extendRoleExpiration,
  getCurrentUserEmail,
  sendRoleNotification,
  type AppRole,
} from '@/services/roleService';

export function useRoleOperations(users?: UserWithRoles[]) {
  const queryClient = useQueryClient();

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role, expiresAt }: AssignRoleParams) => {
      await assignRole({ userId, role: role as AppRole, expiresAt });

      // Send notification email
      const targetUser = users?.find((u) => u.user_id === userId);
      if (targetUser?.email) {
        const performerEmail = await getCurrentUserEmail();

        try {
          await sendRoleNotification({
            userEmail: targetUser.email,
            action: 'assigned',
            role: role as AppRole,
            performedBy: performerEmail,
          });
        } catch (emailError) {
          logger.error('Failed to send role assignment notification', emailError, {
            userId: targetUser.user_id,
            role,
            component: 'useRoleOperations',
          });
        }
      }
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.role} role assigned successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign role');
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'moderator' | 'user' }) => {
      await removeRole(userId, role as AppRole);

      // Send notification email
      const targetUser = users?.find((u) => u.user_id === userId);
      if (targetUser?.email) {
        const performerEmail = await getCurrentUserEmail();

        try {
          await sendRoleNotification({
            userEmail: targetUser.email,
            action: 'removed',
            role: role as AppRole,
            performedBy: performerEmail,
          });
        } catch (emailError) {
          logger.error('Failed to send role removal notification', emailError, {
            userId: targetUser.user_id,
            role,
            component: 'useRoleOperations',
          });
        }
      }
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.role} role removed successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove role');
    },
  });

  // Bulk add role mutation
  const bulkAddRoleMutation = useMutation({
    mutationFn: async ({ userIds, role }: BulkAssignParams) => {
      const result = await bulkAssignRole(userIds, role as AppRole);

      // Send notification emails
      const performerEmail = await getCurrentUserEmail();

      const emailPromises = userIds.map((userId) => {
        const targetUser = users?.find((u) => u.user_id === userId);
        if (!targetUser?.email) return Promise.resolve();

        return sendRoleNotification({
          userEmail: targetUser.email,
          action: 'assigned',
          role: role as AppRole,
          performedBy: performerEmail,
        }).catch((err) =>
          logger.error('Failed to send bulk assignment notification', err, {
            userId,
            role,
            component: 'useRoleOperations',
          })
        );
      });

      await Promise.allSettled(emailPromises);
      return result;
    },
    onSuccess: (data) => {
      const message = (data as any)?.message || 'Roles assigned successfully';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign roles');
    },
  });

  // Bulk remove role mutation
  const bulkRemoveRoleMutation = useMutation({
    mutationFn: async ({ userIds, role }: BulkAssignParams) => {
      const result = await bulkRemoveRole(userIds, role as AppRole);

      // Send notification emails
      const performerEmail = await getCurrentUserEmail();

      const emailPromises = userIds.map((userId) => {
        const targetUser = users?.find((u) => u.user_id === userId);
        if (!targetUser?.email) return Promise.resolve();

        return sendRoleNotification({
          userEmail: targetUser.email,
          action: 'removed',
          role: role as AppRole,
          performedBy: performerEmail,
        }).catch((err) =>
          logger.error('Failed to send bulk removal notification', err, {
            userId,
            role,
            component: 'useRoleOperations',
          })
        );
      });

      await Promise.allSettled(emailPromises);
      return result;
    },
    onSuccess: (data) => {
      const message = (data as any)?.message || 'Roles removed successfully';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove roles');
    },
  });

  // Extend role mutation
  const extendRoleMutation = useMutation({
    mutationFn: async ({ userId, role, newExpiresAt }: ExtendRoleParams) => {
      await extendRoleExpiration({
        userId,
        role: role as AppRole,
        newExpiresAt,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.role} role expiration extended successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to extend role');
    },
  });

  return {
    addRole: addRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    bulkAddRole: bulkAddRoleMutation.mutate,
    bulkRemoveRole: bulkRemoveRoleMutation.mutate,
    extendRole: extendRoleMutation.mutate,
    isAddingRole: addRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
    isBulkAdding: bulkAddRoleMutation.isPending,
    isBulkRemoving: bulkRemoveRoleMutation.isPending,
    isExtending: extendRoleMutation.isPending,
  };
}
