/**
 * Error Logger
 * Core error creation and logging functionality
 */

// ============================================================================
// Error Types
// ============================================================================

export enum ErrorType {
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  QUALITY_CHECK_FAILED = 'QUALITY_CHECK_FAILED',
  AI_GENERATION_FAILED = 'AI_GENERATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  COMPRESSION_FAILED = 'COMPRESSION_FAILED',
  UNKNOWN = 'UNKNOWN',
}

export interface GalleryError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  fileName?: string;
}

// ============================================================================
// Error Messages
// ============================================================================

const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.UPLOAD_FAILED]: 'Failed to upload image',
  [ErrorType.PROCESSING_FAILED]: 'Failed to process image',
  [ErrorType.QUALITY_CHECK_FAILED]: 'Failed to analyze image quality',
  [ErrorType.AI_GENERATION_FAILED]: 'Failed to generate AI metadata',
  [ErrorType.NETWORK_ERROR]: 'Network connection issue',
  [ErrorType.STORAGE_ERROR]: 'Storage operation failed',
  [ErrorType.VALIDATION_ERROR]: 'Invalid image data',
  [ErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred',
  [ErrorType.FILE_TOO_LARGE]: 'File size exceeds maximum allowed size',
  [ErrorType.INVALID_FILE_TYPE]: 'Invalid file type. Please upload an image file',
  [ErrorType.COMPRESSION_FAILED]: 'Failed to compress image',
  [ErrorType.UNKNOWN]: 'An unexpected error occurred',
};

// ============================================================================
// Error Log Storage
// ============================================================================

let errorLog: GalleryError[] = [];
const MAX_LOG_SIZE = 100;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Create a gallery error object
 */
export function createError(
  type: ErrorType,
  originalError?: any,
  fileName?: string
): GalleryError {
  const message = ERROR_MESSAGES[type] || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR];
  
  return {
    type,
    message,
    details: originalError,
    timestamp: new Date(),
    fileName,
  };
}

/**
 * Log an error
 */
export function logError(error: GalleryError): void {
  // Add to log
  errorLog.push(error);
  
  // Trim log if too large
  if (errorLog.length > MAX_LOG_SIZE) {
    errorLog = errorLog.slice(-MAX_LOG_SIZE);
  }

  // Console log for debugging
  console.error('[Gallery Error]', {
    type: error.type,
    message: error.message,
    fileName: error.fileName,
    details: error.details,
    timestamp: error.timestamp,
  });
}

/**
 * Get recent errors
 */
export function getRecentErrors(count: number = 10): GalleryError[] {
  return errorLog.slice(-count);
}

/**
 * Get errors by type
 */
export function getErrorsByType(type: ErrorType): GalleryError[] {
  return errorLog.filter(error => error.type === type);
}

/**
 * Clear error log
 */
export function clearErrors(): void {
  errorLog = [];
}

/**
 * Get all errors
 */
export function getAllErrors(): GalleryError[] {
  return [...errorLog];
}
