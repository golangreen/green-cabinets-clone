/**
 * Standardized error handling for edge functions
 */
import { corsHeaders } from './cors.ts';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export function createErrorResponse(error: unknown): Response {
  const appError = error instanceof AppError
    ? error
    : new AppError('Internal server error');

  return new Response(
    JSON.stringify({
      error: appError.message,
      code: appError.code,
    }),
    {
      status: appError.statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
