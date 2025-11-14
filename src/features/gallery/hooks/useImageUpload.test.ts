import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from './useImageUpload';
import type { ImagePreview } from '../types';

// Mock the useGalleryUpload hook
vi.mock('@/hooks/useGalleryUpload', () => ({
  useGalleryUpload: vi.fn(() => ({
    uploading: false,
    progress: [],
    uploadImages: vi.fn(async () => {
      return Promise.resolve({ successCount: 0, failCount: 0 });
    }),
    extractImageMetadata: vi.fn(),
    compressImage: vi.fn(),
  })),
}));

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct upload state', () => {
    const { result } = renderHook(() => useImageUpload());
    
    expect(result.current.uploading).toBe(false);
    expect(result.current.progress).toEqual([]);
  });

  it('should not upload if images array is empty', async () => {
    const { useGalleryUpload } = await import('@/hooks/useGalleryUpload');
    const mockUploadImages = vi.fn(async () => ({ successCount: 0, failCount: 0 }));
    
    vi.mocked(useGalleryUpload).mockReturnValue({
      uploading: false,
      progress: [],
      uploadImages: mockUploadImages,
      extractImageMetadata: vi.fn(),
      compressImage: vi.fn(),
    });

    const { result } = renderHook(() => useImageUpload());
    const mockOnSuccess = vi.fn();

    await act(async () => {
      await result.current.uploadAllImages([], 'medium', mockOnSuccess);
    });

    expect(mockUploadImages).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should upload images with compression quality', async () => {
    const { useGalleryUpload } = await import('@/hooks/useGalleryUpload');
    const mockUploadImages = vi.fn(async () => ({ successCount: 2, failCount: 0 }));
    
    vi.mocked(useGalleryUpload).mockReturnValue({
      uploading: false,
      progress: [],
      uploadImages: mockUploadImages,
      extractImageMetadata: vi.fn(),
      compressImage: vi.fn(),
    });

    const { result } = renderHook(() => useImageUpload());
    
    const mockImages: ImagePreview[] = [
      {
        file: new File([''], 'test1.jpg', { type: 'image/jpeg' }),
        preview: 'blob:test1',
        category: 'kitchens',
        displayName: 'test1',
        altText: 'test 1',
        description: '',
        width: 1920,
        height: 1080,
        compressionQuality: 'high',
      },
      {
        file: new File([''], 'test2.jpg', { type: 'image/jpeg' }),
        preview: 'blob:test2',
        category: 'vanities',
        displayName: 'test2',
        altText: 'test 2',
        description: '',
        width: 1920,
        height: 1080,
        compressionQuality: 'low',
      },
    ];

    const mockOnSuccess = vi.fn();

    await act(async () => {
      await result.current.uploadAllImages(mockImages, 'medium', mockOnSuccess);
    });

    expect(mockUploadImages).toHaveBeenCalledWith(
      mockImages.map(img => ({
        ...img,
        compressionQuality: 'medium',
      }))
    );
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should call onSuccess after successful upload', async () => {
    const { useGalleryUpload } = await import('@/hooks/useGalleryUpload');
    const mockUploadImages = vi.fn(async () => ({ successCount: 1, failCount: 0 }));
    
    vi.mocked(useGalleryUpload).mockReturnValue({
      uploading: false,
      progress: [],
      uploadImages: mockUploadImages,
      extractImageMetadata: vi.fn(),
      compressImage: vi.fn(),
    });

    const { result } = renderHook(() => useImageUpload());
    
    const mockImages: ImagePreview[] = [
      {
        file: new File([''], 'test.jpg', { type: 'image/jpeg' }),
        preview: 'blob:test',
        category: 'kitchens',
        displayName: 'test',
        altText: 'test',
        description: '',
        width: 1920,
        height: 1080,
        compressionQuality: 'medium',
      },
    ];

    const mockOnSuccess = vi.fn();

    await act(async () => {
      await result.current.uploadAllImages(mockImages, 'high', mockOnSuccess);
    });

    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should override individual compression qualities with global quality', async () => {
    const { useGalleryUpload } = await import('@/hooks/useGalleryUpload');
    const mockUploadImages = vi.fn(async () => ({ successCount: 2, failCount: 0 }));
    
    vi.mocked(useGalleryUpload).mockReturnValue({
      uploading: false,
      progress: [],
      uploadImages: mockUploadImages,
      extractImageMetadata: vi.fn(),
      compressImage: vi.fn(),
    });

    const { result } = renderHook(() => useImageUpload());
    
    const mockImages: ImagePreview[] = [
      {
        file: new File([''], 'test1.jpg', { type: 'image/jpeg' }),
        preview: 'blob:test1',
        category: 'kitchens',
        displayName: 'test1',
        altText: 'test 1',
        description: '',
        width: 1920,
        height: 1080,
        compressionQuality: 'low',
      },
      {
        file: new File([''], 'test2.jpg', { type: 'image/jpeg' }),
        preview: 'blob:test2',
        category: 'closets',
        displayName: 'test2',
        altText: 'test 2',
        description: '',
        width: 1920,
        height: 1080,
        compressionQuality: 'high',
      },
    ];

    const mockOnSuccess = vi.fn();

    await act(async () => {
      await result.current.uploadAllImages(mockImages, 'none', mockOnSuccess);
    });

    expect(mockUploadImages).toHaveBeenCalled();
    const calls = mockUploadImages.mock.calls as any[][];
    if (calls.length > 0) {
      const uploadedImages = calls[0]?.[0] as any[];
      if (uploadedImages && uploadedImages.length >= 2) {
        expect(uploadedImages[0]?.compressionQuality).toBe('none');
        expect(uploadedImages[1]?.compressionQuality).toBe('none');
      }
    }
  });
});
