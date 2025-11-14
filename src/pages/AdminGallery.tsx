/**
 * Admin Gallery Page
 * Main page for managing gallery images with clean component architecture
 */

import { Database } from 'lucide-react';
import { AdminRoute } from '@/components/auth';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import {
  GalleryErrorBoundary,
  GalleryFileSelector,
  GalleryImageProcessor,
} from '@/features/gallery/components';
import { useGalleryManager } from '@/features/gallery/hooks';
import { toast } from '@/hooks/use-toast';
import type { CompressionQuality } from '@/hooks/useGalleryUpload';

export default function AdminGallery() {
  const manager = useGalleryManager();

  const handleFilesSelected = async (files: FileList) => {
    await manager.processFiles(files);
  };

  const handleCompress = async (files: FileList, quality: CompressionQuality) => {
    const compressed = await manager.compressOversizedFiles(quality);
    const fileArray = Array.from(files);
    const result = await manager.checkForOversizedFiles(fileArray);
    
    const allFiles = [...compressed, ...result.acceptable];
    const dataTransfer = new DataTransfer();
    allFiles.forEach(file => dataTransfer.items.add(file));
    
    await manager.processFiles(dataTransfer.files);
  };

  const handleSkip = async (files: FileList) => {
    const fileArray = Array.from(files);
    const result = await manager.checkForOversizedFiles(fileArray);
    
    if (result.acceptable.length > 0) {
      const dataTransfer = new DataTransfer();
      result.acceptable.forEach(file => dataTransfer.items.add(file));
      await manager.processFiles(dataTransfer.files);
      
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
    
    manager.clearOversizedFiles();
  };

  return (
    <AdminRoute>
      <GalleryErrorBoundary>
        <div className="min-h-screen bg-background">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Gallery Management</h1>
                <p className="text-muted-foreground">Upload and manage gallery images with automatic metadata extraction</p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/admin/storage-analyzer'}
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                Storage Analyzer
              </Button>
            </div>

            <div className="grid gap-6">
              <GalleryFileSelector
                disabled={manager.uploading}
                oversizedFiles={manager.oversizedFiles}
                onFilesSelected={handleFilesSelected}
                onCompress={handleCompress}
                onSkip={handleSkip}
                onCheckForOversized={manager.checkForOversizedFiles}
              />

              <GalleryImageProcessor
                images={manager.images}
                selectedIndices={manager.selectedIndices}
                uploading={manager.uploading}
                compressionQuality={manager.compressionQuality}
                onToggleSelect={manager.toggleSelection}
                onSelectAll={() => manager.selectAll(manager.images.length)}
                onClearSelection={manager.clearSelection}
                onEdit={manager.openEditModal}
                onRemove={manager.handleRemoveImage}
                onBatchEdit={() => manager.openBatchEditModal(manager.selectedIndices.size)}
                onMetadataEdit={() => manager.openMetadataModal(Array.from(manager.selectedIndices))}
                onCompressionChange={manager.setCompressionQuality}
                onUpload={manager.handleUpload}
              />
            </div>
          </main>

          <Footer />
        </div>
      </GalleryErrorBoundary>
    </AdminRoute>
  );
}
