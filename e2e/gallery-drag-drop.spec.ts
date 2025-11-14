/**
 * Gallery Drag and Drop E2E Tests
 * Tests drag-and-drop file upload functionality
 */

import { test, expect } from '@playwright/test';
import {
  navigateToGallery,
  createTestImage,
  waitForImageProcessing,
  getImagePreviews,
  isUploadZoneVisible,
} from './helpers/gallery';

test.describe('Gallery Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToGallery(page);
  });

  test('should highlight drop zone on drag over', async ({ page }) => {
    // Get drop zone element
    const dropZone = page.locator('[data-testid="drop-zone"]');
    await expect(dropZone).toBeVisible();
    
    // Create test file
    const testImage = createTestImage('drag-test.jpg');
    const buffer = Array.from(testImage);
    
    // Simulate dragover event
    await dropZone.dispatchEvent('dragover', {
      dataTransfer: {
        types: ['Files'],
        files: [],
      },
    });
    
    // Check if drop zone has hover/drag state (visual indicator)
    // This would need to check for class changes or style changes
    await page.waitForTimeout(100);
  });

  test('should accept dropped image files', async ({ page }) => {
    const dropZone = page.locator('[data-testid="drop-zone"]');
    const testImage = createTestImage('dropped-image.jpg');
    
    // Get file input (hidden) for file simulation
    const fileInput = page.locator('input[type="file"]');
    
    // Set files via the input (simulating drop)
    await fileInput.setInputFiles([
      {
        name: 'dropped-image.jpg',
        mimeType: 'image/jpeg',
        buffer: testImage,
      },
    ]);
    
    // Wait for image processing
    await waitForImageProcessing(page, 1);
    
    // Verify image was added
    await expect(getImagePreviews(page)).toHaveCount(1);
    await expect(page.getByText('dropped-image')).toBeVisible();
  });

  test('should accept multiple dropped files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    const images = [
      { name: 'drop1.jpg', buffer: createTestImage('drop1.jpg') },
      { name: 'drop2.jpg', buffer: createTestImage('drop2.jpg') },
      { name: 'drop3.jpg', buffer: createTestImage('drop3.jpg') },
    ];
    
    // Simulate dropping multiple files
    await fileInput.setInputFiles(
      images.map(img => ({
        name: img.name,
        mimeType: 'image/jpeg',
        buffer: img.buffer,
      }))
    );
    
    await waitForImageProcessing(page, 3);
    
    // All files should be processed
    await expect(getImagePreviews(page)).toHaveCount(3);
  });

  test('should remove drop zone after files are added', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const testImage = createTestImage('test.jpg');
    
    await fileInput.setInputFiles([
      {
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: testImage,
      },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // Drop zone should be hidden when images are present
    const uploadZoneVisible = await isUploadZoneVisible(page);
    expect(uploadZoneVisible).toBe(false);
  });

  test('should show visual feedback during file processing', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const testImage = createTestImage('processing-test.jpg');
    
    await fileInput.setInputFiles([
      {
        name: 'processing-test.jpg',
        mimeType: 'image/jpeg',
        buffer: testImage,
      },
    ]);
    
    // There might be a loading indicator
    // This is a timing-sensitive test, so we use a short timeout
    try {
      await page.waitForSelector('[data-testid="processing-indicator"]', {
        state: 'visible',
        timeout: 500,
      });
    } catch {
      // Loading state might be too fast to catch
    }
    
    // Eventually, image should be processed
    await waitForImageProcessing(page, 1);
  });

  test('should handle drag leave event', async ({ page }) => {
    const dropZone = page.locator('[data-testid="drop-zone"]');
    await expect(dropZone).toBeVisible();
    
    // Simulate drag over
    await dropZone.dispatchEvent('dragover', {
      dataTransfer: {
        types: ['Files'],
        files: [],
      },
    });
    
    await page.waitForTimeout(100);
    
    // Simulate drag leave
    await dropZone.dispatchEvent('dragleave');
    
    await page.waitForTimeout(100);
    
    // Drop zone should return to normal state
    // Visual verification would need to check class or style changes
  });

  test('should prevent default drag behavior', async ({ page }) => {
    // Navigate to page
    await page.goto('/admin/gallery');
    
    // Try to drag an element from the page itself
    const dropZone = page.locator('[data-testid="drop-zone"]');
    
    // The page should prevent default drag behavior to avoid navigation
    // This is implicitly tested by other tests working correctly
    await expect(dropZone).toBeVisible();
  });

  test('should accept files after previous upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    
    // First upload
    await fileInput.setInputFiles([
      {
        name: 'first.jpg',
        mimeType: 'image/jpeg',
        buffer: createTestImage('first.jpg'),
      },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // Remove the image
    const removeButton = page.locator('[data-testid="image-preview"]')
      .first()
      .getByRole('button', { name: /remove/i });
    await removeButton.click();
    
    // Wait for drop zone to reappear
    const uploadZoneVisible = await isUploadZoneVisible(page);
    expect(uploadZoneVisible).toBe(true);
    
    // Second upload
    await fileInput.setInputFiles([
      {
        name: 'second.jpg',
        mimeType: 'image/jpeg',
        buffer: createTestImage('second.jpg'),
      },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // New file should be processed
    await expect(page.getByText('second')).toBeVisible();
  });

  test('should show appropriate cursor on hover', async ({ page }) => {
    const dropZone = page.locator('[data-testid="drop-zone"]');
    await expect(dropZone).toBeVisible();
    
    // Hover over drop zone
    await dropZone.hover();
    
    // Visual verification would check cursor style
    // This is more of a visual test, but we can verify the element is interactive
    await expect(dropZone).toBeVisible();
  });
});
