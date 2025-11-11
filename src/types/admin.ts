export interface User {
  id: string;
  email: string;
  created_at: string;
  roles: UserRole[];
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  expires_at?: string;
  is_temporary: boolean;
  reminder_sent: boolean;
  reminder_3day_sent: boolean;
}

export interface RoleChangeAudit {
  id: string;
  performed_by_id: string;
  performed_by_email: string;
  target_user_id: string;
  target_user_email: string;
  role: 'admin' | 'moderator' | 'user';
  action: 'added' | 'removed' | 'extended';
  details?: Record<string, any>;
  created_at: string;
}

export interface ExpiringRole {
  user_id: string;
  user_email: string;
  role: 'admin' | 'moderator' | 'user';
  expires_at: string;
  is_temporary: boolean;
}

export interface AssignRoleParams {
  userId: string;
  role: 'admin' | 'moderator' | 'user';
  expiresAt?: string;
}

export interface BulkAssignParams {
  userIds: string[];
  role: 'admin' | 'moderator' | 'user';
  expiresAt?: string;
}

export interface ExtendRoleParams {
  userId: string;
  role: 'admin' | 'moderator' | 'user';
  newExpiresAt: string;
}
