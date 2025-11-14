/**
 * Gallery File Selector Component
 * Handles file selection with automatic oversized file detection and compression
 */

import { useState } from 'react';
import { GalleryUploadZone } from './GalleryUploadZone';
import { CompressionDialog } from './CompressionDialog';
import { toast } from '@/hooks/use-toast';
import type { CompressionQuality } from '../types';
import type { OversizedFile } from '../services/compression';

interface GalleryFileSelectorProps {
  disabled?: boolean;
  oversizedFiles: OversizedFile[];
  onFilesSelected: (files: FileList) => Promise<void>;
  onCompress: (files: FileList, quality: CompressionQuality) => Promise<void>;
  onSkip: (files: FileList) => Promise<void>;
  onCheckForOversized: (files: File[]) => Promise<{
    needsCompression: boolean;
    oversized: OversizedFile[];
    acceptable: File[];
  }>;
}

export function GalleryFileSelector({
  disabled,
  oversizedFiles,
  onFilesSelected,
  onCompress,
  onSkip,
  onCheckForOversized,
}: GalleryFileSelectorProps) {
  const [showCompressionDialog, setShowCompressionDialog] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);

  const handleFilesSelected = async (files: FileList) => {
    const fileArray = Array.from(files);
    const result = await onCheckForOversized(fileArray);

    if (result.needsCompression) {
      setPendingFiles(files);
      setShowCompressionDialog(true);
      
      toast({
        title: "Oversized Files Detected",
        description: `${result.oversized.length} file(s) exceed the size limit. Please compress them to continue.`,
        variant: "default",
      });
    } else {
      await onFilesSelected(files);
    }
  };

  const handleCompress = async (quality: CompressionQuality) => {
    if (!pendingFiles) return;

    try {
      await onCompress(pendingFiles, quality);
      setPendingFiles(null);
      setShowCompressionDialog(false);
      
      toast({
        title: "Compression Complete",
        description: "Successfully compressed files. Processing images...",
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

  const handleSkip = async () => {
    if (!pendingFiles) return;

    try {
      await onSkip(pendingFiles);
      setPendingFiles(null);
      setShowCompressionDialog(false);
    } catch (error) {
      console.error('Skip failed:', error);
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
        disabled={disabled}
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
