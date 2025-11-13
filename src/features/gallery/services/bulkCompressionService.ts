/**
 * Bulk Compression Service
 * Handles downloading, compressing, and re-uploading multiple images
 */

import { supabase } from '@/integrations/supabase/client';
import { compressImage } from './imageProcessingService';
import type { CompressionQuality } from '../types';
import type { StorageImage } from './storageAnalyzerService';

// ============================================================================
// Types
// ============================================================================

export interface BulkCompressionProgress {
  total: number;
  current: number;
  currentFile: string;
  status: 'downloading' | 'compressing' | 'uploading' | 'complete' | 'error';
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
// Download Functions
// ============================================================================

/**
 * Download image from storage as File object
 */
async function downloadImageAsFile(bucket: string, path: string): Promise<File> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      throw new Error(`Download failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from download');
    }

    // Get file name from path
    const fileName = path.split('/').pop() || 'image.jpg';
    
    // Create File object from Blob
    const file = new File([data], fileName, { type: data.type });
    
    return file;
  } catch (error) {
    console.error(`Failed to download ${path}:`, error);
    throw error;
  }
}

// ============================================================================
// Upload Functions
// ============================================================================

/**
 * Upload compressed image back to storage (replacing original)
 */
async function uploadCompressedImage(
  bucket: string,
  path: string,
  file: File
): Promise<void> {
  try {
    // Delete original file first
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (deleteError) {
      console.warn('Failed to delete original file:', deleteError);
      // Continue anyway - we'll try to upload
    }

    // Upload compressed version
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
  } catch (error) {
    console.error(`Failed to upload ${path}:`, error);
    throw error;
  }
}

// ============================================================================
// Bulk Compression
// ============================================================================

/**
 * Compress multiple images with progress tracking
 */
export async function bulkCompressImages(
  images: StorageImage[],
  quality: CompressionQuality,
  onProgress?: (progress: BulkCompressionProgress) => void
): Promise<BulkCompressionResult[]> {
  const results: BulkCompressionResult[] = [];
  const total = images.length;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const current = i + 1;
    const percentage = Math.round((current / total) * 100);

    try {
      // Step 1: Download
      onProgress?.({
        total,
        current,
        currentFile: image.name,
        status: 'downloading',
        percentage: percentage - 2, // Slight offset for visual feedback
      });

      const originalFile = await downloadImageAsFile(image.bucket, image.path);
      const originalSize = originalFile.size;

      // Step 2: Compress
      onProgress?.({
        total,
        current,
        currentFile: image.name,
        status: 'compressing',
        percentage: percentage - 1,
      });

      const compressedFile = await compressImage(originalFile, quality);
      const compressedSize = compressedFile.size;
      const savings = originalSize - compressedSize;

      // Step 3: Upload
      onProgress?.({
        total,
        current,
        currentFile: image.name,
        status: 'uploading',
        percentage,
      });

      await uploadCompressedImage(image.bucket, image.path, compressedFile);

      // Success
      results.push({
        image,
        success: true,
        originalSize,
        compressedSize,
        savings,
      });

      onProgress?.({
        total,
        current,
        currentFile: image.name,
        status: 'complete',
        percentage,
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

  return results;
}

/**
 * Calculate total potential savings for selected images
 */
export function calculateTotalSavings(
  images: StorageImage[],
  quality: CompressionQuality,
  estimator: (size: number, quality: CompressionQuality) => number
): number {
  return images.reduce((total, image) => {
    const estimated = estimator(image.size, quality);
    return total + (image.size - estimated);
  }, 0);
}

/**
 * Validate images before bulk compression
 */
export function validateBulkCompression(images: StorageImage[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (images.length === 0) {
    errors.push('No images selected');
  }

  if (images.length > 50) {
    errors.push('Cannot compress more than 50 images at once');
  }

  const invalidImages = images.filter(img => !img.path || !img.bucket);
  if (invalidImages.length > 0) {
    errors.push(`${invalidImages.length} image(s) have invalid paths`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
