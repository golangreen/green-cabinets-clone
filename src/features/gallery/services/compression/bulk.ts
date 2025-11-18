/**
 * Bulk Compression Module
 * Handles batch compression operations with progress tracking
 */

import { supabase } from '@/integrations/supabase/client';
import { compressImage } from './core';
import { estimateCompressedSize } from './analysis';
import type { CompressionQuality } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface StorageImage {
  name: string;
  id: string;
  size: number;
  created_at: string;
  bucket_id: string;
  bucket?: string; // Optional for compatibility
}

export interface BulkCompressionProgress {
  status: 'downloading' | 'compressing' | 'uploading' | 'complete' | 'error';
  currentFile: string;
  currentIndex: number;
  totalFiles: number;
  percentage: number;
}

export interface BulkCompressionResult {
  image: StorageImage;
  success: boolean;
  originalSize: number;
  compressedSize: number;
  savings: number;
  error?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Download an image from storage as a File object
 */
async function downloadImageAsFile(bucket: string, path: string): Promise<File> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    throw new Error(`Failed to download ${path}: ${error.message}`);
  }

  if (!data) {
    throw new Error(`No data received for ${path}`);
  }

  // Create a File object from the blob
  const fileName = path.split('/').pop() || 'image.jpg';
  return new File([data], fileName, { type: data.type });
}

/**
 * Upload a compressed image back to storage
 */
async function uploadCompressedImage(
  bucket: string,
  path: string,
  file: File
): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Failed to upload ${path}: ${error.message}`);
  }
}

// ============================================================================
// Core Bulk Compression
// ============================================================================

/**
 * Compress multiple images in storage with progress tracking
 */
export async function bulkCompressImages(
  images: StorageImage[],
  quality: CompressionQuality,
  onProgress?: (progress: BulkCompressionProgress) => void
): Promise<BulkCompressionResult[]> {
  const results: BulkCompressionResult[] = [];
  const totalFiles = images.length;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const currentIndex = i + 1;

    try {
      // Download
      onProgress?.({
        status: 'downloading',
        currentFile: image.name,
        currentIndex,
        totalFiles,
        percentage: Math.round((i / totalFiles) * 100),
      });

      const file = await downloadImageAsFile(image.bucket_id, image.name);
      const originalSize = file.size;

      // Compress
      onProgress?.({
        status: 'compressing',
        currentFile: image.name,
        currentIndex,
        totalFiles,
        percentage: Math.round(((i + 0.33) / totalFiles) * 100),
      });

      const compressedFile = await compressImage(file, quality);
      const compressedSize = compressedFile.size;

      // Upload
      onProgress?.({
        status: 'uploading',
        currentFile: image.name,
        currentIndex,
        totalFiles,
        percentage: Math.round(((i + 0.66) / totalFiles) * 100),
      });

      await uploadCompressedImage(image.bucket_id, image.name, compressedFile);

      // Success
      results.push({
        image,
        success: true,
        originalSize,
        compressedSize,
        savings: originalSize - compressedSize,
      });
    } catch (error) {
      console.error(`Failed to compress ${image.name}:`, error);
      results.push({
        image,
        success: false,
        originalSize: image.size,
        compressedSize: image.size,
        savings: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Complete
  onProgress?.({
    status: 'complete',
    currentFile: '',
    currentIndex: totalFiles,
    totalFiles,
    percentage: 100,
  });

  return results;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate total potential savings for a set of images
 */
export function calculateTotalSavings(
  images: StorageImage[],
  quality: CompressionQuality,
  estimator: (size: number, quality: CompressionQuality) => number = estimateCompressedSize
): number {
  return images.reduce((total, image) => {
    const estimatedSize = estimator(image.size, quality);
    const savings = image.size - estimatedSize;
    return total + Math.max(0, savings);
  }, 0);
}

/**
 * Validate that bulk compression can proceed
 */
export function validateBulkCompression(images: StorageImage[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (images.length === 0) {
    errors.push('No images selected for compression');
  }

  if (images.length > 100) {
    errors.push('Cannot compress more than 100 images at once');
  }

  // Check if all images have valid bucket_id
  const invalidImages = images.filter(img => !img.bucket_id);
  if (invalidImages.length > 0) {
    errors.push(`${invalidImages.length} images have invalid bucket information`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
