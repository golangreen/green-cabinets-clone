/**
 * Security Service
 * Business logic for security operations, IP blocking, and event management
 */

import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  client_ip: string;
  function_name?: string;
  details?: any;
  created_at: string;
}

export interface BlockedIP {
  ip_address: string;
  reason: string;
  blocked_until: string;
  auto_blocked: boolean;
  violation_count: number;
  created_at: string;
}

/**
 * Fetch security events with optional filtering
 */
export async function fetchSecurityEvents(
  timeWindowMinutes: number = 60,
  eventType?: string,
  severity?: string
): Promise<SecurityEvent[]> {
  let query = supabase
    .from('security_events')
    .select('*')
    .gte('created_at', new Date(Date.now() - timeWindowMinutes * 60000).toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  if (eventType) {
    query = query.eq('event_type', eventType);
  }
  
  if (severity) {
    query = query.eq('severity', severity);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Fetch blocked IPs
 */
export async function fetchBlockedIPs(): Promise<BlockedIP[]> {
  const { data, error } = await supabase
    .from('blocked_ips')
    .select('*')
    .gte('blocked_until', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Block an IP address manually
 */
export async function blockIP(
  ipAddress: string,
  reason: string,
  durationHours: number = 24
): Promise<void> {
  const { error } = await supabase.rpc('manual_block_ip', {
    target_ip: ipAddress,
    block_reason: reason,
    block_duration_hours: durationHours,
    performed_by_user: 'admin'
  });

  if (error) throw error;
}

/**
 * Unblock an IP address
 */
export async function unblockIP(
  ipAddress: string,
  reason: string = 'Manual unblock'
): Promise<void> {
  const { error } = await supabase.rpc('unblock_ip', {
    target_ip: ipAddress,
    unblock_reason: reason,
    performed_by_user: 'admin'
  });

  if (error) throw error;
}

/**
 * Get security summary for dashboard
 */
export async function getSecuritySummary(timeWindowMinutes: number = 60): Promise<{
  event_type: string;
  event_count: number;
  unique_ips: number;
  severity: string;
}[]> {
  const { data, error } = await supabase.rpc('get_security_summary', {
    time_window_minutes: timeWindowMinutes
  });

  if (error) throw error;
  return data || [];
}

/**
 * Get suspicious IPs based on violation threshold
 */
export async function getSuspiciousIPs(
  timeWindowMinutes: number = 60,
  threshold: number = 5
): Promise<{
  client_ip: string;
  violation_count: number;
  functions_affected: string[];
  first_violation: string;
  last_violation: string;
}[]> {
  const { data, error } = await supabase.rpc('get_suspicious_ips', {
    time_window_minutes: timeWindowMinutes,
    threshold
  });

  if (error) throw error;
  return data || [];
}

/**
 * Check if an IP is blocked
 */
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_ip_blocked', {
    check_ip: ipAddress
  });

  if (error) throw error;
  return data || false;
}

/**
 * Get severity color for display
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    case 'high':
      return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    case 'low':
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
  }
}

/**
 * Format IP address for display (truncate if needed)
 */
export function formatIPAddress(ip: string, maxLength: number = 15): string {
  if (ip.length <= maxLength) return ip;
  return ip.substring(0, maxLength - 3) + '...';
}

/**
 * Calculate time until IP unblock
 */
export function getTimeUntilUnblock(blockedUntil: string): string {
  const now = new Date();
  const unblockTime = new Date(blockedUntil);
  const diffMs = unblockTime.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expired';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Group security events by type
 */
export function groupEventsByType(events: SecurityEvent[]): Record<string, SecurityEvent[]> {
  return events.reduce((acc, event) => {
    if (!acc[event.event_type]) {
      acc[event.event_type] = [];
    }
    acc[event.event_type].push(event);
    return acc;
  }, {} as Record<string, SecurityEvent[]>);
}

/**
 * Get unique IP count from events
 */
export function getUniqueIPCount(events: SecurityEvent[]): number {
  const uniqueIPs = new Set(events.map(event => event.client_ip));
  return uniqueIPs.size;
}

/**
 * Fetch webhook events
 */
export async function fetchWebhookEvents(limit: number = 100): Promise<any[]> {
  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

/**
 * Fetch webhook retry data for charts
 */
export async function fetchWebhookRetryData(days: number = 7): Promise<any[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

/**
 * Fetch webhook deduplication statistics
 */
export async function fetchWebhookDeduplicationStats(): Promise<{
  totalEvents: number;
  uniqueIPs: number;
  retentionDays: number;
}> {
  const { data, error, count } = await supabase
    .from('webhook_events')
    .select('client_ip', { count: 'exact' });
  
  if (error) throw error;
  
  const uniqueIPs = new Set(data?.map(e => e.client_ip)).size;
  
  return {
    totalEvents: count || 0,
    uniqueIPs,
    retentionDays: 30
  };
}

/**
 * Fetch alert history
 */
export async function fetchAlertHistory(limit: number = 50): Promise<any[]> {
  const { data, error } = await supabase
    .from('alert_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

/**
 * Fetch email delivery statistics
 */
export async function fetchEmailDeliveryStats(days: number = 7): Promise<{
  sent: number;
  delivered: number;
  bounced: number;
  complained: number;
  delayed: number;
  deliveryRate: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('email_delivery_log')
    .select('status')
    .gte('created_at', startDate.toISOString());
  
  if (error) throw error;
  
  const events = data || [];
  const sent = events.filter(e => e.status === 'sent').length;
  const delivered = events.filter(e => e.status === 'delivered').length;
  const bounced = events.filter(e => e.status === 'bounced').length;
  const complained = events.filter(e => e.status === 'complained').length;
  const delayed = events.filter(e => e.status === 'delayed').length;
  
  const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
  
  return { sent, delivered, bounced, complained, delayed, deliveryRate };
}

/**
 * Fetch recent email delivery logs
 */
export async function fetchRecentEmailLogs(limit: number = 10): Promise<any[]> {
  const { data, error } = await supabase
    .from('email_delivery_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

/**
 * Fetch alert settings for user
 */
export async function fetchAlertSettings(userId: string): Promise<any> {
  const { data, error } = await (supabase as any)
    .from('alert_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

/**
 * Upsert alert settings
 */
export async function upsertAlertSettings(userId: string, settings: Record<string, any>): Promise<void> {
  const { error } = await (supabase as any)
    .from('alert_settings')
    .upsert({ 
      user_id: userId, 
      settings: settings
    });
  
  if (error) throw error;
}

/**
 * Fetch notification settings for user
 */
export async function fetchNotificationSettings(userId: string): Promise<any> {
  const { data, error } = await (supabase as any)
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

/**
 * Upsert notification settings
 */
export async function upsertNotificationSettings(userId: string, settings: Record<string, any>): Promise<void> {
  const { error } = await (supabase as any)
    .from('notification_settings')
    .upsert({ 
      user_id: userId, 
      ...settings 
    });
  
  if (error) throw error;
}
