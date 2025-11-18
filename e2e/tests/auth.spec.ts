import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/auth.page';

test.describe('Authentication Flow', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    await authPage.goto();
  });

  test('should display auth page with sign up and sign in options', async () => {
    await expect(authPage.emailInput).toBeVisible();
    await expect(authPage.passwordInput).toBeVisible();
    await expect(authPage.signUpButton).toBeVisible();
    await expect(authPage.signInButton).toBeVisible();
  });

  test('should successfully sign up a new user', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test-${timestamp}@example.com`;
    const password = 'SecurePassword123!';

    await authPage.signUp(email, password);
    
    // Wait for redirect to home page
    await page.waitForURL('/', { timeout: 10000 });
    
    // Verify user is on home page
    await expect(page).toHaveURL('/');
  });

  test('should show error for invalid email format', async () => {
    await authPage.signUp('invalid-email', 'Password123!');
    
    // Should show validation error
    await expect(authPage.errorMessage.or(authPage.page.locator('text=Invalid email'))).toBeVisible();
  });

  test('should show error for weak password', async () => {
    const email = `test-${Date.now()}@example.com`;
    await authPage.signUp(email, '123');
    
    // Should show validation error
    await expect(authPage.errorMessage.or(authPage.page.locator('text=password'))).toBeVisible();
  });

  test('should show error when signing in with non-existent account', async () => {
    await authPage.signIn('nonexistent@example.com', 'Password123!');
    
    // Should show error message
    await expect(authPage.errorMessage.or(authPage.page.locator('text=Invalid'))).toBeVisible();
  });

  test('should successfully sign in existing user', async ({ page }) => {
    // First create a user
    const timestamp = Date.now();
    const email = `signin-test-${timestamp}@example.com`;
    const password = 'SecurePassword123!';

    await authPage.signUp(email, password);
    await page.waitForURL('/');
    
    // Sign out
    const userMenu = page.locator('button:has-text("Account")').or(page.locator('[data-testid="user-menu"]'));
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.locator('button:has-text("Sign Out")').click();
    }
    
    // Navigate back to auth
    await authPage.goto();
    
    // Sign in with same credentials
    await authPage.signIn(email, password);
    
    // Should redirect to home
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('should persist session after page reload', async ({ page }) => {
    const timestamp = Date.now();
    const email = `persist-test-${timestamp}@example.com`;
    const password = 'SecurePassword123!';

    await authPage.signUp(email, password);
    await page.waitForURL('/');
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated (not redirected to /auth)
    await expect(page).toHaveURL('/');
  });

  test('should successfully sign out', async ({ page }) => {
    const timestamp = Date.now();
    const email = `signout-test-${timestamp}@example.com`;
    const password = 'SecurePassword123!';

    await authPage.signUp(email, password);
    await page.waitForURL('/');
    
    // Find and click sign out
    const userMenu = page.locator('button:has-text("Account")').or(page.locator('[aria-label="User menu"]'));
    await userMenu.click();
    await page.locator('button:has-text("Sign Out")').click();
    
    // Should redirect to home or auth page
    await page.waitForTimeout(1000);
    
    // Try to access protected route - should redirect to auth
    await page.goto('/profile');
    await expect(page).toHaveURL('/auth');
  });

  test('should prevent access to protected routes when not authenticated', async ({ page }) => {
    // Try to access admin page
    await page.goto('/admin/users');
    
    // Should redirect to auth page
    await expect(page).toHaveURL('/auth');
  });
});
