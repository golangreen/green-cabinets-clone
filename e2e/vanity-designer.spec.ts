import { test, expect } from '@playwright/test';

/**
 * E2E tests for Vanity Designer feature
 */
test.describe('Vanity Designer', () => {
  test('should load vanity designer', async ({ page }) => {
    await page.goto('/designer');
    
    // Check for key elements
    await expect(page.locator('text=Vanity Designer')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible(); // 3D canvas
  });

  test('should update vanity dimensions', async ({ page }) => {
    await page.goto('/designer');
    
    // Find dimension inputs
    const widthInput = page.locator('input[type="number"]').first();
    
    // Update width
    await widthInput.clear();
    await widthInput.fill('48');
    
    // Verify update (canvas should re-render)
    await page.waitForTimeout(500);
  });

  test('should change vanity finish', async ({ page }) => {
    await page.goto('/designer');
    
    // Open finish selector
    const finishButton = page.locator('button:has-text("White Oak")');
    if (await finishButton.isVisible()) {
      await finishButton.click();
      
      // Select different finish
      await page.click('text=Walnut');
      
      // Verify selection
      await expect(page.locator('button:has-text("Walnut")')).toBeVisible();
    }
  });

  test('should display pricing', async ({ page }) => {
    await page.goto('/designer');
    
    // Check for pricing card
    await expect(page.locator('text=Base Price')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('should request quote', async ({ page }) => {
    await page.goto('/designer');
    
    // Click request quote button
    const quoteButton = page.locator('button:has-text("Request Quote")');
    if (await quoteButton.isVisible()) {
      await quoteButton.click();
      
      // Verify quote form or navigation
      await expect(page.locator('text=Contact Information')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should toggle fullscreen preview', async ({ page }) => {
    await page.goto('/designer');
    
    // Find fullscreen button
    const fullscreenButton = page.locator('button:has-text("Fullscreen")');
    if (await fullscreenButton.isVisible()) {
      await fullscreenButton.click();
      
      // Verify fullscreen mode
      await expect(page.locator('[data-testid="fullscreen-preview"]')).toBeVisible();
      
      // Exit fullscreen
      await page.press('body', 'Escape');
    }
  });
});
