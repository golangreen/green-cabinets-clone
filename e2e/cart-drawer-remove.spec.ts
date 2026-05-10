import { test, expect } from '@playwright/test';

/**
 * E2E test: after adding a product to the cart and removing it from the
 * cart drawer, the drawer should show the empty state and the cart badge
 * should disappear (count returns to 0).
 *
 * Skips gracefully if the live Shopify catalog has no products.
 */
test.describe('Cart Drawer Remove Item', () => {
  test('removing the only item resets drawer total and cart badge to 0', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('shopify-cart'));

    await page.goto('/shop');

    const addButton = page.getByTestId('add-to-cart').first();
    try {
      await addButton.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      test.skip(true, 'No Shopify products available in this environment');
    }

    // Add a single product.
    await addButton.click();
    const badge = page.getByTestId('cart-count').first();
    await expect(badge).toHaveText('1');

    // Open the drawer.
    await page.getByTestId('cart-button').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('1 item in your cart')).toBeVisible();

    // Remove the only line item via the trash button (first icon-only ghost button in the line).
    const removeButton = dialog.locator('button:has(svg.lucide-trash-2)').first();
    await removeButton.click();

    // Drawer should now show the empty state.
    await expect(dialog.getByText('Your cart is empty')).toBeVisible();

    // The Total row and checkout buttons should no longer be rendered.
    await expect(dialog.locator('div', { hasText: /^Total/ })).toHaveCount(0);

    // Cart badge should be gone (it only renders when totalItems > 0).
    await expect(page.getByTestId('cart-count')).toHaveCount(0);
  });
});
