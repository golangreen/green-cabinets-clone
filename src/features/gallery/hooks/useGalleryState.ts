/**
 * useGalleryState Hook
 * Manages all state for gallery operations
 */

import { useState } from 'react';
import { useImageManagement } from './useImageManagement';
import { useImageSelection } from './useImageSelection';
import { useImageUpload } from './useImageUpload';
import { useModalManager } from './useModalManager';
import { useAutoCompression } from './useAutoCompression';
import type { CompressionQuality } from '../types';

export function useGalleryState() {
  const [compressionQuality, setCompressionQuality] = useState<CompressionQuality>('medium');

  // Combine all state-related hooks
  const imageManagement = useImageManagement();
  const imageSelection = useImageSelection();
  const imageUpload = useImageUpload();
  const modalManager = useModalManager();
  const autoCompression = useAutoCompression();

  return {
    // Compression quality state
    compressionQuality,
    setCompressionQuality,
    
    // Image management state
    images: imageManagement.images,
    processFiles: imageManagement.processFiles,
    clearImages: imageManagement.clearImages,
    removeImage: imageManagement.removeImage,
    updateImage: imageManagement.updateImage,
    updateMultipleImages: imageManagement.updateMultipleImages,
    
    // Selection state
    selectedIndices: imageSelection.selectedIndices,
    toggleSelection: imageSelection.toggleSelection,
    selectAll: imageSelection.selectAll,
    clearSelection: imageSelection.clearSelection,
    adjustSelectionAfterRemoval: imageSelection.adjustSelectionAfterRemoval,
    isSelected: imageSelection.isSelected,
    hasSelection: imageSelection.hasSelection,
    hasMultipleSelection: imageSelection.hasMultipleSelection,
    selectionCount: imageSelection.selectionCount,
    
    // Upload state
    uploading: imageUpload.uploading,
    progress: imageUpload.progress,
    uploadAllImages: imageUpload.uploadAllImages,
    
    // Modal state
    modalState: modalManager.modalState,
    isEditModalOpen: modalManager.isEditModalOpen,
    isBatchEditModalOpen: modalManager.isBatchEditModalOpen,
    isMetadataModalOpen: modalManager.isMetadataModalOpen,
    isAnyModalOpen: modalManager.isAnyModalOpen,
    openEditModal: modalManager.openEditModal,
    openBatchEditModal: modalManager.openBatchEditModal,
    openMetadataModal: modalManager.openMetadataModal,
    closeModal: modalManager.closeModal,
    
    // Compression state
    oversizedFiles: autoCompression.oversizedFiles,
    checkForOversizedFiles: autoCompression.checkForOversizedFiles,
    compressOversizedFiles: autoCompression.compressOversizedFiles,
    clearOversizedFiles: autoCompression.clearOversizedFiles,
  };
}
