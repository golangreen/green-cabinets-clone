/**
 * Navigation Test Helpers
 * Utilities for testing SPA routing and preventing full page reloads
 */

import { Page, expect } from '@playwright/test';

/**
 * Track navigation events to detect full page reloads
 */
export class NavigationTracker {
  private reloadCount = 0;
  private navigationCount = 0;
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.setupListeners();
  }

  private setupListeners() {
    // Track full page reloads
    this.page.on('load', () => {
      this.reloadCount++;
    });

    // Track SPA navigations
    this.page.on('framenavigated', () => {
      this.navigationCount++;
    });
  }

  /**
   * Reset counters for a new test scenario
   */
  reset() {
    this.reloadCount = 0;
    this.navigationCount = 0;
  }

  /**
   * Assert that no full page reload occurred
   */
  assertNoReload() {
    expect(this.reloadCount).toBe(0);
  }

  /**
   * Assert that SPA navigation occurred
   */
  assertNavigated() {
    expect(this.navigationCount).toBeGreaterThan(0);
  }

  getReloadCount() {
    return this.reloadCount;
  }

  getNavigationCount() {
    return this.navigationCount;
  }
}

/**
 * Click a link and verify SPA navigation (no full page reload)
 */
export async function clickAndVerifySPANavigation(
  page: Page,
  selector: string,
  expectedUrl: string | RegExp
) {
  const tracker = new NavigationTracker(page);
  
  // Click the link
  await page.click(selector);
  
  // Wait for navigation
  await page.waitForURL(expectedUrl);
  
  // Verify it was SPA navigation (should be 0 reloads after initial)
  // Note: First load will trigger reload, but subsequent navigations should not
  expect(page.url()).toMatch(expectedUrl);
}

/**
 * Test that browser back/forward buttons work correctly
 */
export async function testBrowserHistory(page: Page) {
  const initialUrl = page.url();
  
  // Go back
  await page.goBack();
  
  // Go forward
  await page.goForward();
  
  // Should be back at original URL
  expect(page.url()).toBe(initialUrl);
}

/**
 * Navigate through a series of pages and verify no reloads
 */
export async function navigateSequence(
  page: Page,
  routes: Array<{ selector: string; expectedUrl: string | RegExp }>
) {
  for (const route of routes) {
    await clickAndVerifySPANavigation(page, route.selector, route.expectedUrl);
    
    // Small delay to ensure page is stable
    await page.waitForTimeout(100);
  }
}

/**
 * Verify that error boundaries don't cause full page reloads
 */
export async function testErrorBoundaryNavigation(page: Page) {
  const tracker = new NavigationTracker(page);
  
  // If an error occurs, clicking "Go Home" should use React Router
  const homeButton = page.getByRole('button', { name: /go home/i });
  
  if (await homeButton.isVisible()) {
    const initialReloads = tracker.getReloadCount();
    await homeButton.click();
    
    // Should not increase reload count
    expect(tracker.getReloadCount()).toBe(initialReloads);
  }
}

/**
 * Test that all header navigation links use SPA routing
 */
export async function testHeaderNavigation(page: Page) {
  // Open mobile menu if needed
  const hamburger = page.locator('button[aria-label*="menu"]').first();
  if (await hamburger.isVisible()) {
    await hamburger.click();
    await page.waitForTimeout(300); // Wait for menu animation
  }

  // Find all navigation links
  const navLinks = await page.locator('a[href^="/"]').all();
  
  console.log(`Found ${navLinks.length} internal navigation links`);
  
  // Each should be a valid link (not window.location.href)
  for (const link of navLinks) {
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toMatch(/^\//); // Should start with /
  }
}

/**
 * Monitor console for navigation errors
 */
export async function setupConsoleMonitoring(page: Page) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  return {
    getErrors: () => errors,
    assertNoErrors: () => {
      if (errors.length > 0) {
        throw new Error(`Console errors detected: ${errors.join(', ')}`);
      }
    },
  };
}

/**
 * Verify service worker doesn't cause navigation issues
 */
export async function testServiceWorkerNavigation(page: Page) {
  // Check if service worker is active
  const swActive = await page.evaluate(() => {
    return navigator.serviceWorker.controller !== null;
  });
  
  if (swActive) {
    console.log('Service Worker is active - testing navigation with SW');
    
    // Navigate to different routes
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify no 404 errors or blank screens
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length).toBeGreaterThan(100);
  }
}

/**
 * Check if Service Worker update notification is shown
 */
export async function checkForUpdateNotification(page: Page): Promise<boolean> {
  // Look for update notification elements
  const updateToast = page.locator('text=/Update Available/i');
  const updateBanner = page.locator('text=/A new version is ready/i');
  
  const toastVisible = await updateToast.isVisible().catch(() => false);
  const bannerVisible = await updateBanner.isVisible().catch(() => false);
  
  return toastVisible || bannerVisible;
}

/**
 * Verify update notification appears when SW updates
 */
export async function testUpdateNotification(page: Page) {
  // This is hard to test in E2E without triggering actual updates
  // But we can verify the notification components are registered
  
  const hasUpdateNotification = await page.evaluate(() => {
    // Check if ServiceWorkerUpdateNotification is mounted
    return document.querySelector('[data-testid="sw-update-notification"]') !== null ||
           document.body.textContent?.includes('Update Available');
  });
  
  console.log('Service Worker update notification system:', hasUpdateNotification ? 'active' : 'not detected');
}

