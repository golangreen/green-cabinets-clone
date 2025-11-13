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

export function useImageManagement() {
  const [images, setImages] = useState<ImagePreview[]>([]);

  const processFiles = useCallback(async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    for (const file of imageFiles) {
      // Extract dimensions with error handling
      const dimensionsResult = await safeAsync(
        () => extractImageDimensions(file),
        ErrorType.PROCESSING_FAILED,
        file.name
      );

      if (!dimensionsResult.success) {
        continue; // Skip this file
      }

      const { width, height } = dimensionsResult.data;
      const preview = URL.createObjectURL(file);

      // Analyze quality with graceful degradation
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
