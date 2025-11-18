/**
 * Gallery Services
 * Export all gallery-related services
 */

// Export only quality analysis from imageProcessingService to avoid conflicts
export {
  extractImageDimensions,
  analyzeImageQuality,
  convertImageToBase64,
  convertImageToDataURL,
  getQualityStatusText,
  getQualityBadgeVariant,
  type ImageDimensions,
  type ImageQualityResult,
  type ImageQualityIssue,
} from './imageProcessingService';

export * from './error';
export * from './validationService';
export * from './compression';
// Export storage analyzer but avoid formatFileSize conflict
export {
  fetchGalleryImages,
  getImagePublicUrl,
  identifyOversizedImages,
  generateRecommendation,
  analyzeGalleryStorage,
  getStorageStats,
  formatFileSize as formatStorageFileSize,
  calculateStoragePercentage,
  type StorageImageAnalyzer,
  type CompressionRecommendation,
  type StorageAnalysis,
} from './storageAnalyzerService';
