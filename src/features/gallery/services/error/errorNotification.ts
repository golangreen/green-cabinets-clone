/**
 * Error Notification
 * Handles user-facing error notifications and feedback
 */

import { toast } from 'sonner';
import { createError, logError, type ErrorType, type GalleryError } from './errorLogger';

// ============================================================================
// Recovery Hints
// ============================================================================

const ERROR_RECOVERY_HINTS: Record<ErrorType, string> = {
  UPLOAD_FAILED: 'Please check your connection and try again',
  PROCESSING_FAILED: 'The image file may be corrupted',
  QUALITY_CHECK_FAILED: 'Image quality check was skipped',
  AI_GENERATION_FAILED: 'You can add metadata manually',
  NETWORK_ERROR: 'Please check your internet connection',
  STORAGE_ERROR: 'Please try again or contact support',
  VALIDATION_ERROR: 'Please check the image format',
  UNKNOWN_ERROR: 'Please try again or contact support',
  FILE_TOO_LARGE: 'Consider compressing the image before uploading',
  INVALID_FILE_TYPE: 'Supported formats: JPEG, PNG, WebP, GIF',
  COMPRESSION_FAILED: 'Try a different compression level',
  UNKNOWN: 'Please try again or contact support',
};

// ============================================================================
// Notification Functions
// ============================================================================

/**
 * Handle an error with user feedback
 */
export function handleError(
  type: ErrorType,
  originalError?: any,
  fileName?: string,
  showToast: boolean = true
): GalleryError {
  const error = createError(type, originalError, fileName);
  logError(error);

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
export function handleWarning(
  type: ErrorType,
  originalError?: any,
  fileName?: string
): GalleryError {
  const error = createError(type, originalError, fileName);
  logError(error);

  const hint = ERROR_RECOVERY_HINTS[type];
  const fileInfo = fileName ? ` (${fileName})` : '';

  toast.warning(`${error.message}${fileInfo}`, {
    description: hint,
    duration: 4000,
  });

  return error;
}

/**
 * Get recovery hint for error type
 */
export function getRecoveryHint(type: ErrorType): string {
  return ERROR_RECOVERY_HINTS[type] || ERROR_RECOVERY_HINTS.UNKNOWN;
}
