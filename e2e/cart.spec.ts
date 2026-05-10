import { test, expect } from '@playwright/test';

/**
 * E2E test for adding a product to the cart and verifying the
 * cart item count badge updates in the header.
 *
 * Skips gracefully when the live Shopify catalog has no products
 * matching the shop page filter, so CI does not flake on upstream
 * catalog changes.
 */
test.describe('Cart', () => {
  test('adds a product to the cart and updates the count', async ({ page }) => {
    // Start from a clean cart state.
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('shopify-cart'));

    await page.goto('/shop');

    const addButton = page.getByTestId('add-to-cart').first();
    try {
      await addButton.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      test.skip(true, 'No Shopify products available in this environment');
    }

    // Cart should start empty (no badge).
    await expect(page.getByTestId('cart-count')).toHaveCount(0);

    await addButton.click();

    const badge = page.getByTestId('cart-count').first();
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');

    // Add the same product again — quantity should increment.
    await addButton.click();
    await expect(badge).toHaveText('2');
  });
});
