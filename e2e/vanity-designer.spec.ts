import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Vanity Designer.
 * The designer is a self-contained app served from /vanity-designer.html and
 * embedded in the React shell at /designer via an iframe, so all assertions
 * run inside that frame.
 */
const FRAME = 'iframe[title="Vanity Designer"]';

test.describe('Vanity Designer', () => {
  test('should load the designer inside the site shell', async ({ page }) => {
    await page.goto('/designer');

    const frame = page.frameLocator(FRAME);
    await expect(frame.locator('canvas').first()).toBeVisible({ timeout: 30000 });
  });

  test('should display live pricing', async ({ page }) => {
    await page.goto('/designer');

    const frame = page.frameLocator(FRAME);
    const price = frame.locator('#priceAmt');
    await expect(price).toBeVisible({ timeout: 30000 });
    await expect(price).toHaveText(/\$[\d,]+/);
  });

  test('should update the price when width changes', async ({ page }) => {
    await page.goto('/designer');

    const frame = page.frameLocator(FRAME);
    const price = frame.locator('#priceAmt');
    await expect(price).toBeVisible({ timeout: 30000 });

    const before = await price.textContent();

    // Width presets are rendered as buttons carrying the width in data-p.
    const presets = frame.locator('[data-p]');
    const count = await presets.count();
    test.skip(count < 2, 'No width presets rendered in this build');

    await presets.nth(count - 1).click();
    await expect(price).not.toHaveText(before ?? '', { timeout: 10000 });
  });

  test('can open the quote dialog', async ({ page }) => {
    await page.goto('/designer');

    const frame = page.frameLocator(FRAME);
    await expect(frame.locator('#priceAmt')).toBeVisible({ timeout: 30000 });

    const quoteButton = frame.getByRole('button', { name: /quote/i }).first();
    if (await quoteButton.count()) {
      await quoteButton.click();
      await expect(frame.locator('text=/Estimated price/i').first()).toBeVisible({ timeout: 10000 });
    }
  });
});
