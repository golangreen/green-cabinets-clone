import { test, expect } from '@playwright/test';

/**
 * E2E test: verify the cart drawer total updates correctly
 * after adding the same product twice.
 *
 * Skips gracefully if the live Shopify catalog has no products.
 */
test.describe('Cart Drawer Total', () => {
  test('subtotal/total doubles after adding the same product twice', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('shopify-cart'));

    await page.goto('/shop');

    const addButton = page.getByTestId('add-to-cart').first();
    try {
      await addButton.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      test.skip(true, 'No Shopify products available in this environment');
    }

    // Add once and capture the total.
    await addButton.click();
    const badge = page.getByTestId('cart-count').first();
    await expect(badge).toHaveText('1');

    await page.getByTestId('cart-button').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('1 item in your cart')).toBeVisible();

    const parsePrice = async (text: string | null) => {
      if (!text) return NaN;
      const match = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : NaN;
    };

    const totalRow = dialog.locator('div', { hasText: /^Total/ }).last();
    const singleTotalText = await totalRow.locator('span').last().textContent();
    const singleTotal = await parsePrice(singleTotalText);
    expect(Number.isFinite(singleTotal) && singleTotal > 0).toBeTruthy();

    // Close drawer and add a second unit.
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await addButton.click();
    await expect(badge).toHaveText('2');

    await page.getByTestId('cart-button').click();
    await expect(dialog.getByText('2 items in your cart')).toBeVisible();

    const doubledTotalText = await totalRow.locator('span').last().textContent();
    const doubledTotal = await parsePrice(doubledTotalText);

    // Allow tiny float rounding tolerance.
    expect(Math.abs(doubledTotal - singleTotal * 2)).toBeLessThan(0.02);
  });
});
