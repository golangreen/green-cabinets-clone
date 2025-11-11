/**
 * Structured logging utility
 * Provides consistent logging throughout the application
 * with environment-aware behavior and Sentry integration
 */

import { captureException, addBreadcrumb } from './sentry';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Debug level - only shown in development
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
    // Add breadcrumb for debugging context in Sentry
    addBreadcrumb(message, { level: 'debug', ...context });
  }

  /**
   * Info level - shown in development only
   */
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
    // Add breadcrumb for context in Sentry
    addBreadcrumb(message, { level: 'info', ...context });
  }

  /**
   * Warning level - shown in all environments
   */
  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || '');
    // Add breadcrumb for warnings
    addBreadcrumb(message, { level: 'warning', ...context });
  }

  /**
   * Error level - shown in all environments
   * Automatically captures errors to Sentry in production
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error || '', context || '');
    
    // Capture error to Sentry in production
    if (import.meta.env.PROD && error) {
      captureException(error, { message, ...context });
    }
  }

  /**
   * Log edge function errors with structured format
   */
  edgeFunctionError(functionName: string, error: Error | unknown, context?: LogContext) {
    this.error(`Edge function ${functionName} failed`, error, context);
  }

  /**
   * Log API call errors
   */
  apiError(endpoint: string, error: Error | unknown, context?: LogContext) {
    this.error(`API call to ${endpoint} failed`, error, context);
  }

  /**
   * Log database operation errors
   */
  dbError(operation: string, error: Error | unknown, context?: LogContext) {
    this.error(`Database ${operation} failed`, error, context);
  }
}

export const logger = new Logger();
