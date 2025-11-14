import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { GalleryProvider, useGalleryContext } from './GalleryContext';
import { ReactNode } from 'react';

// Mock the useGalleryManager hook
vi.mock('../hooks/useGalleryManager', () => ({
  useGalleryManager: vi.fn(() => ({
    images: [],
    compressionQuality: 'medium',
    selectedIndices: new Set(),
    uploading: false,
    progress: {},
    processFiles: vi.fn(),
    clearImages: vi.fn(),
    removeImage: vi.fn(),
    updateImage: vi.fn(),
    updateMultipleImages: vi.fn(),
    toggleSelection: vi.fn(),
    selectAll: vi.fn(),
    clearSelection: vi.fn(),
    adjustSelectionAfterRemoval: vi.fn(),
    isSelected: vi.fn(),
    hasSelection: false,
    hasMultipleSelection: false,
    selectionCount: 0,
    uploadAllImages: vi.fn(),
    modalState: { type: 'none' },
    isEditModalOpen: false,
    isBatchEditModalOpen: false,
    isMetadataModalOpen: false,
    isAnyModalOpen: false,
    openEditModal: vi.fn(),
    openBatchEditModal: vi.fn(),
    openMetadataModal: vi.fn(),
    closeModal: vi.fn(),
    oversizedFiles: [],
    checkForOversizedFiles: vi.fn(),
    compressOversizedFiles: vi.fn(),
    clearOversizedFiles: vi.fn(),
    handleRemoveImage: vi.fn(),
    handleUpload: vi.fn(),
    handleEditSave: vi.fn(),
    handleBatchEditSave: vi.fn(),
    handleMetadataSave: vi.fn(),
    setCompressionQuality: vi.fn(),
  })),
}));

describe('GalleryContext', () => {
  it('should throw error when useGalleryContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useGalleryContext());
    }).toThrow('useGalleryContext must be used within a GalleryProvider');

    consoleSpy.mockRestore();
  });

  it('should provide gallery context when used within provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GalleryProvider>{children}</GalleryProvider>
    );

    const { result } = renderHook(() => useGalleryContext(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.images).toEqual([]);
    expect(result.current.compressionQuality).toBe('medium');
    expect(result.current.selectedIndices).toBeInstanceOf(Set);
  });

  it('should provide all gallery manager methods', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GalleryProvider>{children}</GalleryProvider>
    );

    const { result } = renderHook(() => useGalleryContext(), { wrapper });

    // State
    expect(result.current.images).toBeDefined();
    expect(result.current.compressionQuality).toBeDefined();
    expect(result.current.selectedIndices).toBeDefined();
    expect(result.current.uploading).toBeDefined();

    // Image management
    expect(typeof result.current.processFiles).toBe('function');
    expect(typeof result.current.clearImages).toBe('function');
    expect(typeof result.current.removeImage).toBe('function');
    expect(typeof result.current.updateImage).toBe('function');
    expect(typeof result.current.updateMultipleImages).toBe('function');

    // Selection
    expect(typeof result.current.toggleSelection).toBe('function');
    expect(typeof result.current.selectAll).toBe('function');
    expect(typeof result.current.clearSelection).toBe('function');
    expect(typeof result.current.isSelected).toBe('function');

    // Upload
    expect(typeof result.current.uploadAllImages).toBe('function');

    // Modals
    expect(typeof result.current.openEditModal).toBe('function');
    expect(typeof result.current.openBatchEditModal).toBe('function');
    expect(typeof result.current.openMetadataModal).toBe('function');
    expect(typeof result.current.closeModal).toBe('function');

    // Actions
    expect(typeof result.current.handleRemoveImage).toBe('function');
    expect(typeof result.current.handleUpload).toBe('function');
    expect(typeof result.current.handleEditSave).toBe('function');
    expect(typeof result.current.handleBatchEditSave).toBe('function');
    expect(typeof result.current.handleMetadataSave).toBe('function');
  });

  it('should provide compression state and methods', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GalleryProvider>{children}</GalleryProvider>
    );

    const { result } = renderHook(() => useGalleryContext(), { wrapper });

    expect(result.current.oversizedFiles).toBeDefined();
    expect(typeof result.current.checkForOversizedFiles).toBe('function');
    expect(typeof result.current.compressOversizedFiles).toBe('function');
    expect(typeof result.current.clearOversizedFiles).toBe('function');
  });

  it('should provide modal state flags', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GalleryProvider>{children}</GalleryProvider>
    );

    const { result } = renderHook(() => useGalleryContext(), { wrapper });

    expect(typeof result.current.isEditModalOpen).toBe('boolean');
    expect(typeof result.current.isBatchEditModalOpen).toBe('boolean');
    expect(typeof result.current.isMetadataModalOpen).toBe('boolean');
    expect(typeof result.current.isAnyModalOpen).toBe('boolean');
  });

  it('should provide selection state flags', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GalleryProvider>{children}</GalleryProvider>
    );

    const { result } = renderHook(() => useGalleryContext(), { wrapper });

    expect(typeof result.current.hasSelection).toBe('boolean');
    expect(typeof result.current.hasMultipleSelection).toBe('boolean');
    expect(typeof result.current.selectionCount).toBe('number');
  });
});
