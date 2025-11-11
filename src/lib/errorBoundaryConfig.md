# Error Boundary Configuration

## Overview
The application uses Sentry's React Error Boundary to catch component errors and prevent white screen crashes.

## Features

### ✅ Automatic Error Capture
- Catches all React component errors
- Automatically reports to Sentry in production
- Shows user-friendly fallback UI

### ✅ Beautiful Fallback UI
- Professional error screen with branding
- Helpful actions (reload, go home, report)
- Error details in development mode
- Event ID for production support

### ✅ User Actions
1. **Reload Page** - Refresh to try again
2. **Go to Home** - Navigate back to safety
3. **Report Issue** - Pre-filled email to support

## Implementation

### Main Error Boundary (App Level)
Located in `src/main.tsx`:
```typescript
<Sentry.ErrorBoundary 
  fallback={ErrorFallback}
  showDialog={false}
>
  <App />
</Sentry.ErrorBoundary>
```

### Fallback Component
Located in `src/components/layout/ErrorFallback.tsx`:
- Shows error details in development
- Shows event ID in production
- Provides recovery actions
- Email support integration

## Testing

### Development Testing
Use the `TestErrorButton` component to trigger test errors:

```typescript
import { TestErrorButton } from '@/components/layout';

function MyComponent() {
  return (
    <div>
      <TestErrorButton /> {/* Dev only - not shown in production */}
    </div>
  );
}
```

Click the "Test Error" button in the bottom-right to see the error boundary in action.

### Manual Testing
Add this code temporarily to any component:
```typescript
const [shouldError, setShouldError] = useState(false);

if (shouldError) {
  throw new Error('Test error');
}

<button onClick={() => setShouldError(true)}>Trigger Error</button>
```

## Error Information

### Development Mode
Shows:
- Full error message
- Stack trace
- Component stack
- Event ID (if Sentry connected)

### Production Mode
Shows:
- User-friendly message
- Event ID for support reference
- Helpful recovery actions
- No sensitive error details

## Multiple Error Boundaries

You can add additional error boundaries for specific features:

```typescript
import * as Sentry from '@sentry/react';
import { ErrorFallback } from '@/components/layout';

function FeatureComponent() {
  return (
    <Sentry.ErrorBoundary
      fallback={ErrorFallback}
      beforeCapture={(scope) => {
        scope.setTag('feature', 'payment');
      }}
    >
      <PaymentForm />
    </Sentry.ErrorBoundary>
  );
}
```

## Best Practices

1. **Keep Error Boundaries High** - Place at app level and feature level
2. **Provide Recovery** - Always give users a way to recover
3. **Log Context** - Add tags/context before error boundaries
4. **Test Regularly** - Use TestErrorButton in development
5. **Monitor Sentry** - Check dashboard for caught errors

## Recovery Strategies

### 1. Reload Current Page
```typescript
window.location.reload();
```

### 2. Navigate to Safe Route
```typescript
navigate('/');
```

### 3. Reset Component State
```typescript
resetError(); // Provided by Sentry.ErrorBoundary
```

### 4. Clear Cache/Storage
```typescript
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

## Sentry Integration

Errors caught by Error Boundary are:
- Automatically sent to Sentry
- Tagged with component stack
- Include user context (if authenticated)
- Include breadcrumbs from logger

### Event ID
Each error gets a unique event ID that can be used to:
- Reference specific errors in support
- Search Sentry dashboard
- Link user reports to errors

## Support Email Integration

The "Report Issue" button pre-fills an email with:
- Error message
- Event ID
- Prompt for user description

Email template:
```
To: support@greencabinets.com
Subject: Error Report: {ErrorName}

Error: {error.message}
Event ID: {eventId}

Please describe what you were doing when this error occurred:
```

## Fallback UI Customization

To customize the error screen, edit `src/components/layout/ErrorFallback.tsx`:
- Change styling/branding
- Add custom actions
- Modify error display
- Change email recipient

## Common Errors Caught

1. **Component Lifecycle Errors** - useEffect, useState issues
2. **Render Errors** - JSX/rendering problems
3. **Event Handler Errors** - onClick, onChange issues
4. **Async Errors** - Unhandled promise rejections in components
5. **Third-party Library Errors** - External package issues

## Limitations

Error Boundaries do NOT catch:
- Event handler errors (use try-catch)
- Async code errors (use try-catch)
- Server-side rendering errors
- Errors in error boundary itself

For these, use manual error handling with logger.error().

## Monitoring

Check Sentry dashboard for:
- Error frequency
- Affected users
- Component stacks
- Recovery success rate

Set up alerts for:
- New error types
- Error spike detection
- Critical error patterns
