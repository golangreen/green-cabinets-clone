/**
 * Compression Services
 * Centralized export for all compression functionality
 */

// Core compression operations
export {
  compressImage,
  compressFileWithProgress,
  compressFiles,
  compressFilesWithResults,
  type CompressionResult,
} from './core';

// Analysis and estimation
export {
  isOversized,
  detectOversizedFiles,
  separateFilesBySize,
  estimateCompressedSize,
  estimateAllCompressionSizes,
  analyzeOversizedFiles,
  willCompressionHelp,
  willMeetLimit,
  suggestCompressionQuality,
  getCompressionRecommendation,
  getCompressionDescription,
  formatFileSize,
  formatFileSizeWithUnit,
  type OversizedFile,
} from './analysis';

// Bulk compression operations
export {
  bulkCompressImages,
  calculateTotalSavings,
  validateBulkCompression,
  type StorageImage,
  type BulkCompressionProgress,
  type BulkCompressionResult,
} from './bulk';
