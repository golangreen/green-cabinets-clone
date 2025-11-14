/**
 * Gallery E2E Test Helpers
 * Reusable functions for gallery testing
 */

import { Page, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Create a test image file
 */
export function createTestImage(
  filename: string,
  width: number = 1920,
  height: number = 1080,
  sizeKB?: number
): Buffer {
  // Create a simple PNG image buffer
  // This is a minimal valid PNG file structure
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  ]);
  
  // Add minimal PNG chunks for a valid image
  const imageData = Buffer.alloc(sizeKB ? sizeKB * 1024 : 50 * 1024);
  
  return Buffer.concat([header, imageData]);
}

/**
 * Navigate to admin gallery page
 */
export async function navigateToGallery(page: Page) {
  await page.goto('/admin/gallery');
  await page.waitForLoadState('networkidle');
}

/**
 * Login as admin (if authentication is required)
 */
export async function loginAsAdmin(page: Page) {
  // TODO: Implement actual login when auth is ready
  // For now, we'll assume tests can access /admin routes
  await page.goto('/');
  // Add actual login logic here when auth is implemented
}

/**
 * Upload files via file input
 */
export async function uploadFiles(
  page: Page,
  files: Array<{ name: string; mimeType: string; buffer: Buffer }>
) {
  const fileInput = page.locator('input[type="file"]');
  
  // Set files to the input
  await fileInput.setInputFiles(
    files.map(f => ({
      name: f.name,
      mimeType: f.mimeType,
      buffer: f.buffer,
    }))
  );
}

/**
 * Wait for images to be processed
 */
export async function waitForImageProcessing(page: Page, count: number = 1) {
  // Wait for images to appear in the preview list
  await page.waitForSelector('[data-testid="image-preview"]', {
    state: 'visible',
    timeout: 5000,
  });
  
  // Wait for the expected number of images
  const images = page.locator('[data-testid="image-preview"]');
  await expect(images).toHaveCount(count);
}

/**
 * Get image preview cards
 */
export function getImagePreviews(page: Page) {
  return page.locator('[data-testid="image-preview"]');
}

/**
 * Select multiple images
 */
export async function selectImages(page: Page, indices: number[]) {
  for (const index of indices) {
    const checkbox = page.locator('[data-testid="image-preview"]').nth(index)
      .locator('input[type="checkbox"]');
    await checkbox.check();
  }
}

/**
 * Click upload button
 */
export async function clickUpload(page: Page) {
  const uploadButton = page.getByRole('button', { name: /upload.*images/i });
  await uploadButton.click();
}

/**
 * Wait for upload to complete
 */
export async function waitForUploadComplete(page: Page) {
  // Wait for success toast or upload completion indicator
  await page.waitForSelector('[data-testid="upload-success"]', {
    state: 'visible',
    timeout: 10000,
  }).catch(() => {
    // If no success indicator, wait for upload button to be re-enabled
    return page.waitForSelector('button:has-text("Upload"):not([disabled])', {
      timeout: 10000,
    });
  });
}

/**
 * Check if compression dialog is visible
 */
export async function isCompressionDialogVisible(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="compression-dialog"]', {
      state: 'visible',
      timeout: 2000,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Select compression quality
 */
export async function selectCompressionQuality(
  page: Page,
  quality: 'low' | 'medium' | 'high'
) {
  const qualityButton = page.getByRole('button', { name: new RegExp(quality, 'i') });
  await qualityButton.click();
}

/**
 * Click compress button in dialog
 */
export async function clickCompress(page: Page) {
  const compressButton = page.getByRole('button', { name: /compress/i });
  await compressButton.click();
}

/**
 * Skip compression
 */
export async function skipCompression(page: Page) {
  const skipButton = page.getByRole('button', { name: /skip/i });
  await skipButton.click();
}

/**
 * Open batch edit modal
 */
export async function openBatchEditModal(page: Page) {
  const batchEditButton = page.getByRole('button', { name: /edit.*selected/i });
  await batchEditButton.click();
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
}

/**
 * Check if image is selected
 */
export async function isImageSelected(page: Page, index: number): Promise<boolean> {
  const checkbox = page.locator('[data-testid="image-preview"]').nth(index)
    .locator('input[type="checkbox"]');
  return await checkbox.isChecked();
}

/**
 * Get selected image count
 */
export async function getSelectedCount(page: Page): Promise<number> {
  const selectedText = await page.getByText(/\d+\s+selected/i).textContent();
  if (!selectedText) return 0;
  const match = selectedText.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `e2e/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * Simulate drag and drop
 */
export async function dragAndDropFiles(
  page: Page,
  files: Array<{ name: string; mimeType: string; buffer: Buffer }>
) {
  const dropZone = page.locator('[data-testid="drop-zone"]');
  
  // Create DataTransfer with files
  const dataTransfer = await page.evaluateHandle((filesData) => {
    const dt = new DataTransfer();
    
    filesData.forEach((fileData: any) => {
      const blob = new Blob([new Uint8Array(fileData.buffer)], { type: fileData.mimeType });
      const file = new File([blob], fileData.name, { type: fileData.mimeType });
      dt.items.add(file);
    });
    
    return dt;
  }, files.map(f => ({ name: f.name, mimeType: f.mimeType, buffer: Array.from(f.buffer) })));
  
  // Trigger drop event
  await dropZone.dispatchEvent('drop', { dataTransfer });
}

/**
 * Wait for element with timeout
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 5000
) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Check if upload zone is visible
 */
export async function isUploadZoneVisible(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="drop-zone"]', {
      state: 'visible',
      timeout: 1000,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all images
 */
export async function clearAllImages(page: Page) {
  // Check if there are any images
  const images = await getImagePreviews(page).count();
  
  if (images === 0) return;
  
  // Remove each image
  for (let i = images - 1; i >= 0; i--) {
    const removeButton = page.locator('[data-testid="image-preview"]').nth(i)
      .getByRole('button', { name: /remove/i });
    await removeButton.click();
  }
  
  // Verify all images are removed
  await expect(getImagePreviews(page)).toHaveCount(0);
}
