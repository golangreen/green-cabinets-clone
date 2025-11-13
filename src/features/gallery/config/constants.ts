/**
 * Gallery Feature Configuration
 * Centralized constants for quality thresholds, compression levels, and settings
 */

import type { CompressionQuality } from '../types';

// ============================================================================
// Image Quality Thresholds
// ============================================================================

/**
 * Blur detection thresholds (Laplacian variance values)
 * Higher values indicate sharper images
 */
export const BLUR_THRESHOLDS = {
  EXCELLENT: 150,
  GOOD: 100,
  ACCEPTABLE: 50,
} as const;

/**
 * Resolution quality thresholds (minimum dimension in pixels)
 */
export const RESOLUTION_THRESHOLDS = {
  EXCELLENT: 1920,
  GOOD: 1280,
  ACCEPTABLE: 800,
  MINIMUM_WIDTH: 800,
  MINIMUM_HEIGHT: 600,
} as const;

// ============================================================================
// Image Compression Settings
// ============================================================================

/**
 * Compression quality mapping to actual quality values (0-1)
 */
export const COMPRESSION_QUALITY_MAP: Record<CompressionQuality, number> = {
  none: 1.0,
  high: 0.9,
  medium: 0.7,
  low: 0.5,
} as const;

/**
 * Maximum file size for uploads (in bytes)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ============================================================================
// Image Processing Settings
// ============================================================================

/**
 * Sample dimensions for blur detection analysis
 * Using smaller samples improves performance without significant quality loss
 */
export const BLUR_DETECTION_SAMPLE_SIZE = 512;

/**
 * Canvas rendering quality
 */
export const CANVAS_IMAGE_SMOOTHING = true;

// ============================================================================
// Upload Settings
// ============================================================================

/**
 * Maximum number of concurrent uploads
 */
export const MAX_CONCURRENT_UPLOADS = 3;

/**
 * Upload retry configuration
 */
export const UPLOAD_RETRY = {
  MAX_ATTEMPTS: 3,
  DELAY_MS: 1000,
  BACKOFF_MULTIPLIER: 2,
} as const;

// ============================================================================
// UI Constants
// ============================================================================

/**
 * Gallery display settings
 */
export const GALLERY_DISPLAY = {
  IMAGES_PER_PAGE: 20,
  THUMBNAIL_SIZE: 200,
  PREVIEW_SIZE: 800,
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// ============================================================================
// Supported File Types
// ============================================================================

/**
 * Supported image MIME types
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Supported image file extensions
 */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
] as const;

// ============================================================================
// Quality Warning Messages
// ============================================================================

/**
 * Quality issue descriptions
 */
export const QUALITY_MESSAGES = {
  VERY_LOW_RESOLUTION: 'Very low resolution',
  LOW_RESOLUTION: 'Low resolution',
  VERY_BLURRY: 'Very blurry',
  BLURRY: 'Slightly blurry',
  POOR_QUALITY: 'This image may not meet quality standards for gallery display',
  GOOD_QUALITY: 'Good quality',
  EXCELLENT_QUALITY: 'Excellent quality',
} as const;
