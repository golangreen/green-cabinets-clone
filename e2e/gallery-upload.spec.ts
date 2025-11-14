/**
 * Gallery File Upload E2E Tests
 * Tests basic file upload functionality
 */

import { test, expect } from '@playwright/test';
import {
  navigateToGallery,
  createTestImage,
  uploadFiles,
  waitForImageProcessing,
  getImagePreviews,
  clickUpload,
  waitForUploadComplete,
  isUploadZoneVisible,
} from './helpers/gallery';

test.describe('Gallery File Upload', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToGallery(page);
  });

  test('should display upload zone on initial load', async ({ page }) => {
    const uploadZoneVisible = await isUploadZoneVisible(page);
    expect(uploadZoneVisible).toBe(true);
    
    // Check for upload zone text
    await expect(page.getByText(/drag.*drop/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /browse files/i })).toBeVisible();
  });

  test('should upload single image successfully', async ({ page }) => {
    // Create test image
    const testImage = createTestImage('test-image.jpg', 1920, 1080);
    
    // Upload the image
    await uploadFiles(page, [
      { name: 'test-image.jpg', mimeType: 'image/jpeg', buffer: testImage },
    ]);
    
    // Wait for image to be processed
    await waitForImageProcessing(page, 1);
    
    // Verify image appears in preview
    const images = getImagePreviews(page);
    await expect(images).toHaveCount(1);
    
    // Check image metadata is displayed
    await expect(page.getByText('test-image')).toBeVisible();
    await expect(page.getByText(/1920.*1080/)).toBeVisible();
  });

  test('should upload multiple images successfully', async ({ page }) => {
    // Create multiple test images
    const images = [
      createTestImage('image1.jpg'),
      createTestImage('image2.jpg'),
      createTestImage('image3.jpg'),
    ];
    
    // Upload all images
    await uploadFiles(page, images.map((buffer, i) => ({
      name: `image${i + 1}.jpg`,
      mimeType: 'image/jpeg',
      buffer,
    })));
    
    // Wait for all images to be processed
    await waitForImageProcessing(page, 3);
    
    // Verify all images appear
    const previews = getImagePreviews(page);
    await expect(previews).toHaveCount(3);
  });

  test('should display image dimensions', async ({ page }) => {
    const testImage = createTestImage('test.jpg', 2560, 1440);
    
    await uploadFiles(page, [
      { name: 'test.jpg', mimeType: 'image/jpeg', buffer: testImage },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // Check dimensions are displayed (may vary based on actual image processing)
    const imageCard = page.locator('[data-testid="image-preview"]').first();
    await expect(imageCard.getByText(/\d+\s*×\s*\d+/)).toBeVisible();
  });

  test('should allow removing uploaded image', async ({ page }) => {
    const testImage = createTestImage('remove-test.jpg');
    
    await uploadFiles(page, [
      { name: 'remove-test.jpg', mimeType: 'image/jpeg', buffer: testImage },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // Click remove button
    const removeButton = page.locator('[data-testid="image-preview"]')
      .first()
      .getByRole('button', { name: /remove/i });
    await removeButton.click();
    
    // Verify image is removed
    await expect(getImagePreviews(page)).toHaveCount(0);
    
    // Upload zone should reappear
    const uploadZoneVisible = await isUploadZoneVisible(page);
    expect(uploadZoneVisible).toBe(true);
  });

  test('should show upload button after images are added', async ({ page }) => {
    const testImage = createTestImage('test.jpg');
    
    await uploadFiles(page, [
      { name: 'test.jpg', mimeType: 'image/jpeg', buffer: testImage },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // Upload button should be visible
    const uploadButton = page.getByRole('button', { name: /upload.*images/i });
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeEnabled();
  });

  test('should complete full upload workflow', async ({ page }) => {
    const testImage = createTestImage('workflow-test.jpg');
    
    // Step 1: Upload file
    await uploadFiles(page, [
      { name: 'workflow-test.jpg', mimeType: 'image/jpeg', buffer: testImage },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // Step 2: Verify preview
    await expect(getImagePreviews(page)).toHaveCount(1);
    
    // Step 3: Click upload
    await clickUpload(page);
    
    // Step 4: Wait for completion
    await waitForUploadComplete(page);
    
    // Step 5: Verify images are cleared and upload zone returns
    await page.waitForTimeout(1000); // Wait for state update
    const uploadZoneVisible = await isUploadZoneVisible(page);
    expect(uploadZoneVisible).toBe(true);
  });

  test('should display file size information', async ({ page }) => {
    const testImage = createTestImage('size-test.jpg', 1920, 1080, 500); // 500KB
    
    await uploadFiles(page, [
      { name: 'size-test.jpg', mimeType: 'image/jpeg', buffer: testImage },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // Check if file size is displayed
    const imageCard = page.locator('[data-testid="image-preview"]').first();
    await expect(imageCard.getByText(/\d+(\.\d+)?\s*(KB|MB)/i)).toBeVisible();
  });

  test('should handle PNG and JPG formats', async ({ page }) => {
    const jpgImage = createTestImage('test.jpg');
    const pngImage = createTestImage('test.png');
    
    await uploadFiles(page, [
      { name: 'test.jpg', mimeType: 'image/jpeg', buffer: jpgImage },
      { name: 'test.png', mimeType: 'image/png', buffer: pngImage },
    ]);
    
    await waitForImageProcessing(page, 2);
    
    // Both images should be processed
    await expect(getImagePreviews(page)).toHaveCount(2);
    await expect(page.getByText('test.jpg')).toBeVisible();
    await expect(page.getByText('test.png')).toBeVisible();
  });

  test('should display category selection', async ({ page }) => {
    const testImage = createTestImage('category-test.jpg');
    
    await uploadFiles(page, [
      { name: 'category-test.jpg', mimeType: 'image/jpeg', buffer: testImage },
    ]);
    
    await waitForImageProcessing(page, 1);
    
    // Check for category selector or default category
    const imageCard = page.locator('[data-testid="image-preview"]').first();
    
    // Should have some category indication (either dropdown or text)
    const hasCategory = await imageCard.getByText(/kitchens|vanities|closets/i).isVisible()
      .catch(() => false);
    
    expect(hasCategory || await imageCard.locator('select').isVisible()).toBeTruthy();
  });
});
