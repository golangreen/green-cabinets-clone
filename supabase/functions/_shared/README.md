# Shared Edge Function Utilities

This directory contains reusable utilities for Supabase Edge Functions to reduce code duplication and standardize common operations.

## Available Modules

### `cors.ts`
Standard CORS handling for edge functions.

```typescript
import { corsHeaders, handleCorsPreFlight, createCorsResponse, createCorsErrorResponse } from '../_shared/cors.ts';

// Handle CORS preflight
const corsResponse = handleCorsPreFlight(req);
if (corsResponse) return corsResponse;

// Create CORS response
return createCorsResponse({ success: true, data: result });

// Create CORS error response
return createCorsErrorResponse('Invalid input', 400);
```

### `supabase.ts`
Supabase client initialization and utilities.

```typescript
import { createServiceRoleClient, createAuthenticatedClient, getClientIP } from '../_shared/supabase.ts';

// Create service role client (admin access)
const supabase = createServiceRoleClient();

// Create authenticated client (user access with RLS)
const authHeader = req.headers.get('authorization');
const supabase = createAuthenticatedClient(authHeader);

// Get client IP address
const clientIP = getClientIP(req);
```

### `security.ts`
Security checks, IP blocking, and event logging.

```typescript
import { isIPBlocked, logSecurityEvent, checkRateLimit, verifyRecaptcha } from '../_shared/security.ts';

// Check if IP is blocked
const blocked = await isIPBlocked(supabase, clientIP);
if (blocked) {
  return createCorsErrorResponse('Access denied', 403);
}

// Log security event
await logSecurityEvent(supabase, {
  eventType: 'rate_limit_exceeded',
  clientIP,
  functionName: 'my-function',
  severity: 'high',
  details: { requestCount: 15 }
});

// Check rate limit
const rateLimitExceeded = checkRateLimit(clientIP, 10, 60000);
if (rateLimitExceeded) {
  await logSecurityEvent(supabase, {
    eventType: 'rate_limit_exceeded',
    clientIP,
    functionName: 'my-function',
    severity: 'medium'
  });
  return createCorsErrorResponse('Rate limit exceeded', 429);
}

// Verify reCAPTCHA
const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');
const isValid = await verifyRecaptcha(token, secretKey);
```

### `logger.ts`
Structured logging for edge functions.

```typescript
import { createLogger, generateRequestId } from '../_shared/logger.ts';

const requestId = generateRequestId();
const logger = createLogger({ functionName: 'my-function', requestId });

logger.info('Processing request', { userId: 123 });
logger.warn('Suspicious activity detected', { ip: clientIP });
logger.error('Failed to process', error, { context: 'checkout' });
```

### `errors.ts`
Standardized error handling and responses.

```typescript
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  createErrorResponse, 
  handleError,
  withErrorHandling 
} from '../_shared/errors.ts';

// Throw custom errors
throw new ValidationError('Invalid email', { field: 'email' });
throw new AuthenticationError('Token expired');
throw new AppError('Custom error', 400, 'CUSTOM_ERROR');

// Create error response
return createErrorResponse(error);

// Handle errors safely
return handleError(error, logger.error);

// Wrap handler with error handling
const handler = withErrorHandling(async (req: Request) => {
  // Your handler code
  return createCorsResponse({ success: true });
}, logger.error);
```

### `types.ts`
Shared TypeScript types and utilities.

```typescript
import { SuccessResponse, ErrorResponse, RequestMetadata, extractRequestMetadata } from '../_shared/types.ts';

// Extract request metadata
const metadata = extractRequestMetadata(req);

// Type-safe responses
const response: SuccessResponse<{ id: string }> = {
  success: true,
  data: { id: '123' },
  message: 'Created successfully'
};
```

## Example Usage

Here's a complete example of an edge function using the shared utilities:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { handleCorsPreFlight, createCorsResponse } from "../_shared/cors.ts";
import { createServiceRoleClient, getClientIP } from "../_shared/supabase.ts";
import { isIPBlocked, checkRateLimit, logSecurityEvent } from "../_shared/security.ts";
import { createLogger, generateRequestId } from "../_shared/logger.ts";
import { ValidationError, withErrorHandling } from "../_shared/errors.ts";

const requestSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1).max(1000),
});

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  const corsResponse = handleCorsPreFlight(req);
  if (corsResponse) return corsResponse;

  // Initialize logger
  const requestId = generateRequestId();
  const logger = createLogger({ functionName: 'my-function', requestId });
  logger.info('Request received');

  // Get client IP
  const clientIP = getClientIP(req);
  
  // Initialize Supabase
  const supabase = createServiceRoleClient();

  // Security checks
  const blocked = await isIPBlocked(supabase, clientIP);
  if (blocked) {
    logger.warn('Blocked IP attempted access', { ip: clientIP });
    return createCorsResponse({ error: 'Access denied' }, 403);
  }

  const rateLimitExceeded = checkRateLimit(clientIP, 10, 60000);
  if (rateLimitExceeded) {
    await logSecurityEvent(supabase, {
      eventType: 'rate_limit_exceeded',
      clientIP,
      functionName: 'my-function',
      severity: 'medium'
    });
    logger.warn('Rate limit exceeded', { ip: clientIP });
    return createCorsResponse({ error: 'Too many requests' }, 429);
  }

  // Parse and validate request
  const body = await req.json();
  const validation = requestSchema.safeParse(body);
  
  if (!validation.success) {
    throw new ValidationError('Invalid request data', validation.error.flatten());
  }

  // Process request
  logger.info('Processing request', { email: validation.data.email });
  // ... your business logic ...

  logger.info('Request completed successfully');
  return createCorsResponse({ success: true, data: result });
};

// Wrap handler with error handling
serve(withErrorHandling(handler, (msg, error) => {
  const logger = createLogger({ functionName: 'my-function' });
  logger.error(msg, error);
}));
```

## Best Practices

1. **Always use service role client for admin operations**: Use `createServiceRoleClient()` when you need to bypass RLS policies.

2. **Use authenticated client for user operations**: Use `createAuthenticatedClient()` when performing user-specific operations that respect RLS.

3. **Log security events**: Always log security-related events (failed auth, rate limits, suspicious activity) using `logSecurityEvent()`.

4. **Check IP blocking**: For public endpoints, always check if an IP is blocked before processing requests.

5. **Implement rate limiting**: Use `checkRateLimit()` to prevent abuse of your endpoints.

6. **Use structured logging**: Use the `createLogger()` utility for consistent, structured logs.

7. **Handle errors gracefully**: Use the error utilities to provide consistent error responses and proper error handling.

8. **Validate input**: Always validate request input using Zod schemas and throw `ValidationError` for invalid data.
