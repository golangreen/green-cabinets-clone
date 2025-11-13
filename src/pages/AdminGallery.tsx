/**
 * Admin Gallery Page
 * Main page for managing gallery images - now using custom hooks
 */

import { useState } from 'react';
import { AdminRoute } from '@/components/auth';
import { Header, Footer } from '@/components/layout';
import type { CompressionQuality } from '@/hooks/useGalleryUpload';
import type { GalleryCategory } from '@/types/gallery';
import {
  GalleryUploadZone,
  ImagePreviewList,
  UploadControls,
  GalleryErrorBoundary,
  CompressionDialog,
} from '@/features/gallery/components';
import {
  useImageManagement,
  useImageSelection,
  useImageUpload,
  useModalManager,
  useAutoCompression,
} from '@/features/gallery/hooks';
import { toast } from '@/hooks/use-toast';

export default function AdminGallery() {
  const [compressionQuality, setCompressionQuality] = useState<CompressionQuality>('medium');
  const [showCompressionDialog, setShowCompressionDialog] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);

  // Custom hooks for state management
  const {
    images,
    processFiles,
    removeImage,
    updateImage,
    updateMultipleImages,
    clearImages,
  } = useImageManagement();

  const {
    selectedIndices,
    toggleSelection,
    selectAll,
    clearSelection,
    adjustSelectionAfterRemoval,
  } = useImageSelection();

  const { uploading, uploadAllImages } = useImageUpload();

  const {
    modalState,
    openEditModal,
    openBatchEditModal,
    openMetadataModal,
    closeModal,
    isEditModalOpen,
    isBatchEditModalOpen,
    isMetadataModalOpen,
  } = useModalManager();

  const {
    oversizedFiles,
    checkForOversizedFiles,
    compressOversizedFiles,
    clearOversizedFiles,
  } = useAutoCompression();

  const handleFilesSelected = async (files: FileList) => {
    // Step 1: Check for oversized files
    const fileArray = Array.from(files);
    const result = await checkForOversizedFiles(fileArray);

    if (result.needsCompression) {
      // Show compression dialog for oversized files
      setPendingFiles(files);
      setShowCompressionDialog(true);
      
      toast({
        title: "Oversized Files Detected",
        description: `${result.oversized.length} file(s) exceed the size limit. Please compress them to continue.`,
        variant: "default",
      });
    } else {
      // No oversized files, process directly
      await processFiles(files);
    }
  };

  const handleCompress = async (quality: CompressionQuality) => {
    if (!pendingFiles) return;

    try {
      // Compress oversized files
      const compressed = await compressOversizedFiles(quality);
      
      // Get acceptable files from pending files
      const fileArray = Array.from(pendingFiles);
      const result = await checkForOversizedFiles(fileArray);
      
      // Create new FileList with compressed + acceptable files
      const allFiles = [...compressed, ...result.acceptable];
      
      // Convert back to FileList format for processFiles
      const dataTransfer = new DataTransfer();
      allFiles.forEach(file => dataTransfer.items.add(file));
      
      // Process all files (compressed + acceptable)
      await processFiles(dataTransfer.files);
      
      // Clean up
      setPendingFiles(null);
      setShowCompressionDialog(false);
      
      toast({
        title: "Compression Complete",
        description: `Successfully compressed ${compressed.length} file(s). Processing all images...`,
      });
    } catch (error) {
      console.error('Compression failed:', error);
      toast({
        title: "Compression Failed",
        description: "Failed to compress files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkipOversized = async () => {
    if (!pendingFiles) return;

    // Process only acceptable files
    const fileArray = Array.from(pendingFiles);
    const result = await checkForOversizedFiles(fileArray);
    
    if (result.acceptable.length > 0) {
      const dataTransfer = new DataTransfer();
      result.acceptable.forEach(file => dataTransfer.items.add(file));
      await processFiles(dataTransfer.files);
      
      toast({
        title: "Oversized Files Skipped",
        description: `Processing ${result.acceptable.length} acceptable file(s).`,
      });
    } else {
      toast({
        title: "No Files to Process",
        description: "All selected files exceeded the size limit.",
        variant: "default",
      });
    }

    // Clean up
    clearOversizedFiles();
    setPendingFiles(null);
    setShowCompressionDialog(false);
  };

  const handleRemoveImage = (index: number) => {
    removeImage(index);
    adjustSelectionAfterRemoval(index);
  };

  const handleEditSave = (updates: Partial<any>) => {
    if (modalState.data?.imageIndex !== undefined) {
      updateImage(modalState.data.imageIndex, updates);
      closeModal();
    }
  };

  const handleBatchEditSave = (updates: { category?: GalleryCategory; compressionQuality?: CompressionQuality }) => {
    updateMultipleImages(selectedIndices, updates);
    closeModal();
  };

  const handleMetadataSave = (updates: { altText?: string; description?: string; displayName?: string }) => {
    updateMultipleImages(selectedIndices, updates);
    closeModal();
  };

  const handleUpload = async () => {
    await uploadAllImages(images, compressionQuality, clearImages);
  };

  return (
    <AdminRoute>
      <GalleryErrorBoundary>
        <div className="min-h-screen bg-background">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Gallery Management</h1>
              <p className="text-muted-foreground">Upload and manage gallery images with automatic metadata extraction</p>
            </div>

            <div className="grid gap-6">
              <GalleryUploadZone
                onFilesSelected={handleFilesSelected}
                disabled={uploading}
              />

              {images.length > 0 && (
                <>
                  <ImagePreviewList
                    images={images}
                    selectedIndices={selectedIndices}
                    uploadProgress={{}}
                    onToggleSelect={toggleSelection}
                    onSelectAll={() => selectAll(images.length)}
                    onClearSelection={clearSelection}
                    onEdit={openEditModal}
                    onRemove={handleRemoveImage}
                    onBatchEdit={() => openBatchEditModal(selectedIndices.size)}
                    onMetadataEdit={() => openMetadataModal(Array.from(selectedIndices))}
                  />

                  <UploadControls
                    imageCount={images.length}
                    compressionQuality={compressionQuality}
                    uploading={uploading}
                    onCompressionChange={setCompressionQuality}
                    onUpload={handleUpload}
                  />
                </>
              )}
            </div>
          </main>

          <Footer />

          {/* Compression Dialog */}
          <CompressionDialog
            open={showCompressionDialog}
            onOpenChange={setShowCompressionDialog}
            oversizedFiles={oversizedFiles}
            onCompress={handleCompress}
            onSkip={handleSkipOversized}
          />

          {/* Modals - Managed by useModalManager hook */}
          {/* TODO: Integrate modal components with new type system
          {isEditModalOpen && modalState.data?.imageIndex !== undefined && (
            <ImageEditor
              image={images[modalState.data.imageIndex]}
              onSave={handleEditSave}
              onClose={closeModal}
            />
          )}

          {isBatchEditModalOpen && (
            <BatchImageEditor
              selectedCount={modalState.data?.selectedCount || 0}
              onSave={handleBatchEditSave}
              onClose={closeModal}
            />
          )}

          {isMetadataModalOpen && modalState.data?.selectedIndices && (
            <BulkMetadataEditor
              images={modalState.data.selectedIndices.map((i: number) => images[i])}
              onSave={handleMetadataSave}
              onClose={closeModal}
            />
          )}
          */}
        </div>
      </GalleryErrorBoundary>
    </AdminRoute>
  );
}
