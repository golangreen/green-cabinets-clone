/**
 * Gallery File Selector Component
 * Handles file selection with automatic oversized file detection and compression
 */

import { useState } from 'react';
import { GalleryUploadZone } from './GalleryUploadZone';
import { CompressionDialog } from './CompressionDialog';
import { useGalleryContext } from '../hooks';
import { toast } from '@/hooks/use-toast';
import type { CompressionQuality } from '../types';
import { logger } from '@/lib/logger';

export function GalleryFileSelector() {
  const {
    uploading,
    oversizedFiles,
    processFiles,
    checkForOversizedFiles,
    compressOversizedFiles,
    clearOversizedFiles,
  } = useGalleryContext();
  const [showCompressionDialog, setShowCompressionDialog] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);

  const handleFilesSelected = async (files: FileList) => {
    const fileArray = Array.from(files);
    const result = await checkForOversizedFiles(fileArray);

    if (result.needsCompression) {
      setPendingFiles(files);
      setShowCompressionDialog(true);
      
      toast({
        title: "Oversized Files Detected",
        description: `${result.oversized.length} file(s) exceed the size limit. Please compress them to continue.`,
        variant: "default",
      });
    } else {
      await processFiles(files);
    }
  };

  const handleCompress = async (quality: CompressionQuality) => {
    if (!pendingFiles) return;

    try {
      const compressed = await compressOversizedFiles(quality);
      const fileArray = Array.from(pendingFiles);
      const result = await checkForOversizedFiles(fileArray);
      
      const allFiles = [...compressed, ...result.acceptable];
      const dataTransfer = new DataTransfer();
      allFiles.forEach(file => dataTransfer.items.add(file));
      
      await processFiles(dataTransfer.files);
      setPendingFiles(null);
      setShowCompressionDialog(false);
      
      toast({
        title: "Compression Complete",
        description: "Successfully compressed files. Processing images...",
      });
    } catch (error) {
      logger.error('Compression failed', error, { component: 'GalleryFileSelector' });
      toast({
        title: "Compression Failed",
        description: "Failed to compress files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = async () => {
    if (!pendingFiles) return;

    try {
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
      
      clearOversizedFiles();
      setPendingFiles(null);
      setShowCompressionDialog(false);
    } catch (error) {
      logger.error('Skip failed', error, { component: 'GalleryFileSelector' });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPendingFiles(null);
    }
    setShowCompressionDialog(open);
  };

  return (
    <>
      <GalleryUploadZone
        onFilesSelected={handleFilesSelected}
        disabled={uploading}
      />

      <CompressionDialog
        open={showCompressionDialog}
        onOpenChange={handleOpenChange}
        oversizedFiles={oversizedFiles}
        onCompress={handleCompress}
        onSkip={handleSkip}
      />
    </>
  );
}
