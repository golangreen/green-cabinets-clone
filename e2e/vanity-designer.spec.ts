import { test, expect } from '@playwright/test';

test.describe('Vanity Designer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer');
  });

  test('should load vanity designer interface', async ({ page }) => {
    // Check for main designer elements
    await expect(page.getByText(/Custom Bathroom Vanity/i)).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible(); // 3D preview canvas
  });

  test('should update dimensions', async ({ page }) => {
    // Find width input
    const widthInput = page.getByLabel(/Width/i);
    await widthInput.fill('48');
    
    // Verify pricing updates
    await expect(page.getByText(/Total:/)).toBeVisible();
  });

  test('should select different brands', async ({ page }) => {
    // Find brand selector
    const brandSelect = page.getByLabel(/Brand/i);
    await brandSelect.click();
    
    // Select a brand (Tafisa, Egger, or Shinnoki)
    await page.getByText(/Tafisa/i).click();
    
    // Verify brand is selected
    await expect(brandSelect).toContainText(/Tafisa/i);
  });

  test('should generate and send quote', async ({ page }) => {
    // Fill required fields
    await page.getByLabel(/Width/i).fill('48');
    await page.getByLabel(/Height/i).fill('36');
    await page.getByLabel(/Depth/i).fill('21');
    
    // Click Get Quote button
    await page.getByRole('button', { name: /Get Quote/i }).click();
    
    // Verify quote form appears
    await expect(page.getByLabel(/Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
  });

  test('should toggle fullscreen preview', async ({ page }) => {
    // Click fullscreen button
    await page.getByRole('button', { name: /Fullscreen/i }).click();
    
    // Verify fullscreen mode
    await expect(page.locator('.fullscreen-preview')).toBeVisible();
    
    // Exit fullscreen
    await page.getByRole('button', { name: /Close/i }).click();
    await expect(page.locator('.fullscreen-preview')).not.toBeVisible();
  });
});
