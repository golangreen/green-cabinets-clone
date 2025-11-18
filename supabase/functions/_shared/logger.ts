/**
 * Structured logging utility for edge functions
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  functionName: string;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

export class Logger {
  constructor(private context: LogContext) {}

  private log(level: LogLevel, message: string, data?: unknown) {
    const logEntry: Record<string, unknown> = {
      level,
      timestamp: new Date().toISOString(),
      message,
      ...this.context,
    };
    if (data !== undefined) {
      logEntry.data = data;
    }
    console.log(JSON.stringify(logEntry));
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data);
  }

  error(message: string, error?: unknown) {
    this.log('error', message, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    });
  }

  debug(message: string, data?: unknown) {
    this.log('debug', message, data);
  }
}

export function createLogger(functionName: string, requestId?: string): Logger {
  return new Logger({ functionName, requestId });
}
