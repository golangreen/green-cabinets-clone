/**
 * Security Configuration
 * Centralized security, rate limiting, and retry settings
 */

export const SECURITY_CONFIG = {
  /**
   * Maximum retry attempts for background sync operations (default: 3)
   * Can be overridden via VITE_MAX_RETRIES environment variable
   */
  MAX_RETRIES: Number(import.meta.env.VITE_MAX_RETRIES) || 3,

  /**
   * Default retry threshold for webhook alerts (default: 3)
   * Can be overridden via VITE_RETRY_THRESHOLD environment variable
   */
  DEFAULT_RETRY_THRESHOLD: Number(import.meta.env.VITE_RETRY_THRESHOLD) || 3,

  /**
   * Default time window for retry monitoring in minutes (default: 10)
   * Can be overridden via VITE_RETRY_TIME_WINDOW environment variable
   */
  DEFAULT_RETRY_TIME_WINDOW_MINUTES: Number(import.meta.env.VITE_RETRY_TIME_WINDOW) || 10,

  /**
   * Time window for security event queries (default: 24 hours in minutes)
   */
  SECURITY_EVENTS_TIME_WINDOW_MINUTES: 24 * 60,

  /**
   * Webhook event retention period (default: 30 days in milliseconds)
   */
  WEBHOOK_EVENT_RETENTION_DAYS: 30,

  /**
   * Maximum webhook signature timestamp age (default: 5 minutes in milliseconds)
   */
  WEBHOOK_MAX_TIMESTAMP_AGE: 5 * 60 * 1000,

  /**
   * Future webhook timestamp tolerance (default: 1 minute in milliseconds)
   */
  WEBHOOK_FUTURE_TIMESTAMP_TOLERANCE: 1 * 60 * 1000,

  /**
   * Role expiration warning thresholds
   */
  ROLE_EXPIRATION: {
    /**
     * Days before expiration to show warning (default: 7)
     */
    WARNING_DAYS: 7,

    /**
     * Days before expiration to send 3-day reminder (default: 3)
     */
    REMINDER_3DAY: 3,

    /**
     * Days before expiration to send 1-day reminder (default: 1)
     */
    REMINDER_1DAY: 1,
  },
} as const;

/**
 * Validate retry count
 */
export function validateRetryCount(count: number): number {
  return Math.max(1, Math.min(count, 10));
}

/**
 * Validate time window in minutes
 */
export function validateTimeWindow(minutes: number): number {
  return Math.max(1, Math.min(minutes, 60));
}
