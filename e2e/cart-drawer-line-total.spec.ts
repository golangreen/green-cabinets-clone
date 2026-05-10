import { test, expect } from '@playwright/test';

/**
 * E2E test: verify the cart drawer line-item reflects the correct
 * effective total (unit price × quantity) after adding the same
 * product twice. The drawer shows a unit price and quantity per line,
 * plus a cart Total — we assert Total === unitPrice × quantity.
 *
 * Skips gracefully if the live Shopify catalog has no products.
 */
test.describe('Cart Drawer Line Item Total', () => {
  test('line-item unit price × quantity matches cart total after adding twice', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('shopify-cart'));

    await page.goto('/shop');

    const addButton = page.getByTestId('add-to-cart').first();
    try {
      await addButton.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      test.skip(true, 'No Shopify products available in this environment');
    }

    // Add the same product twice.
    await addButton.click();
    const badge = page.getByTestId('cart-count').first();
    await expect(badge).toHaveText('1');
    await addButton.click();
    await expect(badge).toHaveText('2');

    // Open drawer.
    await page.getByTestId('cart-button').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('2 items in your cart')).toBeVisible();

    const parseMoney = (text: string | null): number => {
      if (!text) return NaN;
      const m = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : NaN;
    };

    // There should only be one line item (same variant added twice).
    const unitPriceText = await dialog.locator('p.font-semibold').first().textContent();
    const unitPrice = parseMoney(unitPriceText);
    expect(Number.isFinite(unitPrice) && unitPrice > 0).toBeTruthy();

    // Quantity displayed for the single line should be 2.
    await expect(dialog.locator('span.w-8.text-center')).toHaveText('2');

    // Cart Total should equal unitPrice × 2.
    const totalRow = dialog.locator('div', { hasText: /^Total/ }).last();
    const totalText = await totalRow.locator('span').last().textContent();
    const total = parseMoney(totalText);

    expect(Math.abs(total - unitPrice * 2)).toBeLessThan(0.02);
  });
});
