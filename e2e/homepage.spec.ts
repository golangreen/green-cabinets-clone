import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check for main navigation elements
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check for hero content
    await expect(page.getByText(/Transform Your Space/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Launch Designer/i })).toBeVisible();
  });

  test('should navigate to designer when clicking Launch Designer', async ({ page }) => {
    await page.goto('/');
    
    // Click Launch Designer button
    await page.getByRole('button', { name: /Launch Designer/i }).click();
    
    // Verify navigation to designer page
    await expect(page).toHaveURL(/.*designer/);
  });

  test('should display gallery section with images', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to gallery section
    await page.getByText(/Our Gallery/i).scrollIntoViewIfNeeded();
    
    // Check for gallery images
    const images = page.locator('.gallery-grid img');
    await expect(images.first()).toBeVisible();
  });
});
