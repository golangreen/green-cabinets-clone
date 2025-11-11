/**
 * Structured logging utility
 * Provides consistent logging throughout the application
 * with environment-aware behavior
 */

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
  }

  /**
   * Info level - shown in development only
   */
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Warning level - shown in all environments
   */
  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * Error level - shown in all environments
   * Consider integrating with error tracking service (Sentry, etc.)
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error || '', context || '');
    
    // TODO: Integrate with error tracking service
    // if (import.meta.env.PROD) {
    //   errorTrackingService.captureException(error, { message, ...context });
    // }
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
