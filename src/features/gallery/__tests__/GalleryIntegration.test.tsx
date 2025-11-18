/**
 * Gallery Integration Tests
 * Tests complete workflows and component interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { GalleryProvider, useGalleryContext } from '../hooks';
import type { ImagePreview } from '../types';

// Mock dependencies
vi.mock('../services/imageProcessingService', () => ({
  extractImageDimensions: vi.fn(async () => ({ width: 1920, height: 1080 })),
  analyzeImageQuality: vi.fn(async () => ({
    isBlurry: false,
    blurScore: 5,
    isLowResolution: false,
    resolution: { width: 1920, height: 1080 },
    issues: ['none'],
    overallQuality: 'excellent',
  })),
}));

vi.mock('../services/validationService', () => ({
  validateImageFile: vi.fn(async () => ({
    isValid: true,
    errors: [],
    warnings: [],
  })),
}));

vi.mock('../services/compression', () => ({
  detectOversizedFiles: vi.fn(() => []),
  separateFilesBySize: vi.fn((files: File[]) => ({
    oversized: [],
    acceptable: files,
  })),
  analyzeOversizedFiles: vi.fn(async () => []),
  compressFilesWithResults: vi.fn(async (files: File[]) => {
    const compressed = files.map(f => new File([new Blob()], f.name, { type: f.type }));
    return {
      compressed,
      results: files.map((f, idx) => ({
        original: f,
        compressed: compressed[idx],
        originalSize: f.size,
        compressedSize: Math.floor(f.size * 0.5),
        reduction: 50,
      })),
    };
  }),
}));

const mockUploadImages = vi.fn(async () => ({ successCount: 1, failCount: 0 }));

vi.mock('@/hooks/useGalleryUpload', () => ({
  useGalleryUpload: vi.fn(() => ({
    uploading: false,
    progress: [],
    uploadImages: mockUploadImages,
    extractImageMetadata: vi.fn(),
    compressImage: vi.fn(),
  })),
}));

vi.mock('@/hooks/useToast', () => ({
  toast: vi.fn(),
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('Gallery Integration Tests', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GalleryProvider>{children}</GalleryProvider>
  );

  const createMockFile = (name: string): File => {
    const blob = new Blob(['mock image data'], { type: 'image/jpeg' });
    return new File([blob], name, { type: 'image/jpeg' });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('File Upload Workflow', () => {
    it('should process uploaded files through the complete workflow', async () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      const files = [
        createMockFile('image1.jpg'),
        createMockFile('image2.jpg'),
      ];

      const fileList = {
        length: files.length,
        item: (index: number) => files[index],
        [Symbol.iterator]: function* () {
          for (const file of files) {
            yield file;
          }
        },
      } as FileList;

      // Upload files
      await act(async () => {
        await result.current.processFiles(fileList);
      });

      // Files should be processed
      expect(result.current.images.length).toBeGreaterThan(0);
    });

    it('should upload images with selected compression quality', async () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      // Set compression quality
      act(() => {
        result.current.setCompressionQuality('high');
      });

      expect(result.current.compressionQuality).toBe('high');

      // Mock having images
      const mockImage: ImagePreview = {
        file: createMockFile('test.jpg'),
        preview: 'blob:test',
        category: 'kitchens',
        displayName: 'test',
        altText: 'test',
        description: '',
        width: 1920,
        height: 1080,
        compressionQuality: 'high',
      };

      // Trigger upload
      await act(async () => {
        await result.current.uploadAllImages(
          [mockImage],
          result.current.compressionQuality,
          result.current.clearImages
        );
      });

      expect(mockUploadImages).toHaveBeenCalled();
    });
  });

  describe('Image Selection and Batch Operations', () => {
    it('should select and deselect images', () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      // Select image
      act(() => {
        result.current.toggleSelection(0);
      });

      expect(result.current.isSelected(0)).toBe(true);
      expect(result.current.selectionCount).toBe(1);

      // Deselect image
      act(() => {
        result.current.toggleSelection(0);
      });

      expect(result.current.isSelected(0)).toBe(false);
      expect(result.current.selectionCount).toBe(0);
    });

    it('should select all images', () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      act(() => {
        result.current.selectAll(5);
      });

      expect(result.current.selectionCount).toBe(5);
      expect(result.current.hasMultipleSelection).toBe(true);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      act(() => {
        result.current.selectAll(3);
      });

      expect(result.current.selectionCount).toBe(3);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectionCount).toBe(0);
      expect(result.current.hasSelection).toBe(false);
    });

    it('should adjust selection after image removal', () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      // Select indices 0, 2, 4
      act(() => {
        result.current.toggleSelection(0);
        result.current.toggleSelection(2);
        result.current.toggleSelection(4);
      });

      expect(result.current.selectionCount).toBe(3);

      // Remove index 2
      act(() => {
        result.current.adjustSelectionAfterRemoval(2);
      });

      // Should have 2 selections, indices adjusted
      expect(result.current.selectionCount).toBe(2);
    });
  });

  describe('Modal Interactions', () => {
    it('should open and close edit modal', () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      act(() => {
        result.current.openEditModal(0);
      });

      expect(result.current.isEditModalOpen).toBe(true);
      expect(result.current.isAnyModalOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.isAnyModalOpen).toBe(false);
    });

    it('should handle edit save workflow', () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      const mockUpdate = vi.fn();
      result.current.updateImage = mockUpdate;

      // Open edit modal
      act(() => {
        result.current.openEditModal(1);
      });

      // Save changes
      act(() => {
        result.current.handleEditSave({
          displayName: 'Updated',
          category: 'vanities',
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith(1, {
        displayName: 'Updated',
        category: 'vanities',
      });
      expect(result.current.isEditModalOpen).toBe(false);
    });

    it('should handle batch edit workflow', () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      const mockUpdate = vi.fn();
      result.current.updateMultipleImages = mockUpdate;

      // Select images
      act(() => {
        result.current.toggleSelection(0);
        result.current.toggleSelection(1);
      });

      // Open batch edit modal
      act(() => {
        result.current.openBatchEditModal(2);
      });

      expect(result.current.isBatchEditModalOpen).toBe(true);

      // Save batch changes
      act(() => {
        result.current.handleBatchEditSave({
          category: 'closets',
          compressionQuality: 'high',
        });
      });

      expect(mockUpdate).toHaveBeenCalled();
      expect(result.current.isBatchEditModalOpen).toBe(false);
    });

    it('should handle metadata edit workflow', () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      const mockUpdate = vi.fn();
      result.current.updateMultipleImages = mockUpdate;

      // Select images
      act(() => {
        result.current.toggleSelection(0);
        result.current.toggleSelection(2);
      });

      // Open metadata modal
      act(() => {
        result.current.openMetadataModal([0, 2]);
      });

      expect(result.current.isMetadataModalOpen).toBe(true);

      // Save metadata
      act(() => {
        result.current.handleMetadataSave({
          altText: 'Bulk alt text',
          description: 'Bulk description',
        });
      });

      expect(mockUpdate).toHaveBeenCalled();
      expect(result.current.isMetadataModalOpen).toBe(false);
    });

    it('should prevent multiple modals from being open simultaneously', () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      // Open edit modal
      act(() => {
        result.current.openEditModal(0);
      });

      expect(result.current.isEditModalOpen).toBe(true);

      // Open batch edit modal (should replace)
      act(() => {
        result.current.openBatchEditModal(2);
      });

      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.isBatchEditModalOpen).toBe(true);
    });
  });

  describe('Compression Workflow', () => {
    it('should detect and handle oversized files', async () => {
      const { separateFilesBySize, analyzeOversizedFiles } = 
        await import('../services/compression');

      const oversizedFile = createMockFile('large.jpg');
      Object.defineProperty(oversizedFile, 'size', { value: 15 * 1024 * 1024 });

      vi.mocked(separateFilesBySize).mockReturnValue({
        oversized: [oversizedFile],
        acceptable: [],
      });

      vi.mocked(analyzeOversizedFiles).mockResolvedValue([{
        file: oversizedFile,
        currentSize: 15 * 1024 * 1024,
        estimatedSizes: {
          low: 5 * 1024 * 1024,
          medium: 7 * 1024 * 1024,
          high: 10 * 1024 * 1024,
          none: 15 * 1024 * 1024,
        },
      }]);

      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      let checkResult: any;
      await act(async () => {
        checkResult = await result.current.checkForOversizedFiles([oversizedFile]);
      });

      expect(checkResult.needsCompression).toBe(true);
      expect(result.current.oversizedFiles.length).toBe(1);
    });

    it('should compress oversized files', async () => {
      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      const file = createMockFile('test.jpg');
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 });

      // Manually set oversized files
      await act(async () => {
        const { separateFilesBySize, analyzeOversizedFiles } = 
          await import('../services/compression');
        
        vi.mocked(separateFilesBySize).mockReturnValue({
          oversized: [file],
          acceptable: [],
        });

        vi.mocked(analyzeOversizedFiles).mockResolvedValue([{
          file,
          currentSize: 15 * 1024 * 1024,
          estimatedSizes: {
            low: 5 * 1024 * 1024,
            medium: 7 * 1024 * 1024,
            high: 10 * 1024 * 1024,
            none: 15 * 1024 * 1024,
          },
        }]);

        await result.current.checkForOversizedFiles([file]);
      });

      expect(result.current.oversizedFiles.length).toBe(1);

      // Compress files
      await act(async () => {
        await result.current.compressOversizedFiles('medium');
      });

      // Files should be cleared after compression
      expect(result.current.oversizedFiles.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const { validateImageFile } = await import('../services/validationService');
      
      vi.mocked(validateImageFile).mockResolvedValue({
        isValid: false,
        errors: [{
          field: 'fileType',
          message: 'Invalid file type',
          details: { type: 'text/plain' },
        }],
        warnings: [],
      });

      const { result } = renderHook(() => useGalleryContext(), { wrapper });

      const invalidFile = createMockFile('test.txt');
      const fileList = {
        length: 1,
        item: () => invalidFile,
        [Symbol.iterator]: function* () {
          yield invalidFile;
        },
      } as FileList;

      await act(async () => {
        await result.current.processFiles(fileList);
      });

      // Invalid file should not be added
      expect(result.current.images.length).toBe(0);
    });
  });
});
