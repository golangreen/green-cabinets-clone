import { test, expect } from '@playwright/test';

/**
 * E2E test: add the same product 3 times so a single line item has
 * quantity 3, then decrement once via the cart drawer's Minus button.
 * Verifies that the line quantity, cart badge, and cart Total all
 * reflect 2 units afterwards.
 *
 * Skips gracefully if the live Shopify catalog has no products.
 */
test.describe('Cart Drawer Line Decrement', () => {
  test('decrementing a multi-qty line updates qty, badge, and total', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('shopify-cart'));

    await page.goto('/shop');

    const addButton = page.getByTestId('add-to-cart').first();
    try {
      await addButton.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
      test.skip(true, 'No Shopify products available in this environment');
    }

    // Add the same product 3 times.
    await addButton.click();
    const badge = page.getByTestId('cart-count').first();
    await expect(badge).toHaveText('1');
    await addButton.click();
    await expect(badge).toHaveText('2');
    await addButton.click();
    await expect(badge).toHaveText('3');

    // Open drawer.
    await page.getByTestId('cart-button').click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByText('3 items in your cart')).toBeVisible();

    const parseMoney = (text: string | null): number => {
      if (!text) return NaN;
      const m = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : NaN;
    };

    // Capture unit price from the line item.
    const unitPriceText = await dialog.locator('p.font-semibold').first().textContent();
    const unitPrice = parseMoney(unitPriceText);
    expect(Number.isFinite(unitPrice) && unitPrice > 0).toBeTruthy();

    const qtyDisplay = dialog.locator('span.w-8.text-center');
    await expect(qtyDisplay).toHaveText('3');

    // Decrement once via the Minus button (the one preceding the qty span).
    await dialog.locator('button:has(svg.lucide-minus)').first().click();

    // Line quantity now 2.
    await expect(qtyDisplay).toHaveText('2');

    // Drawer header & badge reflect 2.
    await expect(dialog.getByText('2 items in your cart')).toBeVisible();
    await expect(badge).toHaveText('2');

    // Cart Total should equal unitPrice × 2.
    const totalRow = dialog.locator('div', { hasText: /^Total/ }).last();
    const totalText = await totalRow.locator('span').last().textContent();
    const total = parseMoney(totalText);
    expect(Math.abs(total - unitPrice * 2)).toBeLessThan(0.02);
  });
});
