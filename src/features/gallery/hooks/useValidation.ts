/**
 * useValidation Hook
 * Manages validation state and operations for file uploads
 */

import { useState, useCallback } from 'react';
import { validateImageFile, validateImageFiles, type ValidationResult } from '../services/validationService';

export function useValidation() {
  const [validationResults, setValidationResults] = useState<Map<string, ValidationResult>>(new Map());
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate a single file
   */
  const validateFile = useCallback(async (file: File): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      const result = await validateImageFile(file);
      
      setValidationResults(prev => {
        const updated = new Map(prev);
        updated.set(file.name, result);
        return updated;
      });
      
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Validate multiple files
   */
  const validateFiles = useCallback(async (files: File[]): Promise<Map<string, ValidationResult>> => {
    setIsValidating(true);
    
    try {
      const results = await validateImageFiles(files);
      setValidationResults(results);
      return results;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Clear validation result for a specific file
   */
  const clearValidation = useCallback((fileName: string) => {
    setValidationResults(prev => {
      const updated = new Map(prev);
      updated.delete(fileName);
      return updated;
    });
  }, []);

  /**
   * Clear all validation results
   */
  const clearAllValidations = useCallback(() => {
    setValidationResults(new Map());
  }, []);

  /**
   * Get validation result for a specific file
   */
  const getValidation = useCallback((fileName: string): ValidationResult | undefined => {
    return validationResults.get(fileName);
  }, [validationResults]);

  /**
   * Check if any files have errors
   */
  const hasErrors = useCallback((): boolean => {
    return Array.from(validationResults.values()).some(result => !result.isValid);
  }, [validationResults]);

  /**
   * Check if any files have warnings
   */
  const hasWarnings = useCallback((): boolean => {
    return Array.from(validationResults.values()).some(result => result.warnings.length > 0);
  }, [validationResults]);

  /**
   * Get count of files with errors
   */
  const errorCount = useCallback((): number => {
    return Array.from(validationResults.values()).filter(result => !result.isValid).length;
  }, [validationResults]);

  /**
   * Get count of files with warnings only (no errors)
   */
  const warningCount = useCallback((): number => {
    return Array.from(validationResults.values()).filter(
      result => result.isValid && result.warnings.length > 0
    ).length;
  }, [validationResults]);

  return {
    validationResults,
    isValidating,
    validateFile,
    validateFiles,
    clearValidation,
    clearAllValidations,
    getValidation,
    hasErrors,
    hasWarnings,
    errorCount,
    warningCount,
  };
}
