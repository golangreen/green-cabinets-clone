/**
 * Error Service Module
 * Centralized error handling exports
 */

// Re-export everything from sub-modules
export * from './errorLogger';
export * from './errorNotification';
export * from './errorRecovery';
export * from './errorAnalytics';

// Legacy compatibility: export errorService object for gradual migration
import * as errorLogger from './errorLogger';
import * as errorNotification from './errorNotification';
import * as errorRecovery from './errorRecovery';
import * as errorAnalytics from './errorAnalytics';

export const errorService = {
  ...errorLogger,
  ...errorNotification,
  ...errorRecovery,
  ...errorAnalytics,
};
