import { test, expect } from '@playwright/test';

/**
 * E2E tests for homepage critical user journeys
 */
test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display hero carousel', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('hero-carousel')).toBeVisible();
  });

  test('should navigate to shop page', async ({ page }) => {
    await page.goto('/shop');
    await expect(page).toHaveURL(/.*shop/);
    await expect(page.locator('h1')).toContainText(/shop/i);
  });

  test('chatbot launcher on content pages sends signed-out users to /auth', async ({ page }) => {
    // The assistant is mounted on guide/location pages (not the homepage) and
    // requires a session, so an anonymous click routes to the auth page.
    await page.goto('/kitchen-renovation-brooklyn');

    const toggle = page.getByTestId('chatbot-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page).toHaveURL(/\/auth/);
  });

});
