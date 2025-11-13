/**
 * Centralized React Query Keys
 * Single source of truth for all query keys to prevent typos and improve refactoring
 */

export const QUERY_KEYS = {
  // Admin features
  ADMIN_USERS: ['admin-users'] as const,
  AUDIT_LOGS: ['audit-logs'] as const,
  
  // Security
  SECURITY_EVENTS: ['security-events'] as const,
  SECURITY_SUMMARY: ['security-summary'] as const,
  BLOCKED_IPS: ['blocked-ips'] as const,
  SUSPICIOUS_IPS: ['suspicious-ips'] as const,
  RECENT_EVENT_COUNT: ['recent-event-count'] as const,
  ACTIVE_BLOCKS_COUNT: ['active-blocks-count'] as const,
  ALERT_HISTORY: ['alert-history'] as const,
  CRON_JOBS: ['cron-jobs'] as const,
  ROLE_CHANGE_AUDIT: ['role-change-audit'] as const,
  
  // Webhook monitoring
  WEBHOOK_STATS: ['webhook-stats'] as const,
  WEBHOOK_SECURITY_EVENTS: ['webhook-security-events'] as const,
  WEBHOOK_DEDUPLICATION_STATS: ['webhook-deduplication-stats'] as const,
  WEBHOOK_DUPLICATES: ['webhook-duplicates'] as const,
  WEBHOOK_RETRY_CHART: ['webhook-retry-chart'] as const,
  RATE_LIMIT_EVENTS: ['rate-limit-events'] as const,
  
  // Email
  EMAIL_SETTINGS: ['email-settings'] as const,
  EMAIL_DELIVERY_STATS: ['email-delivery-stats'] as const,
  RECENT_EMAIL_LOGS: ['recent-email-logs'] as const,
  RESEND_HEALTH: ['resend-health'] as const,
  
  // Performance
  PERFORMANCE_METRICS: (params: any) => ['performance-metrics', params] as const,
  PERFORMANCE_SUMMARY: (startDate: string, endDate: string) => 
    ['performance-summary', startDate, endDate] as const,
  SLOW_OPERATIONS: (startDate: string, endDate: string, limit: number) => 
    ['slow-operations', startDate, endDate, limit] as const,
  
  // User settings
  NOTIFICATION_SETTINGS: (userId: string | undefined) => 
    ['notification-settings', userId] as const,
} as const;

/**
 * Helper to get query key for a specific feature
 */
export type QueryKeyFactory = typeof QUERY_KEYS;
