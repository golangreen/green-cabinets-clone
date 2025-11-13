/**
 * Admin Gallery Page
 * Main page for managing gallery images - refactored with modular components
 */

import { useState } from 'react';
import { AdminRoute } from '@/components/auth';
import { Header, Footer } from '@/components/layout';
import { useGalleryUpload, type CompressionQuality } from '@/hooks/useGalleryUpload';
import { toast } from 'sonner';
import type { GalleryCategory } from '@/types/gallery';
import {
  GalleryUploadZone,
  ImagePreviewList,
  UploadControls,
} from '@/features/gallery/components';
import {
  extractImageDimensions,
  analyzeImageQuality,
} from '@/features/gallery/services/imageProcessingService';
import type { ImagePreview } from '@/features/gallery/types';

export default function AdminGallery() {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [batchEditing, setBatchEditing] = useState(false);
  const [metadataEditing, setMetadataEditing] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState<CompressionQuality>('medium');
  const { uploading, progress, uploadImages } = useGalleryUpload();

  const processFiles = async (files: FileList) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    for (const file of imageFiles) {
      try {
        const { width, height } = await extractImageDimensions(file);
        const preview = URL.createObjectURL(file);
        
        // Analyze image quality
        const quality = await analyzeImageQuality(file);
        
        // Show warnings if quality issues detected
        if (quality.issues.some(issue => issue !== 'none')) {
          toast.warning(`Quality issues detected in ${file.name}`, {
            description: `Image has ${quality.issues.filter(i => i !== 'none').join(', ')}`
          });
        }
        
        setImages(prev => [...prev, {
          file,
          preview,
          category: 'kitchens',
          displayName: file.name.replace(/\.[^/.]+$/, ''),
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          description: '',
          width,
          height,
          compressionQuality: 'medium',
          quality
        }]);
      } catch (error) {
        console.error('Error processing file:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
    
    // Update selection
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Adjust indices after removed item
      const adjustedSet = new Set<number>();
      newSet.forEach(idx => {
        if (idx > index) {
          adjustedSet.add(idx - 1);
        } else {
          adjustedSet.add(idx);
        }
      });
      return adjustedSet;
    });
  };

  const updateImage = (index: number, updates: Partial<ImagePreview>) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    ));
  };

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIndices(new Set(images.map((_, i) => i)));
  };

  const clearSelection = () => {
    setSelectedIndices(new Set());
  };

  const handleEditSave = (updates: Partial<ImagePreview>) => {
    if (editingIndex !== null) {
      updateImage(editingIndex, updates);
      setEditingIndex(null);
    }
  };

  const handleBatchEditSave = (updates: { category?: GalleryCategory; compressionQuality?: CompressionQuality }) => {
    setImages(prev => prev.map((img, i) => 
      selectedIndices.has(i) ? { ...img, ...updates } : img
    ));
    setBatchEditing(false);
  };

  const handleMetadataSave = (updates: { altText?: string; description?: string; displayName?: string }) => {
    setImages(prev => prev.map((img, i) => 
      selectedIndices.has(i) ? { ...img, ...updates } : img
    ));
    setMetadataEditing(false);
  };

  const handleUpload = async () => {
    if (images.length === 0) return;

    const imagesWithCompression = images.map(img => ({
      ...img,
      compressionQuality
    }));

    await uploadImages(imagesWithCompression);
    
    // Clear successfully uploaded images
    setImages(prev => {
      prev.forEach(img => URL.revokeObjectURL(img.preview));
      return [];
    });
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Gallery Management</h1>
            <p className="text-muted-foreground">Upload and manage gallery images with automatic metadata extraction</p>
          </div>

          <div className="grid gap-6">
            {/* Upload Area */}
            <GalleryUploadZone
              onFilesSelected={processFiles}
              disabled={uploading}
            />

            {/* Image Preview List */}
            {images.length > 0 && (
              <ImagePreviewList
                images={images}
                selectedIndices={selectedIndices}
                uploadProgress={{}}
                onToggleSelect={toggleSelection}
                onSelectAll={selectAll}
                onClearSelection={clearSelection}
                onEdit={setEditingIndex}
                onRemove={removeImage}
                onBatchEdit={() => setBatchEditing(true)}
                onMetadataEdit={() => setMetadataEditing(true)}
              />
            )}

            {/* Upload Controls */}
            {images.length > 0 && (
              <UploadControls
                imageCount={images.length}
                compressionQuality={compressionQuality}
                uploading={uploading}
                onCompressionChange={setCompressionQuality}
                onUpload={handleUpload}
              />
            )}
          </div>
        </main>

        <Footer />

        {/* Modals - TODO: Update modal components to match new types */}
        {/* 
        {editingIndex !== null && (
          <ImageEditor
            image={images[editingIndex]}
            onSave={handleEditSave}
            onClose={() => setEditingIndex(null)}
          />
        )}

        {batchEditing && (
          <BatchImageEditor
            selectedCount={selectedIndices.size}
            onSave={handleBatchEditSave}
            onClose={() => setBatchEditing(false)}
          />
        )}

        {metadataEditing && (
          <BulkMetadataEditor
            images={Array.from(selectedIndices).map(i => images[i])}
            onSave={handleMetadataSave}
            onClose={() => setMetadataEditing(false)}
          />
        )}
        */}
      </div>
    </AdminRoute>
  );
}
