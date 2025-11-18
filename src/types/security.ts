/**
 * Security and Monitoring Types
 */

export interface SecurityEvent {
  id: string;
  function_name: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  client_ip: string;
  created_at: string;
  details: Record<string, any> | null;
}

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  blocked_until: string;
  auto_blocked: boolean;
  violation_count: number;
  details: Record<string, any> | null;
}

export interface WebhookEvent {
  id: string;
  svix_id: string;
  event_type: string;
  client_ip: string | null;
  retry_count: number | null;
  processed_at: string;
  created_at: string;
}

export interface AlertSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  webhook_security_enabled: boolean;
  rate_limit_enabled: boolean;
  webhook_retry_enabled: boolean;
  webhook_duplicate_enabled: boolean;
  severity_threshold: 'low' | 'medium' | 'high' | 'critical';
  retry_threshold: number;
  sound_enabled: boolean;
  updated_at: string;
  created_at: string;
}

export interface SecuritySummary {
  event_type: string;
  event_count: number;
  unique_ips: number;
  severity: string;
}

export interface SuspiciousIP {
  client_ip: string;
  violation_count: number;
  functions_affected: string[];
  first_violation: string;
  last_violation: string;
}
