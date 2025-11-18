import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flows
 */
test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/auth');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('should toggle between login and signup', async ({ page }) => {
    await page.goto('/auth');
    
    // Initially on login
    await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
    
    // Switch to signup
    await page.click('text=Create an account');
    await expect(page.locator('h2:has-text("Create Account")')).toBeVisible();
    
    // Switch back to login
    await page.click('text=Already have an account?');
    await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth');
    
    // Enter invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    // Check for validation error
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should validate password length', async ({ page }) => {
    await page.goto('/auth');
    
    // Enter short password
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '12345');
    await page.click('button:has-text("Sign In")');
    
    // Check for validation error
    await expect(page.locator('text=at least 6 characters')).toBeVisible();
  });
});
