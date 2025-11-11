/**
 * Role Service
 * Business logic for role management operations
 */

import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'moderator' | 'user';

export interface UserWithRoles {
  user_id: string;
  email: string;
  created_at: string;
  roles: AppRole[];
  role_details: Array<{
    role: AppRole;
    is_temporary: boolean;
    expires_at: string | null;
    reminder_sent: boolean;
  }>;
}

export interface RoleAssignment {
  userId: string;
  role: AppRole;
  expiresAt?: string | null;
}

export interface RoleExtension {
  userId: string;
  role: AppRole;
  newExpiresAt: string;
}

/**
 * Fetch all users with their roles (admin only)
 */
export async function fetchUsersWithRoles(): Promise<UserWithRoles[]> {
  const { data, error } = await supabase.rpc('get_all_users_with_roles');
  if (error) throw error;
  return data as unknown as UserWithRoles[];
}

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: role
  });
  if (error) throw error;
  return data || false;
}

/**
 * Assign a role to a user
 */
export async function assignRole(assignment: RoleAssignment): Promise<void> {
  const { error } = await supabase.rpc('add_user_role', {
    target_user_id: assignment.userId,
    target_role: assignment.role,
    expiration_date: assignment.expiresAt || null
  });
  if (error) throw error;
}

/**
 * Remove a role from a user
 */
export async function removeRole(userId: string, role: AppRole): Promise<void> {
  const { error } = await supabase.rpc('remove_user_role', {
    target_user_id: userId,
    target_role: role
  });
  if (error) throw error;
}

/**
 * Bulk assign roles to multiple users
 */
export async function bulkAssignRole(userIds: string[], role: AppRole): Promise<{
  affectedCount: number;
  totalUsers: number;
}> {
  const { data, error } = await supabase.rpc('bulk_add_user_role', {
    target_user_ids: userIds,
    target_role: role
  });
  if (error) throw error;
  const result = data as any;
  return {
    affectedCount: result.affected_count,
    totalUsers: result.total_users
  };
}

/**
 * Bulk remove roles from multiple users
 */
export async function bulkRemoveRole(userIds: string[], role: AppRole): Promise<{
  affectedCount: number;
  totalUsers: number;
}> {
  const { data, error } = await supabase.rpc('bulk_remove_user_role', {
    target_user_ids: userIds,
    target_role: role
  });
  if (error) throw error;
  const result = data as any;
  return {
    affectedCount: result.affected_count,
    totalUsers: result.total_users
  };
}

/**
 * Extend role expiration date
 */
export async function extendRoleExpiration(extension: RoleExtension): Promise<void> {
  const { error } = await supabase.rpc('extend_role_expiration', {
    target_user_id: extension.userId,
    target_role: extension.role,
    new_expiration_date: extension.newExpiresAt
  });
  if (error) throw error;
}

/**
 * Get roles expiring within specified days
 */
export async function getExpiringRoles(daysAhead: number = 7): Promise<Array<{
  user_id: string;
  user_email: string;
  role: AppRole;
  expires_at: string;
  days_until_expiry: number;
}>> {
  const { data, error } = await supabase.rpc('get_roles_expiring_within_days', {
    days_ahead: daysAhead
  });
  if (error) throw error;
  return data || [];
}

/**
 * Bulk extend role expirations
 */
export async function bulkExtendRoleExpiration(
  extensions: Array<{
    user_id: string;
    role: AppRole;
    new_expiration: string;
  }>
): Promise<{
  extendedCount: number;
  failedCount: number;
}> {
  const { data, error } = await supabase.rpc('bulk_extend_role_expiration', {
    role_extensions: extensions
  });
  if (error) throw error;
  const result = data as any;
  return {
    extendedCount: result.extended_count,
    failedCount: result.failed_count
  };
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: AppRole): string {
  const names: Record<AppRole, string> = {
    admin: 'Administrator',
    moderator: 'Moderator',
    user: 'User'
  };
  return names[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: AppRole): string {
  const colors: Record<AppRole, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    moderator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    user: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  };
  return colors[role] || colors.user;
}

/**
 * Check if role is temporary (has expiration)
 */
export function isTemporaryRole(roleDetails: UserWithRoles['role_details'][0]): boolean {
  return roleDetails.is_temporary && roleDetails.expires_at !== null;
}

/**
 * Calculate days until role expires
 */
export function getDaysUntilExpiry(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format role expiration for display
 */
export function formatRoleExpiration(expiresAt: string | null): string {
  if (!expiresAt) return 'Permanent';
  
  const days = getDaysUntilExpiry(expiresAt);
  if (days === null) return 'Permanent';
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `Expires in ${days} days`;
}

/**
 * Validate role assignment
 */
export function validateRoleAssignment(assignment: RoleAssignment): {
  isValid: boolean;
  error?: string;
} {
  if (!assignment.userId) {
    return { isValid: false, error: 'User ID is required' };
  }
  if (!assignment.role) {
    return { isValid: false, error: 'Role is required' };
  }
  if (!['admin', 'moderator', 'user'].includes(assignment.role)) {
    return { isValid: false, error: 'Invalid role' };
  }
  if (assignment.expiresAt) {
    const expiryDate = new Date(assignment.expiresAt);
    if (expiryDate <= new Date()) {
      return { isValid: false, error: 'Expiration date must be in the future' };
    }
  }
  return { isValid: true };
}

/**
 * Get user's highest priority role
 */
export function getHighestRole(roles: AppRole[]): AppRole | null {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('moderator')) return 'moderator';
  if (roles.includes('user')) return 'user';
  return null;
}

/**
 * Get current user's email from session
 */
export async function getCurrentUserEmail(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.email || 'System Administrator';
}

/**
 * Send role change notification email
 */
export async function sendRoleNotification(params: {
  userEmail: string;
  action: 'assigned' | 'removed';
  role: AppRole;
  performedBy: string;
}): Promise<void> {
  await supabase.functions.invoke('send-role-notification', {
    body: params
  });
}
