/**
 * useImageManagement Hook
 * Manages image state and operations
 */

import { useState, useCallback } from 'react';
import type { ImagePreview } from '../types';
import {
  extractImageDimensions,
  analyzeImageQuality,
} from '../services/imageProcessingService';
import { errorService, ErrorType, safeAsync } from '../services/errorService';
import { validateImageFile } from '../services/validationService';
import { toast } from '@/hooks/use-toast';

export function useImageManagement() {
  const [images, setImages] = useState<ImagePreview[]>([]);

  const processFiles = useCallback(async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    let validCount = 0;
    let invalidCount = 0;

    for (const file of imageFiles) {
      // Step 1: Validate file before processing
      const validationResult = await validateImageFile(file);

      if (!validationResult.isValid) {
        invalidCount++;
        
        // Show all validation errors
        validationResult.errors.forEach(error => {
          errorService.handleError(
            ErrorType.VALIDATION_ERROR,
            error,
            file.name
          );
        });
        
        continue; // Skip invalid file
      }

      // Show validation warnings if any
      if (validationResult.warnings.length > 0) {
        validationResult.warnings.forEach(warning => {
          toast({
            title: file.name,
            description: warning.message,
            variant: "default",
          });
        });
      }

      // Step 2: Extract dimensions with error handling
      const dimensionsResult = await safeAsync(
        () => extractImageDimensions(file),
        ErrorType.PROCESSING_FAILED,
        file.name
      );

      if (!dimensionsResult.success) {
        invalidCount++;
        continue; // Skip this file
      }

      const { width, height } = dimensionsResult.data;
      const preview = URL.createObjectURL(file);

      // Step 3: Analyze quality with graceful degradation
      const qualityResult = await safeAsync(
        () => analyzeImageQuality(file),
        ErrorType.QUALITY_CHECK_FAILED,
        file.name,
        undefined // No fallback - quality is optional
      );

      const quality = qualityResult.success ? qualityResult.data : undefined;

      // Show warnings if quality issues detected
      if (quality?.issues.some(issue => issue !== 'none')) {
        errorService.handleWarning(
          ErrorType.QUALITY_CHECK_FAILED,
          { issues: quality.issues },
          file.name
        );
      }

      validCount++;
      setImages(prev => [
        ...prev,
        {
          file,
          preview,
          category: 'kitchens',
          displayName: file.name.replace(/\.[^/.]+$/, ''),
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          description: '',
          width,
          height,
          compressionQuality: 'medium',
          quality,
        },
      ]);
    }

    // Show summary if there were any issues
    if (invalidCount > 0) {
      toast({
        title: "Validation Failed",
        description: `${invalidCount} of ${imageFiles.length} file(s) failed validation. Check the errors above for details.`,
        variant: "destructive",
      });
    } else if (validCount > 0) {
      toast({
        title: "Success",
        description: `Successfully validated ${validCount} image(s)`,
      });
    }
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const updateImage = useCallback((index: number, updates: Partial<ImagePreview>) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    ));
  }, []);

  const updateMultipleImages = useCallback((indices: Set<number>, updates: Partial<ImagePreview>) => {
    setImages(prev => prev.map((img, i) => 
      indices.has(i) ? { ...img, ...updates } : img
    ));
  }, []);

  const clearImages = useCallback(() => {
    setImages(prev => {
      prev.forEach(img => URL.revokeObjectURL(img.preview));
      return [];
    });
  }, []);

  return {
    images,
    processFiles,
    removeImage,
    updateImage,
    updateMultipleImages,
    clearImages,
  };
}
