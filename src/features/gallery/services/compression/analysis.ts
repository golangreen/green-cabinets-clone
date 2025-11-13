/**
 * Compression Analysis Module
 * Handles size detection, estimation, and recommendations
 */

import type { CompressionQuality } from '../../types';
import { MAX_FILE_SIZE, COMPRESSION_QUALITY_MAP } from '../../config/constants';

// ============================================================================
// Types
// ============================================================================

export interface OversizedFile {
  file: File;
  currentSize: number;
  estimatedSizes: Record<CompressionQuality, number>;
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Check if a file exceeds the maximum size limit
 */
export function isOversized(file: File): boolean {
  return file.size > MAX_FILE_SIZE;
}

/**
 * Filter out oversized files from a list
 */
export function detectOversizedFiles(files: File[]): File[] {
  return files.filter(isOversized);
}

/**
 * Separate files into oversized and acceptable
 */
export function separateFilesBySize(files: File[]): {
  oversized: File[];
  acceptable: File[];
} {
  const oversized: File[] = [];
  const acceptable: File[] = [];

  files.forEach(file => {
    if (isOversized(file)) {
      oversized.push(file);
    } else {
      acceptable.push(file);
    }
  });

  return { oversized, acceptable };
}

// ============================================================================
// Size Estimation
// ============================================================================

/**
 * Estimate compressed file size based on quality level
 * This is a rough estimation based on typical compression ratios
 */
export function estimateCompressedSize(
  originalSize: number,
  quality: CompressionQuality
): number {
  if (quality === 'none') {
    return originalSize;
  }
  
  // Base compression factor (how much smaller the file gets)
  // Lower quality = more compression = smaller multiplier
  const baseCompressionFactor = quality === 'high' ? 0.7 : quality === 'medium' ? 0.5 : 0.3;
  
  return Math.round(originalSize * baseCompressionFactor);
}

/**
 * Estimate sizes for all compression levels
 */
export function estimateAllCompressionSizes(
  originalSize: number
): Record<CompressionQuality, number> {
  return {
    none: originalSize,
    high: estimateCompressedSize(originalSize, 'high'),
    medium: estimateCompressedSize(originalSize, 'medium'),
    low: estimateCompressedSize(originalSize, 'low'),
  };
}

/**
 * Create oversized file objects with size estimations
 */
export async function analyzeOversizedFiles(files: File[]): Promise<OversizedFile[]> {
  return files.map(file => ({
    file,
    currentSize: file.size,
    estimatedSizes: estimateAllCompressionSizes(file.size),
  }));
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if compression will likely bring file under limit
 */
export function willCompressionHelp(
  fileSize: number,
  quality: CompressionQuality
): boolean {
  const estimatedSize = estimateCompressedSize(fileSize, quality);
  return estimatedSize <= MAX_FILE_SIZE;
}

/**
 * Check if estimated size will meet the size limit
 */
export function willMeetLimit(estimatedSize: number): boolean {
  return estimatedSize <= MAX_FILE_SIZE;
}

/**
 * Suggest optimal compression quality for a file
 */
export function suggestCompressionQuality(fileSize: number): CompressionQuality {
  // If file is massively over limit (>2x), suggest low quality
  if (fileSize > MAX_FILE_SIZE * 2) {
    return 'low';
  }
  
  // If file is moderately over limit (1.5-2x), suggest medium
  if (fileSize > MAX_FILE_SIZE * 1.5) {
    return 'medium';
  }
  
  // If file is slightly over limit (<1.5x), suggest high
  return 'high';
}

/**
 * Get human-readable compression recommendation
 */
export function getCompressionRecommendation(fileSize: number): string {
  const quality = suggestCompressionQuality(fileSize);
  const estimatedSize = estimateCompressedSize(fileSize, quality);
  const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  const estimatedMB = (estimatedSize / (1024 * 1024)).toFixed(2);
  
  if (estimatedSize > MAX_FILE_SIZE) {
    return `File is ${sizeMB}MB. Even with maximum compression, it may still exceed the limit. Consider resizing the image.`;
  }
  
  return `File is ${sizeMB}MB. Using ${quality} quality compression should reduce it to approximately ${estimatedMB}MB.`;
}

/**
 * Get description for a compression quality level
 */
export function getCompressionDescription(quality: CompressionQuality): string {
  switch (quality) {
    case 'high':
      return 'Minimal quality loss, larger file size';
    case 'medium':
      return 'Balanced quality and size (Recommended)';
    case 'low':
      return 'Maximum compression, noticeable quality loss';
    case 'none':
      return 'No compression applied';
  }
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format file size in MB
 */
export function formatFileSize(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}

/**
 * Format file size with unit (KB/MB/GB)
 */
export function formatFileSizeWithUnit(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}
