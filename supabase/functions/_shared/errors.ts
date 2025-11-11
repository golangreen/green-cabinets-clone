/**
 * Error Handling Utilities
 * Provides standardized error responses and error handling
 */

import { corsHeaders } from './cors.ts';

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  
  // Server errors (5xx)
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Custom application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = ErrorCodes.INTERNAL_ERROR,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, ErrorCodes.BAD_REQUEST, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ErrorCodes.UNAUTHORIZED, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, ErrorCodes.FORBIDDEN, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, ErrorCodes.RATE_LIMIT, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

/**
 * Create error response with CORS headers
 * 
 * @param error - Error object or message
 * @param statusCode - HTTP status code
 * @returns Response object
 */
export function createErrorResponse(
  error: Error | AppError | string,
  statusCode?: number
): Response {
  let message: string;
  let code: string | undefined;
  let details: Record<string, any> | undefined;
  let status: number;

  if (error instanceof AppError) {
    message = error.message;
    status = error.statusCode;
    code = error.code;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
    status = statusCode || ErrorCodes.INTERNAL_ERROR;
  } else {
    message = error;
    status = statusCode || ErrorCodes.BAD_REQUEST;
  }

  const body = {
    error: message,
    ...(code && { code }),
    ...(details && { details }),
  };

  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Safe error handler that logs and returns appropriate response
 * 
 * @param error - Error object
 * @param logger - Optional logger function
 * @returns Response object
 */
export function handleError(
  error: unknown,
  logger?: (message: string, error?: any) => void
): Response {
  // Log the error if logger provided
  if (logger) {
    logger('Error occurred', error);
  } else {
    console.error('Unhandled error:', error);
  }

  // Don't expose internal error details in production
  if (error instanceof AppError) {
    return createErrorResponse(error);
  }

  // Generic error response for unexpected errors
  return createErrorResponse(
    'An unexpected error occurred',
    ErrorCodes.INTERNAL_ERROR
  );
}

/**
 * Wrap async function with error handling
 * 
 * @param fn - Async function to wrap
 * @param logger - Optional logger
 * @returns Wrapped function
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<Response>>(
  fn: T,
  logger?: (message: string, error?: any) => void
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error, logger);
    }
  }) as T;
}
