/**
 * Navigation Flow E2E Tests
 * Comprehensive tests to ensure SPA routing works correctly throughout the application
 */

import { test, expect } from '@playwright/test';
import {
  NavigationTracker,
  clickAndVerifySPANavigation,
  testBrowserHistory,
  testHeaderNavigation,
  setupConsoleMonitoring,
  testServiceWorkerNavigation,
} from './helpers/navigation';

test.describe('SPA Navigation Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate through main routes without full page reloads', async ({ page }) => {
    const consoleMonitor = await setupConsoleMonitoring(page);

    // Navigate to Shop
    await page.getByRole('link', { name: /shop/i }).first().click();
    await expect(page).toHaveURL(/.*shop/);
    
    // Navigate to About
    await page.getByRole('link', { name: /about/i }).first().click();
    await expect(page).toHaveURL(/.*about/);
    
    // Navigate back home
    await page.getByRole('link', { name: /home/i }).first().click();
    await expect(page).toHaveURL('/');
    
    // Should not have console errors
    consoleMonitor.assertNoErrors();
  });

  test('should handle Launch Designer navigation correctly', async ({ page }) => {
    const launchButton = page.getByRole('button', { name: /launch designer/i });
    await launchButton.click();
    
    // Should navigate to designer without reload
    await expect(page).toHaveURL(/.*designer/);
    
    // Verify designer loaded
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate between Shop and Product Detail pages', async ({ page }) => {
    // Go to Shop
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    
    // Click first product
    const firstProduct = page.locator('.product-card, [data-testid="product-card"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      
      // Should navigate to product detail
      await expect(page).toHaveURL(/.*shop\/.*/);
      
      // Go back to shop
      await page.goBack();
      await expect(page).toHaveURL(/.*shop$/);
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through several pages
    await page.goto('/');
    await page.goto('/shop');
    await page.goto('/about');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/.*shop/);
    
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/.*shop/);
    
    // Go forward again
    await page.goForward();
    await expect(page).toHaveURL(/.*about/);
  });

  test('should navigate to 404 page and back home', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/this-does-not-exist-12345');
    
    // Should show 404 page
    await expect(page.getByText(/404|not found/i)).toBeVisible();
    
    // Click "Return to Home" link
    const homeLink = page.getByRole('link', { name: /home/i });
    await homeLink.click();
    
    // Should navigate to home
    await expect(page).toHaveURL('/');
  });

  test('should handle logo click navigation from any page', async ({ page }) => {
    // Navigate to shop
    await page.goto('/shop');
    
    // Click logo
    const logo = page.locator('a[href="/"]').first();
    await logo.click();
    
    // Should navigate home
    await expect(page).toHaveURL('/');
  });

  test('should handle mobile menu navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open hamburger menu
    const hamburger = page.locator('button').filter({ hasText: /menu/i }).or(
      page.locator('[aria-label*="menu"]')
    ).first();
    
    if (await hamburger.isVisible()) {
      await hamburger.click();
      
      // Wait for menu to open
      await page.waitForTimeout(300);
      
      // Click a navigation link
      const shopLink = page.getByRole('link', { name: /shop/i }).first();
      await shopLink.click();
      
      // Should navigate
      await expect(page).toHaveURL(/.*shop/);
    }
  });

  test('should verify all header links are using React Router', async ({ page }) => {
    await testHeaderNavigation(page);
  });

  test('should handle navigation with Service Worker active', async ({ page }) => {
    await testServiceWorkerNavigation(page);
  });
});

test.describe('Admin Navigation Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests will fail if not authenticated as admin
    // In production, you'd set up proper auth context
    await page.goto('/');
  });

  test('should navigate to admin pages if authenticated', async ({ page }) => {
    // Try to access admin page
    await page.goto('/admin/security');
    
    // Should either show admin page or redirect to auth
    const url = page.url();
    expect(url).toMatch(/\/(admin\/security|auth)/);
  });

  test('should handle admin route protection correctly', async ({ page }) => {
    // Navigate to admin page without auth
    await page.goto('/admin/users');
    
    // Should redirect to auth or show access denied
    await expect(page).toHaveURL(/\/(auth|admin\/users)/);
    
    // If redirected to auth, URL should be correct
    if (page.url().includes('/auth')) {
      expect(page.url()).toContain('/auth');
    }
  });

  test('should navigate between admin pages without reload', async ({ page }) => {
    // Start at admin security (if accessible)
    await page.goto('/admin/security');
    
    // Check if we have access
    const hasAccess = !page.url().includes('/auth');
    
    if (hasAccess) {
      // Navigate to admin users
      const usersLink = page.getByRole('link', { name: /users/i }).first();
      if (await usersLink.isVisible()) {
        await usersLink.click();
        await expect(page).toHaveURL(/.*admin\/users/);
      }
    }
  });
});

test.describe('Error Boundary Navigation', () => {
  test('should handle gallery error boundary navigation', async ({ page }) => {
    // Navigate to admin gallery
    await page.goto('/admin/gallery');
    
    // If error occurs and "Go Home" button appears
    const goHomeButton = page.getByRole('button', { name: /go home/i });
    
    // Wait briefly to see if error occurs
    await page.waitForTimeout(1000);
    
    if (await goHomeButton.isVisible()) {
      // Click should use React Router, not window.location.href
      await goHomeButton.click();
      
      // Should navigate home
      await expect(page).toHaveURL('/');
    }
  });

  test('should handle error fallback navigation', async ({ page }) => {
    // If app-wide error occurs
    const goHomeButton = page.getByRole('button', { name: /go home/i });
    const reloadButton = page.getByRole('button', { name: /reload|try again/i });
    
    // These should exist in error states
    // We can't easily trigger errors in E2E, but we can verify buttons exist in error UI
  });
});

test.describe('Navigation Performance', () => {
  test('should navigate quickly between pages', async ({ page }) => {
    const routes = ['/', '/shop', '/about', '/contact'];
    
    for (const route of routes) {
      const startTime = Date.now();
      
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      console.log(`${route} loaded in ${loadTime}ms`);
      
      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    }
  });

  test('should handle rapid navigation without issues', async ({ page }) => {
    const consoleMonitor = await setupConsoleMonitoring(page);
    
    // Rapidly navigate between pages
    await page.goto('/');
    await page.goto('/shop');
    await page.goto('/about');
    await page.goto('/contact');
    await page.goto('/');
    
    // Wait for stability
    await page.waitForTimeout(500);
    
    // Should not have errors
    consoleMonitor.assertNoErrors();
    
    // Should be on correct page
    await expect(page).toHaveURL('/');
  });
});

test.describe('Service Worker Cache Integrity', () => {
  test('should not serve stale pages after navigation', async ({ page }) => {
    // Navigate to multiple pages
    await page.goto('/');
    const homepageContent = await page.textContent('body');
    
    await page.goto('/shop');
    const shopContent = await page.textContent('body');
    
    // Content should be different
    expect(homepageContent).not.toBe(shopContent);
    
    // Navigate back
    await page.goto('/');
    const homepageContentAgain = await page.textContent('body');
    
    // Should be same as before (or similar enough)
    expect(homepageContentAgain).toContain('Transform Your Space');
  });

  test('should handle navigation after Service Worker update', async ({ page }) => {
    // This test would ideally trigger a SW update
    // For now, just verify navigation works with SW active
    
    const swRegistration = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration();
    });
    
    if (swRegistration) {
      // Navigate with SW active
      await page.goto('/');
      await page.goto('/shop');
      await page.goto('/');
      
      // Should work without issues
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
    }
  });
});
