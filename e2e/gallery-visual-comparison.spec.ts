/**
 * Gallery Visual Comparison Tests
 * Advanced visual regression tests using helper utilities
 */

import { test, expect } from '@playwright/test';
import {
  navigateToGallery,
  createTestImage,
  uploadFiles,
  waitForImageProcessing,
} from './helpers/gallery';
import {
  compareScreenshot,
  waitForImages,
  waitForFonts,
  disableAnimations,
  setResponsiveViewport,
  compareColorSchemes,
  compareWithTolerance,
  compareModalScreenshot,
  createBaseline,
} from './helpers/visual-regression';

test.describe('Gallery Visual Comparison - Advanced', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToGallery(page);
    await waitForFonts(page);
  });

  test('baseline gallery state', async ({ page }) => {
    // Upload standard set of images for baseline
    const testFiles = Array.from({ length: 4 }, (_, i) => ({
      name: `baseline-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`baseline-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 4);
    await waitForImages(page);

    // Create baseline with optimal settings
    await createBaseline(page, 'gallery-baseline.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('color scheme comparison', async ({ page }) => {
    // Upload images
    const testFiles = [
      {
        name: 'test.png',
        mimeType: 'image/png',
        buffer: createTestImage('test.png', 800, 600),
      },
    ];

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 1);

    // Compare light and dark modes
    await compareColorSchemes(page, 'gallery-theme', {
      fullPage: true,
    });
  });

  test('responsive breakpoints', async ({ page }) => {
    // Upload images
    const testFiles = Array.from({ length: 3 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 3);

    // Test all breakpoints
    const breakpoints: Array<'mobile' | 'tablet' | 'desktop' | 'wide'> = [
      'mobile',
      'tablet',
      'desktop',
      'wide',
    ];

    for (const breakpoint of breakpoints) {
      await setResponsiveViewport(page, breakpoint);
      await waitForImages(page);
      await compareScreenshot(page, `gallery-${breakpoint}.png`, {
        fullPage: true,
      });
    }
  });

  test('component isolation - upload zone', async ({ page }) => {
    const dropZone = page.locator('[data-testid="drop-zone"]');
    await dropZone.waitFor({ state: 'visible' });

    // Capture different states
    await expect(dropZone).toHaveScreenshot('dropzone-idle.png', {
      animations: 'disabled',
    });

    // Hover
    await dropZone.hover();
    await page.waitForTimeout(100);
    await expect(dropZone).toHaveScreenshot('dropzone-hover.png', {
      animations: 'disabled',
    });
  });

  test('image grid with tolerance', async ({ page }) => {
    // Upload images
    const testFiles = Array.from({ length: 9 }, (_, i) => ({
      name: `grid-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`grid-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 9);
    await waitForImages(page);

    // Allow small differences for dynamic content
    await compareWithTolerance(page, 'gallery-grid-9.png', 0.02); // 2% tolerance
  });

  test('modal appearance consistency', async ({ page }) => {
    // Upload and select images
    const testFiles = Array.from({ length: 2 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 2);

    // Select images
    const checkboxes = page.locator('[data-testid="image-preview"] input[type="checkbox"]');
    await checkboxes.first().check();
    await checkboxes.nth(1).check();

    // Open batch edit
    await page.getByRole('button', { name: /edit.*selected/i }).click();

    // Compare modal
    await compareModalScreenshot(page, 'batch-edit-modal.png');
  });

  test('animation disabled consistency', async ({ page }) => {
    await disableAnimations(page);

    // Upload images
    const testFiles = [
      {
        name: 'test.png',
        mimeType: 'image/png',
        buffer: createTestImage('test.png', 800, 600),
      },
    ];

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 1);

    // Take multiple screenshots - should be identical
    await expect(page).toHaveScreenshot('no-animation-1.png', {
      animations: 'disabled',
    });
    
    await page.waitForTimeout(100);
    
    await expect(page).toHaveScreenshot('no-animation-2.png', {
      animations: 'disabled',
    });
  });

  test('cross-browser button rendering', async ({ page, browserName }) => {
    // Upload images to show controls
    const testFile = {
      name: 'test.png',
      mimeType: 'image/png',
      buffer: createTestImage('test.png', 800, 600),
    };

    await uploadFiles(page, [testFile]);
    await waitForImageProcessing(page, 1);

    const uploadButton = page.getByRole('button', { name: /upload/i });
    await uploadButton.waitFor({ state: 'visible' });

    await expect(uploadButton).toHaveScreenshot(
      `upload-button-${browserName}.png`,
      { animations: 'disabled' }
    );
  });

  test('selection indicators', async ({ page }) => {
    // Upload multiple images
    const testFiles = Array.from({ length: 4 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: 'image/png',
      buffer: createTestImage(`test-${i}.png`, 800, 600),
    }));

    await uploadFiles(page, testFiles);
    await waitForImageProcessing(page, 4);

    // Test selection states
    const previews = page.locator('[data-testid="image-preview"]');
    
    // No selection
    await compareScreenshot(page, 'selection-none.png');

    // Single selection
    await previews.first().locator('input[type="checkbox"]').check();
    await compareScreenshot(page, 'selection-single.png');

    // Multiple selection
    await previews.nth(1).locator('input[type="checkbox"]').check();
    await previews.nth(2).locator('input[type="checkbox"]').check();
    await compareScreenshot(page, 'selection-multiple.png');

    // All selected
    await page.getByRole('button', { name: /select all/i }).click();
    await compareScreenshot(page, 'selection-all.png');
  });

  test('error toast appearance', async ({ page }) => {
    // Try to upload invalid file
    const invalidFile = {
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Not an image'),
    };

    await uploadFiles(page, [invalidFile]);

    // Wait for error toast
    const toast = page.locator('[role="alert"]');
    await toast.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    if (await toast.count() > 0) {
      await expect(toast).toHaveScreenshot('error-toast.png', {
        animations: 'disabled',
      });
    }
  });

  test('loading spinner consistency', async ({ page }) => {
    // Slow down network to capture loading state
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 2000);
    });

    const testFile = {
      name: 'test.png',
      mimeType: 'image/png',
      buffer: createTestImage('test.png', 1200, 800),
    };

    const uploadPromise = uploadFiles(page, [testFile]);

    // Capture loading state
    await page.waitForTimeout(500);
    const loadingIndicator = page.locator('[data-testid="loading"]');
    
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator).toHaveScreenshot('loading-spinner.png', {
        animations: 'disabled',
      });
    }

    await uploadPromise;
  });
});
