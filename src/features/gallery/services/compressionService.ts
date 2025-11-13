/**
 * Compression Service
 * Handles automatic compression detection and estimation
 */

import { compressImage } from './imageProcessingService';
import type { CompressionQuality } from '../types';
import type { OversizedFile } from '../components/CompressionDialog';
import { MAX_FILE_SIZE, COMPRESSION_QUALITY_MAP } from '../config/constants';

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
  const compressionRatio = COMPRESSION_QUALITY_MAP[quality];
  
  // Estimate based on quality:
  // - JPEG compression typically achieves 60-90% size reduction
  // - Higher quality = less compression = larger file
  // These are rough estimates and actual results may vary
  
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
// Compression Operations
// ============================================================================

/**
 * Compress a single file with progress tracking
 */
export async function compressFileWithProgress(
  file: File,
  quality: CompressionQuality,
  onProgress?: (progress: number) => void
): Promise<File> {
  onProgress?.(0);
  
  try {
    const compressedFile = await compressImage(file, quality);
    onProgress?.(100);
    return compressedFile;
  } catch (error) {
    onProgress?.(0);
    throw error;
  }
}

/**
 * Compress multiple files in sequence
 */
export async function compressFiles(
  files: File[],
  quality: CompressionQuality,
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressedFiles: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    
    try {
      const compressed = await compressImage(files[i], quality);
      compressedFiles.push(compressed);
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error);
      // On error, keep original file
      compressedFiles.push(files[i]);
    }
  }
  
  return compressedFiles;
}

/**
 * Compress files and provide detailed results
 */
export async function compressFilesWithResults(
  files: File[],
  quality: CompressionQuality,
  onProgress?: (current: number, total: number) => void
): Promise<{
  compressed: File[];
  results: Array<{
    original: File;
    compressed: File;
    originalSize: number;
    compressedSize: number;
    reduction: number;
  }>;
}> {
  const compressed: File[] = [];
  const results: Array<{
    original: File;
    compressed: File;
    originalSize: number;
    compressedSize: number;
    reduction: number;
  }> = [];
  
  for (let i = 0; i < files.length; i++) {
    onProgress?.(i + 1, files.length);
    
    const originalFile = files[i];
    
    try {
      const compressedFile = await compressImage(originalFile, quality);
      
      const originalSize = originalFile.size;
      const compressedSize = compressedFile.size;
      const reduction = ((originalSize - compressedSize) / originalSize) * 100;
      
      compressed.push(compressedFile);
      results.push({
        original: originalFile,
        compressed: compressedFile,
        originalSize,
        compressedSize,
        reduction,
      });
    } catch (error) {
      console.error(`Failed to compress ${originalFile.name}:`, error);
      // On error, use original
      compressed.push(originalFile);
      results.push({
        original: originalFile,
        compressed: originalFile,
        originalSize: originalFile.size,
        compressedSize: originalFile.size,
        reduction: 0,
      });
    }
  }
  
  return { compressed, results };
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
