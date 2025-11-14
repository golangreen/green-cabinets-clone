import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from './useImageUpload';
import type { ImagePreview } from '../types';

// Mock the services
vi.mock('../services/imageService', () => ({
  uploadImageWithMetadata: vi.fn(async () => ({ success: true })),
}));

vi.mock('../services/compression', () => ({
  compressImage: vi.fn(async (file: File) => file),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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
    const { uploadImageWithMetadata } = await import('../services/imageService');
    
    const { result } = renderHook(() => useImageUpload());
    const mockOnSuccess = vi.fn();

    await act(async () => {
      await result.current.uploadAllImages([], 'medium', mockOnSuccess);
    });

    expect(uploadImageWithMetadata).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should upload images with compression', async () => {
    const { uploadImageWithMetadata } = await import('../services/imageService');
    const { compressImage } = await import('../services/compression');
    
    vi.mocked(uploadImageWithMetadata).mockResolvedValue({ success: true });
    vi.mocked(compressImage).mockImplementation(async (file) => file);

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockImages: ImagePreview[] = [{
      file: mockFile,
      preview: 'blob:test',
      category: 'kitchens',
      displayName: 'Test Image',
      altText: 'Test',
      description: '',
      width: 1920,
      height: 1080,
      compressionQuality: 'medium',
    }];

    const { result } = renderHook(() => useImageUpload());
    const mockOnSuccess = vi.fn();

    await act(async () => {
      await result.current.uploadAllImages(mockImages, 'medium', mockOnSuccess);
    });

    expect(compressImage).toHaveBeenCalledWith(mockFile, 'medium');
    expect(uploadImageWithMetadata).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should skip compression when quality is none', async () => {
    const { uploadImageWithMetadata } = await import('../services/imageService');
    const { compressImage } = await import('../services/compression');
    
    vi.mocked(uploadImageWithMetadata).mockResolvedValue({ success: true });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockImages: ImagePreview[] = [{
      file: mockFile,
      preview: 'blob:test',
      category: 'kitchens',
      displayName: 'Test Image',
      altText: 'Test',
      description: '',
      width: 1920,
      height: 1080,
      compressionQuality: 'none',
    }];

    const { result } = renderHook(() => useImageUpload());
    const mockOnSuccess = vi.fn();

    await act(async () => {
      await result.current.uploadAllImages(mockImages, 'none', mockOnSuccess);
    });

    expect(compressImage).not.toHaveBeenCalled();
    expect(uploadImageWithMetadata).toHaveBeenCalled();
  });

  it('should handle upload errors gracefully', async () => {
    const { uploadImageWithMetadata } = await import('../services/imageService');
    const { toast } = await import('sonner');
    
    vi.mocked(uploadImageWithMetadata).mockResolvedValue({ 
      success: false, 
      error: 'Upload failed' 
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockImages: ImagePreview[] = [{
      file: mockFile,
      preview: 'blob:test',
      category: 'kitchens',
      displayName: 'Test Image',
      altText: 'Test',
      description: '',
      width: 1920,
      height: 1080,
      compressionQuality: 'medium',
    }];

    const { result } = renderHook(() => useImageUpload());
    const mockOnSuccess = vi.fn();

    await act(async () => {
      await result.current.uploadAllImages(mockImages, 'medium', mockOnSuccess);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to upload 1 image(s)');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should track upload progress', async () => {
    const { uploadImageWithMetadata } = await import('../services/imageService');
    
    vi.mocked(uploadImageWithMetadata).mockResolvedValue({ success: true });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockImages: ImagePreview[] = [{
      file: mockFile,
      preview: 'blob:test',
      category: 'kitchens',
      displayName: 'Test Image',
      altText: 'Test',
      description: '',
      width: 1920,
      height: 1080,
      compressionQuality: 'medium',
    }];

    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      await result.current.uploadAllImages(mockImages, 'medium', () => {});
    });

    // After upload, progress should show success
    expect(result.current.progress).toHaveLength(1);
    expect(result.current.progress[0].status).toBe('success');
    expect(result.current.uploading).toBe(false);
  });

  it('should call onSuccess only when all uploads succeed', async () => {
    const { uploadImageWithMetadata } = await import('../services/imageService');
    
    // First succeeds, second fails
    vi.mocked(uploadImageWithMetadata)
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: 'Error' });

    const mockFile1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
    const mockFile2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
    
    const mockImages: ImagePreview[] = [
      {
        file: mockFile1,
        preview: 'blob:test1',
        category: 'kitchens',
        displayName: 'Test 1',
        altText: 'Test 1',
        description: '',
        width: 1920,
        height: 1080,
        compressionQuality: 'medium',
      },
      {
        file: mockFile2,
        preview: 'blob:test2',
        category: 'kitchens',
        displayName: 'Test 2',
        altText: 'Test 2',
        description: '',
        width: 1920,
        height: 1080,
        compressionQuality: 'medium',
      },
    ];

    const { result } = renderHook(() => useImageUpload());
    const mockOnSuccess = vi.fn();

    await act(async () => {
      await result.current.uploadAllImages(mockImages, 'medium', mockOnSuccess);
    });

    // onSuccess should NOT be called because one upload failed
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
