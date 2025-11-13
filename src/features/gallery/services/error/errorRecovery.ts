/**
 * Error Recovery
 * Utilities for error recovery and safe operations
 */

import { ErrorType, GalleryError } from './errorLogger';
import { handleError } from './errorNotification';

// ============================================================================
// Recovery Utilities
// ============================================================================

/**
 * Check if error is recoverable
 */
export function isRecoverable(type: ErrorType): boolean {
  return [
    'NETWORK_ERROR',
    'QUALITY_CHECK_FAILED',
    'AI_GENERATION_FAILED',
  ].includes(type);
}

// ============================================================================
// Safe Operation Wrappers
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
    const galleryError = handleError(errorType, error, fileName);
    
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
    const galleryError = handleError(errorType, error, fileName);
    
    if (fallbackValue !== undefined) {
      return { success: true, data: fallbackValue };
    }
    
    return { success: false, error: galleryError };
  }
}
