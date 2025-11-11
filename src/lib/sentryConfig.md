# Sentry Integration Guide

## Overview
This application uses Sentry for production error tracking, performance monitoring, and session replay.

## Setup

### 1. Get Your Sentry DSN
1. Create a free account at [sentry.io](https://sentry.io)
2. Create a new React project
3. Copy your DSN (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)
4. The DSN has been added to your secrets as `SENTRY_DSN`

### 2. Configuration
The integration is automatically configured with:
- ✅ Error tracking with stack traces
- ✅ Performance monitoring (10% sample rate)
- ✅ Session replay (10% of sessions, 100% with errors)
- ✅ User context tracking (automatically synced with auth)
- ✅ Breadcrumbs for debugging context
- ✅ React Router integration
- ✅ Browser profiling

### 3. Features

#### Automatic Error Capture
All errors are automatically captured in production:
```typescript
try {
  riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, { userId: user.id });
  // Automatically sent to Sentry in production
}
```

#### User Context
User context is automatically set/cleared on sign in/out:
```typescript
// Automatic on sign in
setUserContext({
  id: user.id,
  email: user.email,
});

// Automatic on sign out
clearUserContext();
```

#### Breadcrumbs
Debug logging creates breadcrumbs for context:
```typescript
logger.info('User clicked button', { buttonId: 'submit' });
// Creates breadcrumb in Sentry error reports
```

#### Custom Context
Add custom context to errors:
```typescript
import { setCustomContext } from '@/lib/sentry';

setCustomContext('payment', {
  amount: 100,
  currency: 'USD',
  method: 'card',
});
```

#### Manual Error Capture
Capture errors manually when needed:
```typescript
import { captureException, captureMessage } from '@/lib/sentry';

// Capture exception
captureException(error, { 
  component: 'PaymentForm',
  action: 'submit' 
});

// Capture message
captureMessage('Payment processed successfully', 'info');
```

### 4. Environment Variables
Add your Sentry DSN to `.env`:
```
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### 5. Filtered Errors
The following errors are automatically filtered:
- Browser extension errors
- Network errors (Failed to fetch, NetworkError)
- ResizeObserver loop errors
- Console breadcrumbs (to avoid noise)

### 6. Privacy
- All text and media in session replays are captured (customize if needed)
- User emails are tracked (disable if sensitive)
- Error messages are not filtered (customize if needed)

### 7. Monitoring
View errors and performance in your Sentry dashboard:
- **Issues**: All captured errors with stack traces
- **Performance**: Transaction monitoring and slow operations
- **Replays**: Video replay of user sessions with errors
- **Releases**: Track errors by deployment version

## Best Practices

1. **Add context to errors**: Use logger with context objects
2. **Set custom context**: Add relevant data before operations
3. **Monitor dashboard regularly**: Check for new issues
4. **Set up alerts**: Configure Sentry alerts for critical errors
5. **Review breadcrumbs**: Use debug logging to understand error context

## Costs
- Free tier: 5,000 errors/month + 50 replays/month
- Paid tiers available for production apps with high traffic

## Support
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [React Router Integration](https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)
