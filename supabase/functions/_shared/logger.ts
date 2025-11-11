/**
 * Logging Utilities
 * Provides consistent logging format across edge functions
 */

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration
 */
interface LoggerConfig {
  functionName: string;
  requestId?: string;
}

/**
 * Create a structured logger for edge functions
 * 
 * @param config - Logger configuration
 * @returns Logger object with logging methods
 */
export function createLogger(config: LoggerConfig) {
  const { functionName, requestId } = config;
  const timestamp = () => new Date().toISOString();

  const formatMessage = (level: LogLevel, message: string, meta?: Record<string, any>) => {
    const baseLog = {
      timestamp: timestamp(),
      function: functionName,
      level,
      message,
      ...(requestId && { requestId }),
      ...(meta && { ...meta }),
    };

    return JSON.stringify(baseLog);
  };

  return {
    debug: (message: string, meta?: Record<string, any>) => {
      console.debug(formatMessage('debug', message, meta));
    },

    info: (message: string, meta?: Record<string, any>) => {
      console.log(formatMessage('info', message, meta));
    },

    warn: (message: string, meta?: Record<string, any>) => {
      console.warn(formatMessage('warn', message, meta));
    },

    error: (message: string, error?: Error | any, meta?: Record<string, any>) => {
      const errorMeta = error ? {
        error: {
          message: error.message,
          stack: error.stack,
          ...error,
        },
        ...meta,
      } : meta;

      console.error(formatMessage('error', message, errorMeta));
    },
  };
}

/**
 * Generate a simple request ID
 * 
 * @returns Random request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
