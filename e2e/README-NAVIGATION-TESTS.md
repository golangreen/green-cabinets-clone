# Navigation E2E Tests

Comprehensive end-to-end tests to ensure SPA routing works correctly throughout the application and prevent navigation anti-patterns that cause production failures.

## Test Files

### `navigation-flows.spec.ts`
Tests all navigation flows across the application:
- **SPA Navigation Flows**: Main route navigation, Launch Designer, Shop/Product pages
- **Browser History**: Back/forward button functionality
- **404 Handling**: Not found page navigation
- **Logo Navigation**: Home navigation from any page
- **Mobile Menu**: Mobile navigation functionality
- **Admin Navigation**: Admin route protection and navigation
- **Error Boundary Navigation**: Error recovery navigation
- **Navigation Performance**: Load times and rapid navigation
- **Service Worker Cache**: Cache integrity during navigation

### `navigation-regression.spec.ts`
Prevents specific anti-patterns from reappearing:
- **window.location.href Prevention**: Ensures all navigation uses React Router
- **Service Worker Cache Poisoning**: Prevents 404 errors and blank screens
- **Logo Navigation**: Verifies logo uses href="/" not window.location.href
- **Mobile Navigation**: Ensures mobile menu uses React Router
- **Error Recovery**: Verifies error boundaries use React Router navigation

### `service-worker-updates.spec.ts`
Tests Service Worker update notification system:
- **Update Detection**: Monitors for updatefound events
- **Update Notifications**: Verifies toast and banner notifications
- **Periodic Checks**: Tests 60-second update check interval
- **Visibility-Based Checks**: Tests update checks when page becomes visible
- **Reload Actions**: Verifies reload functionality in notifications
- **Lifecycle Events**: Tests controllerchange and state change handling
- **Cleanup**: Verifies proper cleanup of event listeners and intervals

### `helpers/navigation.ts`
Helper utilities for navigation testing:
- `NavigationTracker`: Detects full page reloads vs SPA navigation
- `clickAndVerifySPANavigation`: Click links and verify no reload
- `testBrowserHistory`: Test back/forward navigation
- `testHeaderNavigation`: Verify all header links use React Router
- `setupConsoleMonitoring`: Track console errors during navigation
- `testServiceWorkerNavigation`: Test navigation with Service Worker active
- `checkForUpdateNotification`: Check if SW update notification is visible
- `testUpdateNotification`: Verify update notification system is active

## Running Tests

```bash
# Run all navigation tests
npx playwright test navigation

# Run only navigation flows
npx playwright test navigation-flows

# Run only regression tests
npx playwright test navigation-regression

# Run only Service Worker update tests
npx playwright test service-worker-updates

# Run with UI
npx playwright test navigation --ui

# Run in headed mode (see browser)
npx playwright test navigation --headed

# Run on specific browser
npx playwright test navigation --project=chromium
```

## Why These Tests Matter

### Production Issues Prevented

1. **Full Page Reloads**: Using `window.location.href` bypasses React Router and causes full page reloads, breaking SPA functionality

2. **Service Worker Cache Poisoning**: Full page reloads combined with Service Worker caching cause stale cached files to be served, resulting in:
   - 404 errors for returning users after deployments
   - Blank screens when cached JavaScript doesn't match new routes
   - Broken navigation for users with old cached versions

3. **Browser History Issues**: Improper navigation breaks back/forward buttons

4. **Mobile Navigation**: Mobile menu must use React Router to avoid reloads

## Anti-Patterns Detected

### ❌ Bad Patterns
```typescript
// BAD: Causes full page reload
window.location.href = '/';

// BAD: Bypasses React Router
<a href="/">Home</a>
```

### ✅ Good Patterns
```typescript
// GOOD: Uses React Router
const navigate = useNavigate();
navigate('/');

// GOOD: React Router Link
<Link to="/">Home</Link>
```

## Test Coverage

### Routes Tested
- `/` - Homepage
- `/shop` - Product catalog
- `/shop/:id` - Product details
- `/about` - About page
- `/contact` - Contact page
- `/designer` - Vanity designer
- `/admin/*` - Admin routes
- `/404` - Not found page

### Navigation Types Tested
- Header navigation (desktop)
- Mobile menu navigation
- Logo navigation
- Footer links
- Browser back/forward
- 404 error recovery
- Error boundary recovery
- Admin route protection

### Device Coverage
- Desktop Chrome
- Desktop Firefox  
- Desktop Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## CI/CD Integration

These tests run automatically on:
- Pull requests to main branch
- Pre-deployment validation
- Post-deployment smoke tests

### Failure Scenarios

Tests will fail if:
- Navigation causes full page reload
- Service Worker serves stale content
- Console errors occur during navigation
- Navigation takes > 3 seconds
- 404 or blank screens appear
- Browser history doesn't work

## Maintenance

### Adding New Routes

When adding new routes to the application:

1. Add route to `navigation-flows.spec.ts`:
```typescript
test('should navigate to new route', async ({ page }) => {
  await page.goto('/new-route');
  await expect(page).toHaveURL(/.*new-route/);
});
```

2. Add to navigation sequence tests if it's accessible from header

3. Verify route doesn't cause reloads:
```typescript
const tracker = new NavigationTracker(page);
await page.click('a[href="/new-route"]');
tracker.assertNoReload();
```

### Debugging Failed Tests

1. **Run with UI**: `npx playwright test navigation --ui`
2. **Check screenshots**: `test-results/screenshots/`
3. **Watch videos**: `test-results/videos/`
4. **Enable trace**: Tests auto-capture trace on first retry
5. **Check console logs**: Tests monitor console for errors

## Best Practices

1. **Always use React Router**: Never use `window.location.href` or plain `<a>` tags for internal navigation

2. **Test on real devices**: Mobile navigation patterns differ from desktop

3. **Test with Service Worker**: Production uses SW caching, test with it active

4. **Monitor console**: Navigation errors often appear in console before visible failures

5. **Test browser history**: Back/forward buttons must work correctly

6. **Verify no reloads**: Use `NavigationTracker` to ensure SPA navigation

## Related Documentation

- [React Router Documentation](https://reactrouter.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Service Worker Navigation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [SPA Best Practices](https://web.dev/vitals/)
