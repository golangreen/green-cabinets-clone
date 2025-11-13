/**
 * Image Validation Service
 * Validates image files before processing using configuration constants
 */

import { z } from 'zod';
import {
  MAX_FILE_SIZE,
  SUPPORTED_IMAGE_TYPES,
  RESOLUTION_THRESHOLDS,
} from '../config/constants';
import { extractImageDimensions } from './imageProcessingService';

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: 'fileSize' | 'fileType' | 'dimensions' | 'file';
  message: string;
  details?: any;
}

export interface ValidationWarning {
  field: 'resolution' | 'aspectRatio' | 'fileSize';
  message: string;
  details?: any;
}

// ============================================================================
// File Validation Schema
// ============================================================================

const fileNameSchema = z
  .string()
  .trim()
  .min(1, 'File name cannot be empty')
  .max(255, 'File name must be less than 255 characters')
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9_\-. ]*[a-zA-Z0-9](\.[a-zA-Z0-9]+)?$/,
    'File name contains invalid characters'
  );

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate file size
 */
function validateFileSize(file: File): ValidationError | null {
  if (file.size === 0) {
    return {
      field: 'fileSize',
      message: 'File is empty',
      details: { size: 0 },
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    
    return {
      field: 'fileSize',
      message: `File size (${sizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
      details: { size: file.size, maxSize: MAX_FILE_SIZE },
    };
  }

  return null;
}

/**
 * Generate file size warning if approaching limit
 */
function generateFileSizeWarning(file: File): ValidationWarning | null {
  const warningThreshold = MAX_FILE_SIZE * 0.8; // Warn at 80% of max size
  
  if (file.size > warningThreshold && file.size <= MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    
    return {
      field: 'fileSize',
      message: `File size (${sizeMB}MB) is close to the limit (${maxSizeMB}MB). Consider compressing.`,
      details: { size: file.size, maxSize: MAX_FILE_SIZE },
    };
  }

  return null;
}

/**
 * Validate file type
 */
function validateFileType(file: File): ValidationError | null {
  if (!file.type) {
    return {
      field: 'fileType',
      message: 'File type cannot be determined',
      details: { type: file.type },
    };
  }

  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      field: 'fileType',
      message: `Unsupported file type: ${file.type}. Supported formats: JPEG, PNG, WebP, GIF`,
      details: { 
        type: file.type, 
        supported: SUPPORTED_IMAGE_TYPES 
      },
    };
  }

  return null;
}

/**
 * Validate file name
 */
function validateFileName(file: File): ValidationError | null {
  const result = fileNameSchema.safeParse(file.name);
  
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || 'Invalid file name';
    return {
      field: 'file',
      message: errorMessage,
      details: { fileName: file.name, errors: result.error.errors },
    };
  }

  return null;
}

/**
 * Validate image dimensions
 */
async function validateDimensions(file: File): Promise<{
  error: ValidationError | null;
  warning: ValidationWarning | null;
}> {
  try {
    const { width, height } = await extractImageDimensions(file);
    
    // Check minimum dimensions
    if (width < RESOLUTION_THRESHOLDS.MINIMUM_WIDTH || height < RESOLUTION_THRESHOLDS.MINIMUM_HEIGHT) {
      return {
        error: {
          field: 'dimensions',
          message: `Image dimensions (${width}x${height}px) are below minimum requirements (${RESOLUTION_THRESHOLDS.MINIMUM_WIDTH}x${RESOLUTION_THRESHOLDS.MINIMUM_HEIGHT}px)`,
          details: { 
            width, 
            height, 
            minWidth: RESOLUTION_THRESHOLDS.MINIMUM_WIDTH,
            minHeight: RESOLUTION_THRESHOLDS.MINIMUM_HEIGHT,
          },
        },
        warning: null,
      };
    }

    // Generate warning for low resolution
    const minDimension = Math.min(width, height);
    if (minDimension < RESOLUTION_THRESHOLDS.GOOD) {
      return {
        error: null,
        warning: {
          field: 'resolution',
          message: `Image resolution (${width}x${height}px) is lower than recommended for best quality`,
          details: { 
            width, 
            height, 
            recommended: RESOLUTION_THRESHOLDS.GOOD 
          },
        },
      };
    }

    // Check aspect ratio extremes
    const aspectRatio = width / height;
    if (aspectRatio > 3 || aspectRatio < 0.33) {
      return {
        error: null,
        warning: {
          field: 'aspectRatio',
          message: `Unusual aspect ratio (${aspectRatio.toFixed(2)}:1). Image may display incorrectly`,
          details: { width, height, aspectRatio },
        },
      };
    }

    return { error: null, warning: null };
  } catch (error) {
    return {
      error: {
        field: 'dimensions',
        message: 'Failed to extract image dimensions',
        details: { error },
      },
      warning: null,
    };
  }
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate an image file comprehensively
 * Checks file size, type, name, and dimensions
 */
export async function validateImageFile(file: File): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Validate file name
  const nameError = validateFileName(file);
  if (nameError) {
    errors.push(nameError);
  }

  // 2. Validate file size
  const sizeError = validateFileSize(file);
  if (sizeError) {
    errors.push(sizeError);
  } else {
    // Check for size warning
    const sizeWarning = generateFileSizeWarning(file);
    if (sizeWarning) {
      warnings.push(sizeWarning);
    }
  }

  // 3. Validate file type
  const typeError = validateFileType(file);
  if (typeError) {
    errors.push(typeError);
  }

  // 4. Validate dimensions (only if basic validation passed)
  if (errors.length === 0) {
    const { error: dimError, warning: dimWarning } = await validateDimensions(file);
    
    if (dimError) {
      errors.push(dimError);
    }
    
    if (dimWarning) {
      warnings.push(dimWarning);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate multiple files
 * Returns a map of file names to validation results
 */
export async function validateImageFiles(
  files: File[]
): Promise<Map<string, ValidationResult>> {
  const results = new Map<string, ValidationResult>();

  const validations = await Promise.all(
    files.map(async (file) => ({
      fileName: file.name,
      result: await validateImageFile(file),
    }))
  );

  validations.forEach(({ fileName, result }) => {
    results.set(fileName, result);
  });

  return results;
}

/**
 * Quick validation for file type and size only (no dimension check)
 * Useful for immediate feedback before full processing
 */
export function validateImageFileQuick(file: File): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate file name
  const nameError = validateFileName(file);
  if (nameError) errors.push(nameError);

  // Validate file size
  const sizeError = validateFileSize(file);
  if (sizeError) {
    errors.push(sizeError);
  } else {
    const sizeWarning = generateFileSizeWarning(file);
    if (sizeWarning) warnings.push(sizeWarning);
  }

  // Validate file type
  const typeError = validateFileType(file);
  if (typeError) errors.push(typeError);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
