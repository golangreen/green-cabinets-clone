/**
 * Error Service
 * Centralized error handling and logging for gallery operations
 */

import { toast } from 'sonner';

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

const ERROR_RECOVERY_HINTS: Record<ErrorType, string> = {
  [ErrorType.UPLOAD_FAILED]: 'Please check your connection and try again',
  [ErrorType.PROCESSING_FAILED]: 'The image file may be corrupted',
  [ErrorType.QUALITY_CHECK_FAILED]: 'Image quality check was skipped',
  [ErrorType.AI_GENERATION_FAILED]: 'You can add metadata manually',
  [ErrorType.NETWORK_ERROR]: 'Please check your internet connection',
  [ErrorType.STORAGE_ERROR]: 'Please try again or contact support',
  [ErrorType.VALIDATION_ERROR]: 'Please check the image format',
  [ErrorType.UNKNOWN_ERROR]: 'Please try again or contact support',
  [ErrorType.FILE_TOO_LARGE]: 'Consider compressing the image before uploading',
  [ErrorType.INVALID_FILE_TYPE]: 'Supported formats: JPEG, PNG, WebP, GIF',
  [ErrorType.COMPRESSION_FAILED]: 'Try a different compression level',
  [ErrorType.UNKNOWN]: 'Please try again or contact support',
};

// ============================================================================
// Error Service
// ============================================================================

class ErrorService {
  private errorLog: GalleryError[] = [];
  private maxLogSize = 100;

  /**
   * Create a gallery error object
   */
  createError(
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
  logError(error: GalleryError): void {
    // Add to log
    this.errorLog.push(error);
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
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
   * Handle an error with user feedback
   */
  handleError(
    type: ErrorType,
    originalError?: any,
    fileName?: string,
    showToast: boolean = true
  ): GalleryError {
    const error = this.createError(type, originalError, fileName);
    this.logError(error);

    if (showToast) {
      const hint = ERROR_RECOVERY_HINTS[type];
      const fileInfo = fileName ? ` (${fileName})` : '';
      
      toast.error(`${error.message}${fileInfo}`, {
        description: hint,
        duration: 5000,
      });
    }

    return error;
  }

  /**
   * Handle a non-critical error with warning
   */
  handleWarning(
    type: ErrorType,
    originalError?: any,
    fileName?: string
  ): GalleryError {
    const error = this.createError(type, originalError, fileName);
    this.logError(error);

    const hint = ERROR_RECOVERY_HINTS[type];
    const fileInfo = fileName ? ` (${fileName})` : '';

    toast.warning(`${error.message}${fileInfo}`, {
      description: hint,
      duration: 4000,
    });

    return error;
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): GalleryError[] {
    return this.errorLog.slice(-count);
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): GalleryError[] {
    return this.errorLog.filter(error => error.type === type);
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errorLog = [];
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable(type: ErrorType): boolean {
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.QUALITY_CHECK_FAILED,
      ErrorType.AI_GENERATION_FAILED,
    ].includes(type);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<ErrorType, number> {
    const stats: Record<string, number> = {};
    
    this.errorLog.forEach(error => {
      stats[error.type] = (stats[error.type] || 0) + 1;
    });

    return stats as Record<ErrorType, number>;
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const errorService = new ErrorService();

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Safe async operation wrapper with error handling
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorType: ErrorType,
  fileName?: string,
  fallbackValue?: T
): Promise<{ success: true; data: T } | { success: false; error: GalleryError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const galleryError = errorService.handleError(errorType, error, fileName);
    
    if (fallbackValue !== undefined) {
      return { success: true, data: fallbackValue };
    }
    
    return { success: false, error: galleryError };
  }
}

/**
 * Safe sync operation wrapper with error handling
 */
export function safeSync<T>(
  operation: () => T,
  errorType: ErrorType,
  fileName?: string,
  fallbackValue?: T
): { success: true; data: T } | { success: false; error: GalleryError } {
  try {
    const data = operation();
    return { success: true, data };
  } catch (error) {
    const galleryError = errorService.handleError(errorType, error, fileName);
    
    if (fallbackValue !== undefined) {
      return { success: true, data: fallbackValue };
    }
    
    return { success: false, error: galleryError };
  }
}
