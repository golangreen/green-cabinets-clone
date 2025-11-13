/**
 * Storage Analyzer Service
 * Analyzes gallery storage usage and provides compression recommendations
 */

import { supabase } from '@/integrations/supabase/client';
import { MAX_FILE_SIZE, COMPRESSION_QUALITY_MAP } from '../config/constants';
import { estimateCompressedSize, suggestCompressionQuality } from './compressionService';

// ============================================================================
// Types
// ============================================================================

export interface StorageImage {
  id: string;
  path: string;
  size: number;
  name: string;
  bucket: string;
  created_at: string;
  metadata?: {
    mimetype?: string;
    width?: number;
    height?: number;
  };
}

export interface CompressionRecommendation {
  image: StorageImage;
  currentSize: number;
  suggestedQuality: 'high' | 'medium' | 'low';
  estimatedSize: number;
  potentialSavings: number;
  savingsPercent: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StorageAnalysis {
  totalImages: number;
  totalSize: number;
  oversizedImages: StorageImage[];
  recommendations: CompressionRecommendation[];
  potentialTotalSavings: number;
  avgImageSize: number;
  largestImages: StorageImage[];
}

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Fetch all images from gallery storage bucket
 */
export async function fetchGalleryImages(): Promise<StorageImage[]> {
  try {
    // List all files in the gallery bucket
    const { data: files, error } = await supabase.storage
      .from('gallery')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error fetching gallery images:', error);
      throw error;
    }

    if (!files || files.length === 0) {
      return [];
    }

    // Map to StorageImage format
    const images: StorageImage[] = files
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map(file => ({
        id: file.id || file.name,
        path: file.name,
        size: file.metadata?.size || 0,
        name: file.name,
        bucket: 'gallery',
        created_at: file.created_at || new Date().toISOString(),
        metadata: {
          mimetype: file.metadata?.mimetype,
          width: file.metadata?.width,
          height: file.metadata?.height,
        },
      }));

    return images;
  } catch (error) {
    console.error('Failed to fetch gallery images:', error);
    throw error;
  }
}

/**
 * Get public URL for an image
 */
export function getImagePublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Identify oversized images
 */
export function identifyOversizedImages(images: StorageImage[]): StorageImage[] {
  return images.filter(img => img.size > MAX_FILE_SIZE);
}

/**
 * Generate compression recommendation for a single image
 */
export function generateRecommendation(image: StorageImage): CompressionRecommendation | null {
  // Only recommend compression for images that could benefit
  const minRecommendationSize = MAX_FILE_SIZE * 0.5; // 5MB threshold
  
  if (image.size < minRecommendationSize) {
    return null; // Image is already small enough
  }

  const suggestedQuality = suggestCompressionQuality(image.size);
  
  // Ensure we have a valid compression quality (not 'none')
  const validQuality: 'high' | 'medium' | 'low' = 
    suggestedQuality === 'none' ? 'high' : suggestedQuality;
  
  const estimatedSize = estimateCompressedSize(image.size, validQuality);
  const potentialSavings = image.size - estimatedSize;
  const savingsPercent = (potentialSavings / image.size) * 100;

  // Determine priority based on size and potential savings
  let priority: 'high' | 'medium' | 'low';
  let reason: string;

  if (image.size > MAX_FILE_SIZE) {
    priority = 'high';
    reason = 'Exceeds maximum size limit. Compression required.';
  } else if (savingsPercent > 50) {
    priority = 'high';
    reason = 'High compression potential. Could save significant storage.';
  } else if (savingsPercent > 30) {
    priority = 'medium';
    reason = 'Moderate compression potential. Good candidate for optimization.';
  } else {
    priority = 'low';
    reason = 'Low compression potential. Optional optimization.';
  }

  return {
    image,
    currentSize: image.size,
    suggestedQuality: validQuality,
    estimatedSize,
    potentialSavings,
    savingsPercent,
    reason,
    priority,
  };
}

/**
 * Analyze entire gallery storage
 */
export async function analyzeGalleryStorage(): Promise<StorageAnalysis> {
  const images = await fetchGalleryImages();
  
  if (images.length === 0) {
    return {
      totalImages: 0,
      totalSize: 0,
      oversizedImages: [],
      recommendations: [],
      potentialTotalSavings: 0,
      avgImageSize: 0,
      largestImages: [],
    };
  }

  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  const avgImageSize = totalSize / images.length;

  // Identify oversized images
  const oversizedImages = identifyOversizedImages(images);

  // Generate recommendations
  const recommendations = images
    .map(generateRecommendation)
    .filter((rec): rec is CompressionRecommendation => rec !== null)
    .sort((a, b) => {
      // Sort by priority (high first) then by potential savings
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.potentialSavings - a.potentialSavings;
    });

  const potentialTotalSavings = recommendations.reduce(
    (sum, rec) => sum + rec.potentialSavings,
    0
  );

  // Get largest images
  const largestImages = [...images]
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);

  return {
    totalImages: images.length,
    totalSize,
    oversizedImages,
    recommendations,
    potentialTotalSavings,
    avgImageSize,
    largestImages,
  };
}

/**
 * Get storage statistics by category
 */
export function getStorageStats(images: StorageImage[]): {
  small: number;
  medium: number;
  large: number;
  oversized: number;
} {
  const stats = {
    small: 0,    // < 2MB
    medium: 0,   // 2-5MB
    large: 0,    // 5-10MB
    oversized: 0, // > 10MB
  };

  images.forEach(img => {
    const sizeMB = img.size / (1024 * 1024);
    
    if (sizeMB < 2) {
      stats.small++;
    } else if (sizeMB < 5) {
      stats.medium++;
    } else if (sizeMB < 10) {
      stats.large++;
    } else {
      stats.oversized++;
    }
  });

  return stats;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate storage usage percentage
 */
export function calculateStoragePercentage(
  used: number,
  total: number = 1024 * 1024 * 1024 // Default 1GB
): number {
  return (used / total) * 100;
}
