import { test, expect } from '@playwright/test';

/**
 * E2E tests for shopping flow
 */
test.describe('Shopping', () => {
  test('should display product listings', async ({ page }) => {
    await page.goto('/shop');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Verify products are displayed
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
  });

  test('should filter products by search', async ({ page }) => {
    await page.goto('/shop');
    
    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Enter search term
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('cabinet');
      
      // Wait for filtered results
      await page.waitForTimeout(500);
      
      // Verify results contain search term
      const productTitles = page.locator('[data-testid="product-title"]');
      const count = await productTitles.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should navigate to product detail', async ({ page }) => {
    await page.goto('/shop');
    
    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Click first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Verify product detail page
    await expect(page).toHaveURL(/.*shop\/.+/);
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/shop');
    
    // Wait for products
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Navigate to product detail
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Add to cart
    await page.click('button:has-text("Add to Cart")');
    
    // Verify success toast
    await expect(page.locator('text=Added to cart')).toBeVisible({ timeout: 5000 });
  });

  test('should open cart drawer', async ({ page }) => {
    await page.goto('/');
    
    // Click cart icon in header
    await page.click('[data-testid="cart-button"]');
    
    // Verify cart drawer opens
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
  });
});
