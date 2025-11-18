# Service Worker Update Notification System

Automated system that alerts users when new versions of the application are available, preventing stale cache issues after deployments.

## Overview

The Service Worker Update Notification system provides:
- **Automatic Update Detection**: Monitors for new Service Worker versions every 60 seconds
- **User Notifications**: Shows toast and persistent banner when updates are available
- **One-Click Reload**: Provides immediate reload action to get latest version
- **Visibility-Based Checks**: Checks for updates when user returns to tab
- **Lifecycle Monitoring**: Tracks Service Worker state changes and controller changes

## Architecture

### Components

#### `ServiceWorkerUpdateNotification` Component
Location: `src/components/ServiceWorkerUpdateNotification.tsx`

**Key Features:**
- Monitors Service Worker registration for updates
- Displays toast notification when update is detected
- Shows persistent banner with reload action
- Handles update lifecycle events
- Cleans up listeners on unmount

**State Management:**
- `registration`: Current ServiceWorker registration
- `showReloadPrompt`: Controls persistent banner visibility

**Update Detection Flow:**
```
1. Component mounts → Get SW registration
2. Listen for 'updatefound' events
3. New worker installing → Monitor state changes
4. New worker installed + controller exists → Show notification
5. User clicks reload → Page reloads with new version
```

### Service Worker Configuration

Location: `vite.config.ts`

**Critical Settings:**
```typescript
VitePWA({
  registerType: 'autoUpdate',    // Auto-register new SW
  injectRegister: 'auto',        // Auto-inject registration
  workbox: {
    skipWaiting: true,           // Activate new SW immediately
    clientsClaim: true,          // Take control of all tabs
    cleanupOutdatedCaches: true, // Delete old caches
    navigateFallback: '/index.html', // SPA fallback
  }
})
```

**Why These Settings Matter:**
- `skipWaiting: true`: New SW activates without waiting for old tabs to close
- `clientsClaim: true`: New SW takes control immediately, no page reload needed
- `cleanupOutdatedCaches: true`: Prevents disk space bloat from old deployments

### Monitoring System

Location: `src/lib/serviceWorkerMonitoring.ts`

**Functions:**
- `getServiceWorkerStatus()`: Get current SW status
- `monitorServiceWorker()`: Set up lifecycle monitoring
- `checkForUpdates()`: Manually check for updates
- `skipWaiting()`: Force SW to activate immediately

**Integration:**
- Initialized in `src/main.tsx`
- Provides logging and debugging capabilities
- Tracks controller changes and state transitions

## User Experience

### Update Detection

**Automatic Checks:**
- Every 60 seconds while app is open
- When tab becomes visible after being hidden
- When Service Worker detects update

**Manual Checks:**
- Users can check from Service Worker Debug page (`/service-worker-debug`)

### Notification Types

#### Toast Notification
- Appears when update is first detected
- Shows "Update Available" message
- Includes "Reload" button
- Duration: Infinity (doesn't auto-dismiss)

#### Persistent Banner
- Appears in bottom-right corner
- Shows detailed update message
- Provides two actions:
  - "Reload Now" - Reloads page immediately
  - "Later" - Dismisses banner (update still available)
- Persists until user takes action

### Visual Design

**Toast:**
```
┌─────────────────────────────┐
│ Update Available            │
│ A new version of the app... │
│                   [Reload]  │
└─────────────────────────────┘
```

**Banner:**
```
┌────────────────────────────────┐
│ [↓] Update Available           │
│     A new version is ready.    │
│     Reload to get latest...    │
│     [Reload Now] [Later]       │
└────────────────────────────────┘
```

## Implementation Details

### Update Check Interval

```typescript
// Check every 60 seconds
const updateCheckInterval = setInterval(() => {
  navigator.serviceWorker.getRegistration().then((reg) => {
    if (reg) {
      reg.update();
    }
  });
}, 60000);
```

### Visibility-Based Checks

```typescript
// Check when tab becomes visible
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && registration) {
    registration.update();
  }
};

document.addEventListener('visibilitychange', handleVisibilityChange);
```

### State Change Monitoring

```typescript
// Monitor new worker state
newWorker.addEventListener('statechange', () => {
  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
    // Show notification - new version ready
    showUpdateNotification();
  }
});
```

### Controller Change Handling

```typescript
// Auto-reload on controller change if notification shown
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (showReloadPrompt) {
    window.location.reload();
  }
});
```

## Testing

### E2E Tests

Location: `e2e/service-worker-updates.spec.ts`

**Test Coverage:**
- Update notification component mounting
- Periodic update checks (60s interval)
- Visibility-based update checks
- Reload button functionality
- Update lifecycle events
- Event listener cleanup

**Running Tests:**
```bash
# Run Service Worker update tests
npx playwright test service-worker-updates

# Run with UI
npx playwright test service-worker-updates --ui

# Run in headed mode
npx playwright test service-worker-updates --headed
```

### Manual Testing

1. **Deploy new version:**
   - Make a code change
   - Build and deploy to production
   - Keep existing tab open

2. **Verify notification:**
   - Wait 60 seconds or switch tabs
   - Check for toast notification
   - Verify banner appears
   - Click "Reload Now"

3. **Test auto-reload:**
   - Deploy another version
   - Wait for notification
   - Don't click reload
   - SW should auto-reload when new version activates

## Production Considerations

### Update Frequency

**Recommendation:** Check every 60 seconds
- Balance between responsiveness and performance
- More frequent checks increase network usage
- Less frequent checks delay user awareness of updates

**Adjust if needed:**
```typescript
// Increase to 5 minutes
const FIVE_MINUTES = 5 * 60 * 1000;
setInterval(() => registration.update(), FIVE_MINUTES);
```

### Notification Duration

**Current:** Toast persists until dismissed (Infinity)

**Why:** Users must be aware of updates
- Critical security fixes need immediate awareness
- UX improvements should be visible quickly
- Prevents confusion from running old versions

**Alternative:**
```typescript
// Auto-dismiss after 30 seconds
toast({
  title: "Update Available",
  duration: 30000, // 30 seconds
});
```

### Deployment Strategy

**Best Practices:**
1. Deploy during low-traffic periods
2. Monitor error rates after deployment
3. Have rollback plan ready
4. Test SW updates in staging first

**Service Worker Versioning:**
- VitePWA automatically versions SW files
- Old versions cleaned up by `cleanupOutdatedCaches`
- No manual versioning needed

## Troubleshooting

### Update Not Detected

**Symptoms:** No notification after deployment

**Causes:**
1. Same SW version (no code changes)
2. Browser cache issues
3. SW registration failed

**Solutions:**
```bash
# 1. Hard refresh browser
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# 2. Check SW registration
Open DevTools → Application → Service Workers

# 3. Unregister SW manually
Open DevTools → Application → Service Workers → Unregister

# 4. Clear all caches
Open DevTools → Application → Storage → Clear site data
```

### Update Loop

**Symptoms:** Page keeps reloading

**Causes:**
1. SW activation failing
2. Controller change loop
3. Cache corruption

**Solutions:**
```typescript
// Add cooldown to prevent reload loops
let lastReload = 0;
const RELOAD_COOLDOWN = 5000; // 5 seconds

const reloadPage = () => {
  const now = Date.now();
  if (now - lastReload > RELOAD_COOLDOWN) {
    lastReload = now;
    window.location.reload();
  }
};
```

### Notification Not Showing

**Symptoms:** Update detected but no UI notification

**Causes:**
1. Toast system not initialized
2. Component not mounted
3. Notification dismissed too quickly

**Solutions:**
1. Check `<Toaster />` in App.tsx
2. Verify `ServiceWorkerUpdateNotification` is mounted
3. Check browser console for errors

### Stale Content After Reload

**Symptoms:** Old version still showing after reload

**Causes:**
1. Browser cache not cleared
2. CDN cache not invalidated
3. SW not activated

**Solutions:**
```typescript
// Force cache bypass
window.location.reload(true); // Hard reload

// Or use skipWaiting
registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
```

## Future Enhancements

### Planned Features

1. **Version Display:**
   - Show current version in notification
   - Display changelog for updates
   - Link to release notes

2. **Update Scheduling:**
   - Allow users to schedule update for later
   - Auto-update during idle periods
   - Respect user preference

3. **Progressive Updates:**
   - Download new version in background
   - Prefetch critical resources
   - Show download progress

4. **Smart Notifications:**
   - Different UI for critical vs optional updates
   - Severity levels (security, feature, bugfix)
   - Smart timing based on user activity

### Implementation Ideas

```typescript
// Version display
interface UpdateInfo {
  version: string;
  releaseNotes: string;
  critical: boolean;
}

// Smart timing
const isUserIdle = () => {
  // Check time since last user interaction
  return Date.now() - lastInteraction > 5 * 60 * 1000;
};

// Progressive download
const preloadNewVersion = async () => {
  // Prefetch critical resources
  await Promise.all([
    fetch('/'),
    fetch('/main.js'),
    fetch('/vendor.js'),
  ]);
};
```

## Related Documentation

- [PWA Configuration](../vite.config.ts)
- [Service Worker Monitoring](../src/lib/serviceWorkerMonitoring.ts)
- [Navigation Tests](../e2e/README-NAVIGATION-TESTS.md)
- [Deployment Guide](https://docs.lovable.dev/)

## Support

For issues or questions:
1. Check browser DevTools → Application → Service Workers
2. Review console logs for errors
3. Test in incognito mode to rule out cache issues
4. Check [Lovable Documentation](https://docs.lovable.dev/)
