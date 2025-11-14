/**
 * Gallery Visual Regression Tests
 * Tests UI consistency using screenshot comparison
 */

import { test, expect } from '@playwright/test';
import {
  navigateToGallery,
  createTestImage,
  uploadFiles,
  waitForImageProcessing,
  selectImages,
  openBatchEditModal,
  isCompressionDialogVisible,
  getImagePreviews,
} from './helpers/gallery';

test.describe('Gallery Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToGallery(page);
  });

  test('initial gallery page appearance', async ({ page }) => {
    // Capture the initial state of the gallery page
    await expect(page).toHaveScreenshot('gallery-initial-state.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('upload zone appearance', async ({ page }) => {
    const dropZone = page.locator('[data-testid="drop-zone"]');
    await expect(dropZone).toBeVisible();

    // Capture upload zone in normal state
    await expect(dropZone).toHaveScreenshot('upload-zone-normal.png');

    // Hover state
    await dropZone.hover();
    await expect(dropZone).toHaveScreenshot('upload-zone-hover.png');
  });

  test('image preview grid layout', async ({ page }) => {
    // Upload multiple images
    const testFiles = Array.from({ length: 6 }, (_, i) => ({
      name: `test-image-${i + 1}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i + 1}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 6);

    // Capture the image grid layout
    const previewSection = page.locator('[data-testid="image-preview-list"]');
    await expect(previewSection).toHaveScreenshot('image-grid-6-items.png', {
      animations: 'disabled',
    });
  });

  test('image preview card states', async ({ page }) => {
    // Upload a single image
    const testFile = {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: createTestImage('test.png', 1200, 800),
    };

    await uploadFiles(page, [testFile]);
    await waitForImageProcessing(page, 1);

    const imageCard = page.locator('[data-testid="image-preview"]').first();

    // Normal state
    await expect(imageCard).toHaveScreenshot('image-card-normal.png');

    // Hover state
    await imageCard.hover();
    await expect(imageCard).toHaveScreenshot('image-card-hover.png');

    // Selected state
    const checkbox = imageCard.locator('input[type="checkbox"]');
    await checkbox.check();
    await expect(imageCard).toHaveScreenshot('image-card-selected.png');
  });

  test('selection controls appearance', async ({ page }) => {
    // Upload multiple images
    const testFiles = Array.from({ length: 4 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 4);

    // Select some images
    await selectImages(page, [0, 1, 2]);

    // Capture selection controls
    const controlsSection = page.locator('[data-testid="selection-controls"]');
    await expect(controlsSection).toHaveScreenshot('selection-controls-active.png');
  });

  test('batch edit modal appearance', async ({ page }) => {
    // Upload and select images
    const testFiles = Array.from({ length: 3 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 3);
    await selectImages(page, [0, 1, 2]);

    // Open batch edit modal
    await openBatchEditModal(page);

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveScreenshot('batch-edit-modal.png');
  });

  test('compression dialog appearance', async ({ page }) => {
    // Upload a large image to trigger compression dialog
    const largeImage = {
      name: 'large-image.png',
      mimeType: 'image/png',
      buffer: createTestImage('large.png', 4000, 3000, 6000), // 6MB
    };

    await uploadFiles(page, [largeImage]);
    
    // Wait for compression dialog
    const isVisible = await isCompressionDialogVisible(page);
    if (isVisible) {
      const dialog = page.locator('[data-testid="compression-dialog"]');
      await expect(dialog).toHaveScreenshot('compression-dialog.png');
    }
  });

  test('upload controls section', async ({ page }) => {
    // Upload images to show controls
    const testFiles = [
      {
        name: 'test-1.png',
        mimeType: 'image/png',
        buffer: createTestImage('test-1.png', 800, 600),
      },
      {
        name: 'test-2.png',
        mimeType: 'image/png',
        buffer: createTestImage('test-2.png', 800, 600),
      },
    ];

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 2);

    // Capture upload controls
    const controls = page.locator('[data-testid="upload-controls"]');
    await expect(controls).toHaveScreenshot('upload-controls.png');
  });

  test('empty state appearance', async ({ page }) => {
    // Ensure no images are present
    const images = await getImagePreviews(page).count();
    expect(images).toBe(0);

    // Capture empty state
    await expect(page).toHaveScreenshot('gallery-empty-state.png', {
      fullPage: true,
    });
  });

  test('responsive layout - mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Upload images
    const testFiles = Array.from({ length: 3 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 3);

    // Capture mobile layout
    await expect(page).toHaveScreenshot('gallery-mobile-layout.png', {
      fullPage: true,
    });
  });

  test('responsive layout - tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Upload images
    const testFiles = Array.from({ length: 4 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 4);

    // Capture tablet layout
    await expect(page).toHaveScreenshot('gallery-tablet-layout.png', {
      fullPage: true,
    });
  });

  test('dark mode appearance', async ({ page }) => {
    // Toggle dark mode (assumes dark mode toggle exists)
    // This might need adjustment based on your actual dark mode implementation
    await page.emulateMedia({ colorScheme: 'dark' });

    // Upload images
    const testFiles = Array.from({ length: 2 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 2);

    // Capture dark mode
    await expect(page).toHaveScreenshot('gallery-dark-mode.png', {
      fullPage: true,
    });
  });

  test('loading states', async ({ page }) => {
    // Start upload and capture loading state
    const testFile = {
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: createTestImage('test.png', 1200, 800),
    };

    // Slow down network to capture loading state
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });

    const uploadPromise = uploadFiles(page, [testFile]);

    // Wait a bit and capture loading state
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot('gallery-loading-state.png', {
      fullPage: true,
    });

    await uploadPromise;
  });

  test('error state appearance', async ({ page }) => {
    // Try to upload an invalid file type
    const invalidFile = {
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('This is not an image'),
    };

    await uploadFiles(page, [invalidFile]);

    // Wait for error message to appear
    await page.waitForSelector('[role="alert"]', { timeout: 5000 }).catch(() => {});

    // Capture error state
    await expect(page).toHaveScreenshot('gallery-error-state.png', {
      fullPage: true,
    });
  });

  test('cross-browser consistency - image grid', async ({ page, browserName }) => {
    // Upload images
    const testFiles = Array.from({ length: 6 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 6);

    // Capture with browser name in filename
    await expect(page).toHaveScreenshot(`gallery-grid-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('Gallery Component Visual Regression', () => {
  test('upload button states', async ({ page }) => {
    await navigateToGallery(page);

    // Upload images to enable button
    const testFiles = [
      {
        name: 'test.png',
        mimeType: 'image/png',
        buffer: createTestImage('test.png', 800, 600),
      },
    ];

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 1);

    const uploadButton = page.getByRole('button', { name: /upload/i });

    // Normal state
    await expect(uploadButton).toHaveScreenshot('upload-button-enabled.png');

    // Hover state
    await uploadButton.hover();
    await expect(uploadButton).toHaveScreenshot('upload-button-hover.png');

    // Focus state
    await uploadButton.focus();
    await expect(uploadButton).toHaveScreenshot('upload-button-focus.png');
  });

  test('quality slider appearance', async ({ page }) => {
    await navigateToGallery(page);

    // Upload images to show controls
    const testFile = {
      name: 'test.png',
      mimeType: 'image/png',
      buffer: createTestImage('test.png', 800, 600),
    };

    await uploadFiles(page, [testFile]);
    await waitForImageProcessing(page, 1);

    // Capture quality slider
    const slider = page.locator('[data-testid="quality-slider"]');
    if (await slider.count() > 0) {
      await expect(slider).toHaveScreenshot('quality-slider.png');
    }
  });
});
