import { test, expect } from '@playwright/test';

/**
 * E2E tests for homepage critical user journeys
 */
test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check for key elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
  });

  test('should navigate to shop page', async ({ page }) => {
    await page.goto('/');
    
    // Click shop link
    await page.click('text=Shop');
    
    // Verify navigation
    await expect(page).toHaveURL(/.*shop/);
  });

  test('should open and close chatbot', async ({ page }) => {
    await page.goto('/');
    
    // Open chatbot
    await page.click('button:has-text("MessageCircle")');
    
    // Verify chatbot is open
    await expect(page.locator('text=Chat Assistant')).toBeVisible();
    
    // Close chatbot
    await page.click('button:has-text("X")');
    
    // Verify chatbot is closed
    await expect(page.locator('text=Chat Assistant')).not.toBeVisible();
  });

  test('should display hero carousel', async ({ page }) => {
    await page.goto('/');
    
    // Check carousel exists
    const carousel = page.locator('[data-testid="hero-carousel"]');
    await expect(carousel).toBeVisible();
  });
});
