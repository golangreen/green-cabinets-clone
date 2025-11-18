import { test, expect } from '@playwright/test';
import { VanityDesignerPage } from '../page-objects/vanity-designer.page';

test.describe('Vanity Designer Workflow', () => {
  let designerPage: VanityDesignerPage;

  test.beforeEach(async ({ page }) => {
    designerPage = new VanityDesignerPage(page);
    await designerPage.goto();
  });

  test('should load vanity designer page', async ({ page }) => {
    await expect(page).toHaveURL('/designer');
    await expect(designerPage.canvas3D).toBeVisible();
  });

  test('should render 3D canvas', async () => {
    await designerPage.waitFor3DRender();
    
    // Verify canvas is visible and has dimensions
    const canvas = designerPage.canvas3D;
    await expect(canvas).toBeVisible();
    
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(0);
    expect(box!.height).toBeGreaterThan(0);
  });

  test('should update vanity dimensions', async ({ page }) => {
    await designerPage.setDimensions(48, 22, 36);
    
    // Wait for 3D render to update
    await page.waitForTimeout(1000);
    
    // Verify pricing card reflects changes
    const pricing = await designerPage.getPricing();
    expect(pricing).toBeTruthy();
  });

  test('should change cabinet color', async ({ page }) => {
    await designerPage.waitFor3DRender();
    
    // Select a cabinet color
    await designerPage.selectCabinetColor('White');
    
    // Wait for render update
    await page.waitForTimeout(1000);
    
    // Verify selection is applied (check for selected state or pricing update)
    const pricing = await designerPage.getPricing();
    expect(pricing).toContain('$');
  });

  test('should select countertop material', async ({ page }) => {
    await designerPage.waitFor3DRender();
    
    await designerPage.selectCountertop('Quartz');
    
    await page.waitForTimeout(1000);
    
    // Pricing should update
    const pricing = await designerPage.getPricing();
    expect(pricing).toContain('$');
  });

  test('should select sink style', async ({ page }) => {
    await designerPage.waitFor3DRender();
    
    await designerPage.selectSink('Undermount');
    
    await page.waitForTimeout(1000);
    
    const pricing = await designerPage.getPricing();
    expect(pricing).toContain('$');
  });

  test('should toggle mirror', async ({ page }) => {
    await designerPage.waitFor3DRender();
    
    await designerPage.toggleMirror();
    
    await page.waitForTimeout(1000);
    
    // Verify mirror is added to configuration
    const pricing = await designerPage.getPricing();
    expect(pricing).toBeTruthy();
  });

  test('should display pricing updates as configuration changes', async ({ page }) => {
    await designerPage.waitFor3DRender();
    
    // Get initial pricing
    const initialPricing = await designerPage.getPricing();
    
    // Make changes
    await designerPage.setDimensions(60, 24, 36);
    await designerPage.selectCountertop('Granite');
    
    await page.waitForTimeout(1000);
    
    // Get updated pricing
    const updatedPricing = await designerPage.getPricing();
    
    // Pricing should have changed
    expect(updatedPricing).not.toBe(initialPricing);
  });

  test('should save design configuration', async ({ page }) => {
    await designerPage.waitFor3DRender();
    
    // Configure design
    await designerPage.setDimensions(48, 22, 36);
    await designerPage.selectCabinetColor('Espresso');
    await designerPage.selectCountertop('Quartz');
    
    // Save design
    const downloadPromise = page.waitForEvent('download');
    await designerPage.saveButton.click();
    
    // Verify save action triggered
    await expect(page.locator('text=Saved').or(page.locator('[role="status"]'))).toBeVisible({ timeout: 5000 });
  });

  test('should complete full design workflow', async ({ page }) => {
    await designerPage.waitFor3DRender();
    
    // Step 1: Set dimensions
    await designerPage.setDimensions(54, 22, 36);
    await page.waitForTimeout(500);
    
    // Step 2: Choose cabinet color
    await designerPage.selectCabinetColor('White');
    await page.waitForTimeout(500);
    
    // Step 3: Choose countertop
    await designerPage.selectCountertop('Quartz');
    await page.waitForTimeout(500);
    
    // Step 4: Choose sink
    await designerPage.selectSink('Undermount');
    await page.waitForTimeout(500);
    
    // Step 5: Add mirror
    await designerPage.toggleMirror();
    await page.waitForTimeout(500);
    
    // Step 6: Verify pricing is calculated
    const finalPricing = await designerPage.getPricing();
    expect(finalPricing).toContain('$');
    expect(finalPricing).toMatch(/\d+/); // Contains numbers
    
    // Step 7: Save or download
    await designerPage.saveButton.click();
    await expect(page.locator('text=Saved').or(page.locator('[role="status"]'))).toBeVisible({ timeout: 5000 });
  });

  test('should handle mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await designerPage.goto();
    await designerPage.waitFor3DRender();
    
    // Verify canvas is still visible on mobile
    await expect(designerPage.canvas3D).toBeVisible();
    
    // Verify controls are accessible
    await expect(designerPage.cabinetColorSelect).toBeVisible();
  });
});
