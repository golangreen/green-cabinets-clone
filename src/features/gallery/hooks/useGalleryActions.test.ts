import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGalleryActions } from './useGalleryActions';
import type { ImagePreview } from '../types';

describe('useGalleryActions', () => {
  const createMockState = () => ({
    images: [] as ImagePreview[],
    compressionQuality: 'medium' as const,
    selectedIndices: new Set<number>(),
    modalState: { type: 'none' as const, data: undefined },
    removeImage: vi.fn(),
    adjustSelectionAfterRemoval: vi.fn(),
    uploadAllImages: vi.fn(async () => {}),
    clearImages: vi.fn(),
    updateImage: vi.fn(),
    updateMultipleImages: vi.fn(),
    closeModal: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle remove image action', () => {
    const mockState = createMockState();
    const { result } = renderHook(() => useGalleryActions(mockState));

    act(() => {
      result.current.handleRemoveImage(3);
    });

    expect(mockState.removeImage).toHaveBeenCalledWith(3);
    expect(mockState.adjustSelectionAfterRemoval).toHaveBeenCalledWith(3);
  });

  it('should handle upload action', async () => {
    const mockState = createMockState();
    mockState.images = [
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

    const { result } = renderHook(() => useGalleryActions(mockState));

    await act(async () => {
      await result.current.handleUpload();
    });

    expect(mockState.uploadAllImages).toHaveBeenCalledWith(
      mockState.images,
      mockState.compressionQuality,
      mockState.clearImages
    );
  });

  it('should handle edit save action', () => {
    const mockState = createMockState();
    mockState.modalState = {
      type: 'edit' as any,
      data: { imageIndex: 2 },
    };

    const { result } = renderHook(() => useGalleryActions(mockState));

    const updates = {
      displayName: 'Updated Name',
      altText: 'Updated Alt',
    };

    act(() => {
      result.current.handleEditSave(updates);
    });

    expect(mockState.updateImage).toHaveBeenCalledWith(2, updates);
    expect(mockState.closeModal).toHaveBeenCalled();
  });

  it('should not update if imageIndex is undefined in edit save', () => {
    const mockState = createMockState();
    mockState.modalState = {
      type: 'edit' as any,
      data: {},
    };

    const { result } = renderHook(() => useGalleryActions(mockState));

    act(() => {
      result.current.handleEditSave({ displayName: 'Test' });
    });

    expect(mockState.updateImage).not.toHaveBeenCalled();
    expect(mockState.closeModal).not.toHaveBeenCalled();
  });

  it('should handle batch edit save action', () => {
    const mockState = createMockState();
    mockState.selectedIndices = new Set([0, 2, 4]);

    const { result } = renderHook(() => useGalleryActions(mockState));

    const updates = {
      category: 'vanities' as const,
      compressionQuality: 'high' as const,
    };

    act(() => {
      result.current.handleBatchEditSave(updates);
    });

    expect(mockState.updateMultipleImages).toHaveBeenCalledWith(
      mockState.selectedIndices,
      updates
    );
    expect(mockState.closeModal).toHaveBeenCalled();
  });

  it('should handle metadata save action', () => {
    const mockState = createMockState();
    mockState.selectedIndices = new Set([1, 3]);

    const { result } = renderHook(() => useGalleryActions(mockState));

    const updates = {
      altText: 'Batch Alt Text',
      description: 'Batch Description',
      displayName: 'Batch Display Name',
    };

    act(() => {
      result.current.handleMetadataSave(updates);
    });

    expect(mockState.updateMultipleImages).toHaveBeenCalledWith(
      mockState.selectedIndices,
      updates
    );
    expect(mockState.closeModal).toHaveBeenCalled();
  });

  it('should handle partial metadata updates', () => {
    const mockState = createMockState();
    mockState.selectedIndices = new Set([0, 1, 2]);

    const { result } = renderHook(() => useGalleryActions(mockState));

    const updates = {
      altText: 'Only Alt Text',
    };

    act(() => {
      result.current.handleMetadataSave(updates);
    });

    expect(mockState.updateMultipleImages).toHaveBeenCalledWith(
      mockState.selectedIndices,
      updates
    );
  });

  it('should handle empty batch edit updates', () => {
    const mockState = createMockState();
    mockState.selectedIndices = new Set([0]);

    const { result } = renderHook(() => useGalleryActions(mockState));

    act(() => {
      result.current.handleBatchEditSave({});
    });

    expect(mockState.updateMultipleImages).toHaveBeenCalledWith(
      mockState.selectedIndices,
      {}
    );
    expect(mockState.closeModal).toHaveBeenCalled();
  });
});
