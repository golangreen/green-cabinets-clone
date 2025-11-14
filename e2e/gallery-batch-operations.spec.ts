/**
 * Gallery Batch Operations E2E Tests
 * Tests multi-image selection and batch editing functionality
 */

import { test, expect } from '@playwright/test';
import {
  navigateToGallery,
  createTestImage,
  uploadFiles,
  waitForImageProcessing,
  getImagePreviews,
  selectImages,
  isImageSelected,
  getSelectedCount,
  openBatchEditModal,
} from './helpers/gallery';

test.describe('Gallery Batch Operations', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToGallery(page);
    
    // Upload multiple images for testing
    const images = Array.from({ length: 5 }, (_, i) =>
      createTestImage(`test${i + 1}.jpg`)
    );
    
    await uploadFiles(page, images.map((buffer, i) => ({
      name: `test${i + 1}.jpg`,
      mimeType: 'image/jpeg',
      buffer,
    })));
    
    await waitForImageProcessing(page, 5);
  });

  test('should select single image', async ({ page }) => {
    // Click checkbox on first image
    const firstCheckbox = page.locator('[data-testid="image-preview"]')
      .first()
      .locator('input[type="checkbox"]');
    await firstCheckbox.check();
    
    // Verify selection
    const isSelected = await isImageSelected(page, 0);
    expect(isSelected).toBe(true);
    
    // Selection count should be 1
    const count = await getSelectedCount(page);
    expect(count).toBe(1);
  });

  test('should select multiple images', async ({ page }) => {
    // Select first three images
    await selectImages(page, [0, 1, 2]);
    
    // Verify all are selected
    for (let i = 0; i < 3; i++) {
      const isSelected = await isImageSelected(page, i);
      expect(isSelected).toBe(true);
    }
    
    // Selection count should be 3
    const count = await getSelectedCount(page);
    expect(count).toBe(3);
  });

  test('should deselect image by clicking again', async ({ page }) => {
    // Select image
    const checkbox = page.locator('[data-testid="image-preview"]')
      .first()
      .locator('input[type="checkbox"]');
    await checkbox.check();
    
    expect(await isImageSelected(page, 0)).toBe(true);
    
    // Deselect
    await checkbox.uncheck();
    
    expect(await isImageSelected(page, 0)).toBe(false);
  });

  test('should show select all button', async ({ page }) => {
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    await expect(selectAllButton).toBeVisible();
  });

  test('should select all images', async ({ page }) => {
    // Click select all
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    await selectAllButton.click();
    
    // All images should be selected
    const count = await getSelectedCount(page);
    expect(count).toBe(5);
    
    // Verify each image is selected
    for (let i = 0; i < 5; i++) {
      const isSelected = await isImageSelected(page, i);
      expect(isSelected).toBe(true);
    }
  });

  test('should show clear selection button when images are selected', async ({ page }) => {
    // Select some images
    await selectImages(page, [0, 1]);
    
    // Clear selection button should appear
    const clearButton = page.getByRole('button', { name: /clear selection/i });
    await expect(clearButton).toBeVisible();
  });

  test('should clear all selections', async ({ page }) => {
    // Select all images
    const selectAllButton = page.getByRole('button', { name: /select all/i });
    await selectAllButton.click();
    
    expect(await getSelectedCount(page)).toBe(5);
    
    // Clear selection
    const clearButton = page.getByRole('button', { name: /clear selection/i });
    await clearButton.click();
    
    // No images should be selected
    const count = await getSelectedCount(page);
    expect(count).toBe(0);
  });

  test('should show batch edit button when multiple images selected', async ({ page }) => {
    // Select multiple images
    await selectImages(page, [0, 1, 2]);
    
    // Batch edit button should appear
    const batchEditButton = page.getByRole('button', { name: /edit.*selected/i });
    await expect(batchEditButton).toBeVisible();
    await expect(batchEditButton).toContainText('3');
  });

  test('should open batch edit modal', async ({ page }) => {
    await selectImages(page, [0, 1]);
    
    // Open batch edit modal
    await openBatchEditModal(page);
    
    // Modal should be visible
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Should show batch edit options
    await expect(modal.getByText(/category/i)).toBeVisible();
  });

  test('should show metadata edit button when images selected', async ({ page }) => {
    await selectImages(page, [0, 1, 2]);
    
    // Metadata edit button should appear
    const metadataButton = page.getByRole('button', { name: /edit metadata/i });
    await expect(metadataButton).toBeVisible();
  });

  test('should maintain selection when navigating between images', async ({ page }) => {
    // Select first and third images
    await selectImages(page, [0, 2]);
    
    // Scroll or interact with page
    await page.mouse.wheel(0, 100);
    await page.waitForTimeout(500);
    
    // Selection should persist
    expect(await isImageSelected(page, 0)).toBe(true);
    expect(await isImageSelected(page, 2)).toBe(true);
    expect(await getSelectedCount(page)).toBe(2);
  });

  test('should adjust selection when image is removed', async ({ page }) => {
    // Select first three images
    await selectImages(page, [0, 1, 2]);
    
    expect(await getSelectedCount(page)).toBe(3);
    
    // Remove first image
    const removeButton = page.locator('[data-testid="image-preview"]')
      .first()
      .getByRole('button', { name: /remove/i });
    await removeButton.click();
    
    // Wait for removal
    await page.waitForTimeout(500);
    
    // Selection count should decrease
    const newCount = await getSelectedCount(page);
    expect(newCount).toBe(2);
  });

  test('should show visual indicator for selected images', async ({ page }) => {
    const firstImage = page.locator('[data-testid="image-preview"]').first();
    
    // Before selection
    const initialState = await firstImage.getAttribute('class');
    
    // Select image
    await selectImages(page, [0]);
    
    // After selection - should have different styling
    const selectedState = await firstImage.getAttribute('class');
    expect(selectedState).not.toBe(initialState);
    
    // Should have visual indicator (border, highlight, etc.)
    await expect(firstImage).toHaveClass(/selected|active|checked/i);
  });

  test('should handle selection of all images via keyboard', async ({ page }) => {
    // Focus on first checkbox
    const firstCheckbox = page.locator('[data-testid="image-preview"]')
      .first()
      .locator('input[type="checkbox"]');
    await firstCheckbox.focus();
    
    // Press Space to select
    await page.keyboard.press('Space');
    
    expect(await isImageSelected(page, 0)).toBe(true);
  });

  test('should display selection count in batch edit button', async ({ page }) => {
    await selectImages(page, [0, 1, 2, 3]);
    
    const batchEditButton = page.getByRole('button', { name: /edit.*selected/i });
    await expect(batchEditButton).toBeVisible();
    
    // Button should show count
    await expect(batchEditButton).toContainText('4');
  });

  test('should disable batch operations when no images selected', async ({ page }) => {
    // No selection - batch buttons should not be visible or disabled
    const batchEditButton = page.getByRole('button', { name: /edit.*selected/i });
    await expect(batchEditButton).not.toBeVisible();
  });

  test('should allow selecting non-consecutive images', async ({ page }) => {
    // Select 1st, 3rd, and 5th images
    await selectImages(page, [0, 2, 4]);
    
    expect(await isImageSelected(page, 0)).toBe(true);
    expect(await isImageSelected(page, 1)).toBe(false);
    expect(await isImageSelected(page, 2)).toBe(true);
    expect(await isImageSelected(page, 3)).toBe(false);
    expect(await isImageSelected(page, 4)).toBe(true);
    
    const count = await getSelectedCount(page);
    expect(count).toBe(3);
  });

  test('should persist selection during scroll', async ({ page }) => {
    // Select images
    await selectImages(page, [0, 1, 2]);
    
    // Scroll page
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);
    
    await page.evaluate(() => window.scrollBy(0, -500));
    await page.waitForTimeout(300);
    
    // Selection should still be maintained
    const count = await getSelectedCount(page);
    expect(count).toBe(3);
  });
});
