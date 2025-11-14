/**
 * useGalleryManager Hook
 * Facade hook that coordinates gallery actions using state from useGalleryState
 */

import { useCallback } from 'react';
import { useGalleryState } from './useGalleryState';
import type { CompressionQuality } from '../types';
import type { GalleryCategory } from '@/types/gallery';

export function useGalleryManager() {
  const state = useGalleryState();

  // Coordinated actions
  const handleRemoveImage = useCallback((index: number) => {
    state.removeImage(index);
    state.adjustSelectionAfterRemoval(index);
  }, [state]);

  const handleUpload = useCallback(async () => {
    await state.uploadAllImages(
      state.images,
      state.compressionQuality,
      state.clearImages
    );
  }, [state]);

  const handleEditSave = useCallback((updates: Partial<any>) => {
    if (state.modalState.data?.imageIndex !== undefined) {
      state.updateImage(state.modalState.data.imageIndex, updates);
      state.closeModal();
    }
  }, [state]);

  const handleBatchEditSave = useCallback((updates: { 
    category?: GalleryCategory; 
    compressionQuality?: CompressionQuality 
  }) => {
    state.updateMultipleImages(state.selectedIndices, updates);
    state.closeModal();
  }, [state]);

  const handleMetadataSave = useCallback((updates: { 
    altText?: string; 
    description?: string; 
    displayName?: string 
  }) => {
    state.updateMultipleImages(state.selectedIndices, updates);
    state.closeModal();
  }, [state]);

  return {
    // All state from useGalleryState
    ...state,
    
    // Coordinated actions
    handleRemoveImage,
    handleUpload,
    handleEditSave,
    handleBatchEditSave,
    handleMetadataSave,
  };
}
