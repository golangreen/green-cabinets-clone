export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: SecuritySeverity;
  function_name: string;
  client_ip: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  details?: Record<string, any>;
  violation_count: number;
  auto_blocked: boolean;
  blocked_at: string;
  blocked_until: string;
  created_at: string;
}

export interface BlockHistory {
  id: string;
  ip_address: string;
  action: 'blocked' | 'unblocked';
  reason?: string;
  auto_blocked: boolean;
  blocked_until?: string;
  performed_by?: string;
  created_at: string;
}

export interface AlertHistory {
  id: string;
  alert_type: string;
  details?: Record<string, any>;
  sent_at: string;
}

export interface AlertSettings {
  id: string;
  setting_key: string;
  setting_value: Record<string, any>;
  description?: string;
  updated_by?: string;
  updated_at: string;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  svix_id: string;
  event_type: string;
  client_ip?: string;
  retry_count: number;
  processed_at: string;
  created_at: string;
}

export interface EmailDeliveryLog {
  id: string;
  email_id: string;
  recipient_email: string;
  email_type: string;
  subject?: string;
  status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'delayed' | 'failed';
  user_id?: string;
  role?: 'admin' | 'moderator' | 'user';
  event_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  webhook_security_enabled: boolean;
  rate_limit_enabled: boolean;
  webhook_retry_enabled: boolean;
  webhook_duplicate_enabled: boolean;
  severity_threshold: SecuritySeverity;
  retry_threshold: number;
  sound_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  blockedIPs: number;
  recentEvents: SecurityEvent[];
}

export interface WebhookStats {
  totalRequests: number;
  validationFailures: number;
  replayAttempts: number;
  uniqueIPs: number;
  failureBreakdown: {
    invalidSignature: number;
    timestampIssues: number;
    rateLimitViolations: number;
  };
}

export interface RateLimitStats {
  totalViolations: number;
  uniqueIPs: number;
  affectedFunctions: string[];
  topOffenders: Array<{
    ip: string;
    count: number;
  }>;
}
