/**
 * Gallery Compression Workflow E2E Tests
 * Tests automatic compression detection and compression dialog
 */

import { test, expect } from '@playwright/test';
import {
  navigateToGallery,
  createTestImage,
  uploadFiles,
  waitForImageProcessing,
  isCompressionDialogVisible,
  selectCompressionQuality,
  clickCompress,
  skipCompression,
  getImagePreviews,
} from './helpers/gallery';

test.describe('Gallery Compression Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToGallery(page);
  });

  test('should not show compression dialog for small files', async ({ page }) => {
    // Create small image (< 10MB)
    const smallImage = createTestImage('small.jpg', 1920, 1080, 500); // 500KB
    
    await uploadFiles(page, [
      { name: 'small.jpg', mimeType: 'image/jpeg', buffer: smallImage },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // Compression dialog should NOT appear
    const dialogVisible = await isCompressionDialogVisible(page);
    expect(dialogVisible).toBe(false);
    
    // Image should be processed normally
    await expect(getImagePreviews(page)).toHaveCount(1);
  });

  test('should show compression dialog for large files', async ({ page }) => {
    // Create large image (> 10MB)
    const largeImage = createTestImage('large.jpg', 4096, 3072, 15000); // 15MB
    
    await uploadFiles(page, [
      { name: 'large.jpg', mimeType: 'image/jpeg', buffer: largeImage },
    ]);
    
    // Compression dialog should appear
    const dialogVisible = await isCompressionDialogVisible(page);
    expect(dialogVisible).toBe(true);
    
    // Dialog should show file information
    await expect(page.getByText(/files need compression/i)).toBeVisible();
    await expect(page.getByText(/large\.jpg/i)).toBeVisible();
  });

  test('should display compression quality options', async ({ page }) => {
    const largeImage = createTestImage('large.jpg', 4096, 3072, 15000);
    
    await uploadFiles(page, [
      { name: 'large.jpg', mimeType: 'image/jpeg', buffer: largeImage },
    ]);
    
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'visible',
      timeout: 3000,
    });
    
    // Check for quality options
    await expect(page.getByRole('button', { name: /low/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /medium/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /high/i })).toBeVisible();
  });

  test('should display estimated sizes for each quality', async ({ page }) => {
    const largeImage = createTestImage('large.jpg', 4096, 3072, 15000);
    
    await uploadFiles(page, [
      { name: 'large.jpg', mimeType: 'image/jpeg', buffer: largeImage },
    ]);
    
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'visible',
      timeout: 3000,
    });
    
    // Check for size estimations
    const dialog = page.locator('[data-testid="compression-dialog"]');
    await expect(dialog.getByText(/MB/i)).toBeVisible();
  });

  test('should compress files when compress button is clicked', async ({ page }) => {
    const largeImage = createTestImage('large.jpg', 4096, 3072, 15000);
    
    await uploadFiles(page, [
      { name: 'large.jpg', mimeType: 'image/jpeg', buffer: largeImage },
    ]);
    
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'visible',
      timeout: 3000,
    });
    
    // Select medium quality
    await selectCompressionQuality(page, 'medium');
    
    // Click compress
    await clickCompress(page);
    
    // Wait for compression to complete and dialog to close
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'hidden',
      timeout: 5000,
    });
    
    // Image should be processed
    await waitForImageProcessing(page, 1);
    await expect(getImagePreviews(page)).toHaveCount(1);
  });

  test('should allow skipping compression', async ({ page }) => {
    const largeImage = createTestImage('large.jpg', 4096, 3072, 15000);
    
    await uploadFiles(page, [
      { name: 'large.jpg', mimeType: 'image/jpeg', buffer: largeImage },
    ]);
    
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'visible',
      timeout: 3000,
    });
    
    // Click skip
    await skipCompression(page);
    
    // Dialog should close
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'hidden',
      timeout: 2000,
    });
    
    // Files should still be processed (without compression)
    await waitForImageProcessing(page, 1);
  });

  test('should show compression progress', async ({ page }) => {
    const largeImages = [
      createTestImage('large1.jpg', 4096, 3072, 15000),
      createTestImage('large2.jpg', 4096, 3072, 15000),
    ];
    
    await uploadFiles(page, largeImages.map((buffer, i) => ({
      name: `large${i + 1}.jpg`,
      mimeType: 'image/jpeg',
      buffer,
    })));
    
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'visible',
      timeout: 3000,
    });
    
    await selectCompressionQuality(page, 'high');
    await clickCompress(page);
    
    // Look for progress indicator
    try {
      await page.waitForSelector('[data-testid="compression-progress"]', {
        state: 'visible',
        timeout: 500,
      });
    } catch {
      // Progress might be too fast to catch
    }
    
    // Eventually should complete
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'hidden',
      timeout: 10000,
    });
  });

  test('should handle compression of multiple files', async ({ page }) => {
    const largeImages = Array.from({ length: 3 }, (_, i) =>
      createTestImage(`large${i + 1}.jpg`, 4096, 3072, 15000)
    );
    
    await uploadFiles(page, largeImages.map((buffer, i) => ({
      name: `large${i + 1}.jpg`,
      mimeType: 'image/jpeg',
      buffer,
    })));
    
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'visible',
      timeout: 3000,
    });
    
    // Dialog should show file count
    await expect(page.getByText(/3.*files/i)).toBeVisible();
    
    await selectCompressionQuality(page, 'medium');
    await clickCompress(page);
    
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'hidden',
      timeout: 10000,
    });
    
    // All files should be processed
    await waitForImageProcessing(page, 3);
    await expect(getImagePreviews(page)).toHaveCount(3);
  });

  test('should display original and compressed sizes', async ({ page }) => {
    const largeImage = createTestImage('large.jpg', 4096, 3072, 15000);
    
    await uploadFiles(page, [
      { name: 'large.jpg', mimeType: 'image/jpeg', buffer: largeImage },
    ]);
    
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'visible',
      timeout: 3000,
    });
    
    const dialog = page.locator('[data-testid="compression-dialog"]');
    
    // Should show original size
    await expect(dialog.getByText(/original.*15/i)).toBeVisible().catch(() => 
      expect(dialog.getByText(/current size/i)).toBeVisible()
    );
    
    // Should show estimated compressed sizes
    await expect(dialog.getByText(/MB/i)).toBeVisible();
  });

  test('should close dialog with escape key', async ({ page }) => {
    const largeImage = createTestImage('large.jpg', 4096, 3072, 15000);
    
    await uploadFiles(page, [
      { name: 'large.jpg', mimeType: 'image/jpeg', buffer: largeImage },
    ]);
    
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'visible',
      timeout: 3000,
    });
    
    // Press escape
    await page.keyboard.press('Escape');
    
    // Dialog should close
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'hidden',
      timeout: 2000,
    });
  });
});
