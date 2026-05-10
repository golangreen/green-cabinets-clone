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

  test('should open and close chatbot', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('chatbot-toggle').click();
    await expect(page.getByTestId('chatbot-window')).toBeVisible();

    await page.getByTestId('chatbot-close').click();
    await expect(page.getByTestId('chatbot-window')).not.toBeVisible();
  });
});
