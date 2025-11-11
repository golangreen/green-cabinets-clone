# Feature-Specific Error Boundaries

## Overview
The application uses feature-specific error boundaries around critical components to prevent errors from crashing the entire app while providing tailored recovery strategies.

## Implementation

### Protected Features

#### 1. **Vanity Designer** (`/designer`)
```typescript
<FeatureErrorBoundary
  featureName="Vanity Designer"
  featureTag="vanity-designer"
  fallbackRoute={ROUTES.HOME}
  onReset={() => sessionStorage.removeItem('current_scan')}
>
  <VanityDesigner />
</FeatureErrorBoundary>
```
- **Recovery**: Clear scan data and retry
- **Fallback**: Return to homepage
- **Context**: Designer state, scan session

#### 2. **Checkout** (`/checkout`)
```typescript
<FeatureErrorBoundary
  featureName="Checkout"
  featureTag="checkout"
  fallbackRoute={ROUTES.HOME}
  onReset={() => resetFormData()}
>
  <CheckoutForm />
</FeatureErrorBoundary>
```
- **Recovery**: Reset form data and retry
- **Fallback**: Return to homepage
- **Context**: Cart items, payment processing

#### 3. **Admin Security** (`/admin/security`)
```typescript
<FeatureErrorBoundary
  featureName="Admin Security Dashboard"
  featureTag="admin-security"
  fallbackRoute={ROUTES.HOME}
>
  <SecurityDashboard />
</FeatureErrorBoundary>
```
- **Recovery**: Retry dashboard loading
- **Fallback**: Return to homepage
- **Context**: Security events, blocked IPs

#### 4. **Admin Users** (`/admin/users`)
```typescript
<FeatureErrorBoundary
  featureName="Admin User Management"
  featureTag="admin-users"
  fallbackRoute={ROUTES.HOME}
>
  <AdminUsersDashboard />
</FeatureErrorBoundary>
```
- **Recovery**: Retry user data loading
- **Fallback**: Return to homepage
- **Context**: User list, role assignments

#### 5. **Admin Audit Log** (`/admin/audit-log`)
```typescript
<FeatureErrorBoundary
  featureName="Admin Audit Log"
  featureTag="admin-audit"
  fallbackRoute={ROUTES.HOME}
>
  <AdminAuditDashboard />
</FeatureErrorBoundary>
```
- **Recovery**: Retry audit log loading
- **Fallback**: Return to homepage
- **Context**: Audit records, filters

## Architecture

### Two-Tier Error Handling

```
App Level (main.tsx)
└── Sentry.ErrorBoundary (catches all unhandled errors)
    └── App Component
        └── Feature Level (pages)
            ├── FeatureErrorBoundary (vanity-designer)
            ├── FeatureErrorBoundary (checkout)
            ├── FeatureErrorBoundary (admin-security)
            ├── FeatureErrorBoundary (admin-users)
            └── FeatureErrorBoundary (admin-audit)
```

### Why Two Tiers?

1. **App-Level** (`Sentry.ErrorBoundary`)
   - Catches catastrophic errors
   - Shows generic error screen
   - Last line of defense

2. **Feature-Level** (`FeatureErrorBoundary`)
   - Catches feature-specific errors
   - Shows contextual error screen
   - Allows feature reset without app reload
   - Provides targeted recovery actions

## Error Context in Sentry

Each error boundary adds tags to Sentry reports:

```typescript
scope.setTag('feature', 'vanity-designer');
scope.setContext('feature', {
  name: 'Vanity Designer',
  fallbackRoute: '/',
});
```

This allows filtering errors by feature in Sentry dashboard.

## Custom Fallback UI

### Feature Fallback Components Show:
- ✅ Feature-specific error message
- ✅ Contextual recovery suggestions
- ✅ Retry button (with custom reset logic)
- ✅ Go Back button (to safe route)
- ✅ Error details (dev mode only)

### Example Fallback:
```
┌─────────────────────────────────────┐
│  ⚠️  Vanity Designer Error          │
│                                     │
│  We encountered an issue with the  │
│  vanity designer. Don't worry -    │
│  your data is safe.                │
│                                     │
│  What you can do:                  │
│  • Try again by clicking "Retry"   │
│  • Go back and try different action│
│                                     │
│  [Retry]  [Go Back]                │
└─────────────────────────────────────┘
```

## Recovery Strategies

### 1. VanityDesigner
**Reset Actions:**
- Clear sessionStorage scan data
- Reset cabinet positions
- Clear undo/redo history

**Why:** Scan data corruption can cause render errors

### 2. Checkout
**Reset Actions:**
- Clear form data
- Reset processing state
- Clear validation errors

**Why:** Payment processing errors shouldn't persist

### 3. Admin Dashboards
**Reset Actions:**
- Retry data fetch
- Clear cached queries
- Reset filters

**Why:** Network errors should allow retry

## Adding New Feature Boundaries

To protect a new feature:

```typescript
import { FeatureErrorBoundary } from '@/components/layout';

function MyFeaturePage() {
  return (
    <FeatureErrorBoundary
      featureName="My Feature Name"    // Display name
      featureTag="my-feature"          // Sentry tag
      fallbackRoute={ROUTES.HOME}      // Safe fallback route
      onReset={() => {                 // Custom reset logic
        // Clear feature-specific state
        localStorage.removeItem('feature-data');
      }}
    >
      <MyFeatureComponent />
    </FeatureErrorBoundary>
  );
}
```

## Best Practices

### When to Add Feature Boundaries

Add for features that:
1. ✅ Handle complex state (designers, forms)
2. ✅ Process payments or sensitive operations
3. ✅ Fetch large amounts of data
4. ✅ Use third-party integrations
5. ✅ Are admin/privileged operations

Don't add for:
1. ❌ Simple static pages
2. ❌ Navigation components
3. ❌ Individual UI components
4. ❌ Already wrapped features

### Reset Logic Guidelines

**Do Reset:**
- Temporary form data
- Session-specific state
- In-memory caches

**Don't Reset:**
- User authentication
- Persistent user data
- Global app settings

### Fallback Routes

Choose appropriate fallback routes:
- **General features** → Homepage (`/`)
- **Admin features** → Admin home (`/admin`)
- **Nested features** → Parent feature page
- **Critical flows** → Safe checkpoint

## Error Monitoring

### Sentry Dashboard Filtering

Filter by feature tag:
```
feature:vanity-designer
feature:checkout
feature:admin-security
```

### Common Error Patterns

**Vanity Designer:**
- Canvas rendering errors
- 3D preview crashes
- Measurement calculation failures

**Checkout:**
- Payment processing failures
- Validation errors
- Network timeouts

**Admin Dashboards:**
- Data fetching failures
- Permission errors
- Database query issues

## Testing

### Manual Testing

Add to any feature temporarily:
```typescript
<Button onClick={() => { throw new Error('Test feature error'); }}>
  Test Error
</Button>
```

### Expected Behavior

1. Click test button
2. Error caught by feature boundary
3. Feature-specific fallback shown
4. Rest of app still works
5. Error reported to Sentry with feature tag

### Dev vs Production

**Development:**
- Shows full error details
- Console logs error stack
- No Sentry reporting

**Production:**
- Shows user-friendly message
- Reports to Sentry with context
- No sensitive data exposed

## Performance Impact

Feature error boundaries have minimal performance overhead:
- No runtime cost when no errors
- ~1ms overhead on error (negligible)
- Prevents full app crashes (huge benefit)

## Future Enhancements

Potential improvements:
1. **Automatic recovery** - Retry with exponential backoff
2. **State persistence** - Save state before crash
3. **Offline support** - Queue operations for later
4. **Custom analytics** - Track error recovery rates
5. **A/B testing** - Test different fallback UIs
