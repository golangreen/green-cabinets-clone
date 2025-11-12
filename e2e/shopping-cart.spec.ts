import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test('should add product to cart', async ({ page }) => {
    await page.goto('/shop');
    
    // Wait for products to load
    await page.waitForSelector('.product-card');
    
    // Click first "Add to Cart" button
    await page.locator('.product-card').first().getByRole('button', { name: /Add to Cart/i }).click();
    
    // Verify cart badge updates
    const cartBadge = page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toHaveText('1');
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/');
    
    // Click cart icon
    await page.getByRole('link', { name: /Cart/i }).click();
    
    // Verify cart page loads
    await expect(page).toHaveURL(/.*cart/);
    await expect(page.getByText(/Shopping Cart/i)).toBeVisible();
  });

  test('should update product quantity', async ({ page }) => {
    // Add product to cart first
    await page.goto('/shop');
    await page.waitForSelector('.product-card');
    await page.locator('.product-card').first().getByRole('button', { name: /Add to Cart/i }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Increase quantity
    await page.getByRole('button', { name: /\+/i }).click();
    
    // Verify quantity updated
    await expect(page.locator('input[type="number"]').first()).toHaveValue('2');
  });

  test('should remove product from cart', async ({ page }) => {
    // Add product to cart first
    await page.goto('/shop');
    await page.waitForSelector('.product-card');
    await page.locator('.product-card').first().getByRole('button', { name: /Add to Cart/i }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Remove product
    await page.getByRole('button', { name: /Remove/i }).click();
    
    // Verify cart is empty
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible();
  });

  test('should proceed to checkout', async ({ page }) => {
    // Add product to cart first
    await page.goto('/shop');
    await page.waitForSelector('.product-card');
    await page.locator('.product-card').first().getByRole('button', { name: /Add to Cart/i }).click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Click checkout button
    await page.getByRole('button', { name: /Checkout/i }).click();
    
    // Verify redirect to checkout
    await expect(page).toHaveURL(/.*checkout/);
  });
});
