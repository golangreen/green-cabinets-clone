import { test, expect } from '@playwright/test';

/**
 * E2E tests for the /auth page.
 * The form uses native HTML validation (required, type=email, minLength=6)
 * plus zod on submit, so invalid input never reaches the network.
 */
test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
  });

  test('should toggle between login and signup', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();

    await page.click("text=Don't have an account? Sign up");
    await expect(page.getByRole('button', { name: 'Sign Up', exact: true })).toBeVisible();

    await page.click('text=Already have an account? Login');
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
  });

  test('should block submit on invalid email format', async ({ page }) => {
    await page.goto('/auth');

    const email = page.locator('input[type="email"]');
    await email.fill('invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Native constraint validation rejects the value; we stay on /auth.
    await expect(email).toHaveJSProperty('validity.valid', false);
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should block submit on short password', async ({ page }) => {
    await page.goto('/auth');

    const password = page.locator('input[type="password"]');
    await page.fill('input[type="email"]', 'test@example.com');
    await password.fill('12345');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(password).toHaveJSProperty('validity.valid', false);
    await expect(page).toHaveURL(/\/auth/);
  });
});
