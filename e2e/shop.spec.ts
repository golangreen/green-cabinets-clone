import { test, expect } from '@playwright/test';

/**
 * E2E tests for shopping flow.
 *
 * Note: product listings depend on the live Shopify catalog. Tests skip
 * gracefully when no products are available so CI does not flake on
 * upstream catalog changes.
 */
test.describe('Shopping', () => {
  test('should render shop page', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('h1')).toContainText(/shop/i);
  });

  test('should display product listings when available', async ({ page }) => {
    await page.goto('/shop');

    const card = page.getByTestId('product-card').first();
    try {
      await card.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      test.skip(true, 'No Shopify products available in this environment');
    }
    await expect(card).toBeVisible();
  });

  test('should navigate to product detail', async ({ page }) => {
    await page.goto('/shop');

    const card = page.getByTestId('product-card').first();
    try {
      await card.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      test.skip(true, 'No Shopify products available in this environment');
    }

    await card.click();
    await expect(page).toHaveURL(/.*product\/.+/);
  });

  test('should open cart drawer from header', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('cart-button').first().click();
    await expect(page.getByText('Shopping Cart')).toBeVisible();
  });
});
