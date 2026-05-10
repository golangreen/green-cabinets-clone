import { test, expect } from '@playwright/test';

/**
 * E2E test: add a product, open the cart drawer, and verify
 * the drawer shows the correct item quantity.
 *
 * Skips gracefully if the live Shopify catalog has no products.
 */
test.describe('Cart Drawer', () => {
  test('opens drawer and shows correct item quantity', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('shopify-cart'));

    await page.goto('/shop');

    const addButton = page.getByTestId('add-to-cart').first();
    try {
      await addButton.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      test.skip(true, 'No Shopify products available in this environment');
    }

    // Add the product twice.
    await addButton.click();
    const badge = page.getByTestId('cart-count').first();
    await expect(badge).toHaveText('1');
    await addButton.click();
    await expect(badge).toHaveText('2');

    // Open the cart drawer.
    await page.getByTestId('cart-button').click();

    // Drawer header summary should reflect the total quantity.
    await expect(page.getByText('2 items in your cart')).toBeVisible();

    // The single line item should show quantity 2.
    const quantity = page.locator('[role="dialog"]').getByText('2', { exact: true }).first();
    await expect(quantity).toBeVisible();
  });
});
