/**
 * Core Compression Module
 * Handles basic image compression operations
 */

import type { CompressionQuality } from '../../types';
import { COMPRESSION_QUALITY_MAP } from '../../config/constants';
import { logger } from '@/lib/logger';

// ============================================================================
// Core Compression Function
// ============================================================================

/**
 * Compress an image file using canvas and blob conversion
 */
export async function compressImage(file: File, quality: CompressionQuality): Promise<File> {
  if (quality === 'none') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(img.src);
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(img.src);
            
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          COMPRESSION_QUALITY_MAP[quality]
        );
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// ============================================================================
// Single File Compression with Progress
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

// ============================================================================
// Multiple File Compression
// ============================================================================

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
      logger.error(`Failed to compress ${files[i].name}`, error, { component: 'CompressionCore' });
      // On error, keep original file
      compressedFiles.push(files[i]);
    }
  }
  
  return compressedFiles;
}

// ============================================================================
// Compression with Detailed Results
// ============================================================================

export interface CompressionResult {
  original: File;
  compressed: File;
  originalSize: number;
  compressedSize: number;
  reduction: number;
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
  results: CompressionResult[];
}> {
  const compressed: File[] = [];
  const results: CompressionResult[] = [];
  
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
      logger.error(`Failed to compress ${originalFile.name}`, error, { component: 'CompressionCore' });
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
