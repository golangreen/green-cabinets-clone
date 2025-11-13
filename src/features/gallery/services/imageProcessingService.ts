/**
 * Image Processing Service
 * Handles all image manipulation, analysis, and conversion operations
 */

import type {
  ImageDimensions,
  ImageQualityResult,
  ImageQualityIssue,
  CompressionQuality,
} from '../types';

// ============================================================================
// Constants
// ============================================================================

const BLUR_THRESHOLD_EXCELLENT = 150;
const BLUR_THRESHOLD_GOOD = 100;
const BLUR_THRESHOLD_ACCEPTABLE = 50;

const MIN_RESOLUTION_EXCELLENT = 1920;
const MIN_RESOLUTION_GOOD = 1280;
const MIN_RESOLUTION_ACCEPTABLE = 800;

const COMPRESSION_QUALITY_MAP: Record<CompressionQuality, number> = {
  none: 1.0,
  high: 0.9,
  medium: 0.7,
  low: 0.5,
};

// ============================================================================
// Image Dimension Extraction
// ============================================================================

/**
 * Extract width and height from an image file
 */
export async function extractImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// ============================================================================
// Image Quality Analysis
// ============================================================================

/**
 * Analyze image quality using blur detection and resolution checks
 */
export async function analyzeImageQuality(file: File): Promise<ImageQualityResult> {
  const dimensions = await extractImageDimensions(file);
  const blurScore = await detectBlur(file);
  
  const issues: ImageQualityIssue[] = [];
  const minDimension = Math.min(dimensions.width, dimensions.height);
  
  // Check resolution
  let isLowResolution = false;
  if (minDimension < MIN_RESOLUTION_ACCEPTABLE) {
    issues.push('very-low-resolution');
    isLowResolution = true;
  } else if (minDimension < MIN_RESOLUTION_GOOD) {
    issues.push('low-resolution');
    isLowResolution = true;
  }
  
  // Check blur
  let isBlurry = false;
  if (blurScore < BLUR_THRESHOLD_ACCEPTABLE) {
    issues.push('very-blurry');
    isBlurry = true;
  } else if (blurScore < BLUR_THRESHOLD_GOOD) {
    issues.push('blurry');
    isBlurry = true;
  }
  
  if (issues.length === 0) {
    issues.push('none');
  }
  
  // Determine overall quality
  let overallQuality: ImageQualityResult['overallQuality'];
  if (blurScore >= BLUR_THRESHOLD_EXCELLENT && minDimension >= MIN_RESOLUTION_EXCELLENT) {
    overallQuality = 'excellent';
  } else if (blurScore >= BLUR_THRESHOLD_GOOD && minDimension >= MIN_RESOLUTION_GOOD) {
    overallQuality = 'good';
  } else if (blurScore >= BLUR_THRESHOLD_ACCEPTABLE && minDimension >= MIN_RESOLUTION_ACCEPTABLE) {
    overallQuality = 'acceptable';
  } else {
    overallQuality = 'poor';
  }
  
  return {
    isBlurry,
    blurScore,
    isLowResolution,
    resolution: dimensions,
    issues,
    overallQuality,
  };
}

/**
 * Detect blur using Laplacian variance method
 */
async function detectBlur(file: File): Promise<number> {
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
        
        // Use smaller dimensions for faster processing
        const maxDim = 500;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const score = calculateLaplacianVariance(imageData);
        
        URL.revokeObjectURL(img.src);
        resolve(score);
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for blur detection'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate Laplacian variance for blur detection
 */
function calculateLaplacianVariance(imageData: ImageData): number {
  const { width, height, data } = imageData;
  const grayscale = new Float32Array(width * height);
  
  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    grayscale[idx] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  
  // Apply Laplacian operator
  const laplacian: number[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const value = 
        -grayscale[idx - width - 1] - grayscale[idx - width] - grayscale[idx - width + 1] +
        -grayscale[idx - 1] + 8 * grayscale[idx] - grayscale[idx + 1] +
        -grayscale[idx + width - 1] - grayscale[idx + width] - grayscale[idx + width + 1];
      laplacian.push(value);
    }
  }
  
  // Calculate variance
  const mean = laplacian.reduce((sum, val) => sum + val, 0) / laplacian.length;
  const variance = laplacian.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / laplacian.length;
  
  return variance;
}

// ============================================================================
// Image Compression
// ============================================================================

/**
 * Compress an image file based on quality setting
 */
export async function compressImage(
  file: File,
  quality: CompressionQuality
): Promise<File> {
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
// Base64 Conversion
// ============================================================================

/**
 * Convert image file to base64 string
 */
export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to convert image to base64'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Convert image file to data URL (includes prefix)
 */
export async function convertImageToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to convert image to data URL'));
    };
    
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// Quality Helpers
// ============================================================================

/**
 * Get user-friendly quality status text
 */
export function getQualityStatusText(quality: ImageQualityResult): string {
  if (quality.issues.includes('none')) {
    return 'Excellent quality';
  }
  
  const messages: string[] = [];
  
  if (quality.issues.includes('very-blurry')) {
    messages.push('Very blurry');
  } else if (quality.issues.includes('blurry')) {
    messages.push('Slightly blurry');
  }
  
  if (quality.issues.includes('very-low-resolution')) {
    messages.push('Very low resolution');
  } else if (quality.issues.includes('low-resolution')) {
    messages.push('Low resolution');
  }
  
  return messages.join(', ');
}

/**
 * Get badge variant based on quality
 */
export function getQualityBadgeVariant(
  quality: ImageQualityResult
): 'default' | 'secondary' | 'destructive' {
  if (quality.overallQuality === 'poor') return 'destructive';
  if (quality.overallQuality === 'acceptable') return 'secondary';
  return 'default';
}
