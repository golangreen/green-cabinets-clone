/**
 * Admin and User Management Types
 */

export interface User {
  user_id: string;
  email: string;
  created_at: string;
  roles: string[];
  role_details: RoleDetail[];
}

export interface RoleDetail {
  role: 'admin' | 'moderator' | 'user';
  is_temporary: boolean;
  expires_at: string | null;
  reminder_sent: boolean;
}

export interface AuditLogEntry {
  id: string;
  target_user_id: string;
  target_user_email: string;
  action: string;
  role: string;
  performed_by_id: string;
  performed_by_email: string;
  created_at: string;
  details: Record<string, any> | null;
}

export interface RoleAssignment {
  userId: string;
  role: 'admin' | 'moderator' | 'user';
  isTemporary?: boolean;
  expiresAt?: string;
}

export interface BulkRoleOperation {
  userIds: string[];
  role: 'admin' | 'moderator' | 'user';
  action: 'add' | 'remove';
}
