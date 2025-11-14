import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModalManager } from './useModalManager';

describe('useModalManager', () => {
  it('should initialize with no modal open', () => {
    const { result } = renderHook(() => useModalManager());
    
    expect(result.current.modalState.type).toBe('none');
    expect(result.current.isEditModalOpen).toBe(false);
    expect(result.current.isBatchEditModalOpen).toBe(false);
    expect(result.current.isMetadataModalOpen).toBe(false);
    expect(result.current.isAnyModalOpen).toBe(false);
  });

  it('should open edit modal with image index', () => {
    const { result } = renderHook(() => useModalManager());
    
    act(() => {
      result.current.openEditModal(5);
    });
    
    expect(result.current.modalState.type).toBe('edit');
    expect(result.current.modalState.data?.imageIndex).toBe(5);
    expect(result.current.isEditModalOpen).toBe(true);
    expect(result.current.isAnyModalOpen).toBe(true);
  });

  it('should open batch edit modal with selected count', () => {
    const { result } = renderHook(() => useModalManager());
    
    act(() => {
      result.current.openBatchEditModal(3);
    });
    
    expect(result.current.modalState.type).toBe('batchEdit');
    expect(result.current.modalState.data?.selectedCount).toBe(3);
    expect(result.current.isBatchEditModalOpen).toBe(true);
    expect(result.current.isAnyModalOpen).toBe(true);
  });

  it('should open metadata modal with selected indices', () => {
    const { result } = renderHook(() => useModalManager());
    
    const selectedIndices = [0, 2, 4];
    
    act(() => {
      result.current.openMetadataModal(selectedIndices);
    });
    
    expect(result.current.modalState.type).toBe('metadata');
    expect(result.current.modalState.data?.selectedIndices).toEqual(selectedIndices);
    expect(result.current.isMetadataModalOpen).toBe(true);
    expect(result.current.isAnyModalOpen).toBe(true);
  });

  it('should close any open modal', () => {
    const { result } = renderHook(() => useModalManager());
    
    // Open edit modal
    act(() => {
      result.current.openEditModal(0);
    });
    
    expect(result.current.isEditModalOpen).toBe(true);
    
    // Close modal
    act(() => {
      result.current.closeModal();
    });
    
    expect(result.current.modalState.type).toBe('none');
    expect(result.current.isEditModalOpen).toBe(false);
    expect(result.current.isAnyModalOpen).toBe(false);
  });

  it('should switch between different modal types', () => {
    const { result } = renderHook(() => useModalManager());
    
    // Open edit modal
    act(() => {
      result.current.openEditModal(1);
    });
    
    expect(result.current.isEditModalOpen).toBe(true);
    expect(result.current.isBatchEditModalOpen).toBe(false);
    
    // Switch to batch edit modal
    act(() => {
      result.current.openBatchEditModal(5);
    });
    
    expect(result.current.isEditModalOpen).toBe(false);
    expect(result.current.isBatchEditModalOpen).toBe(true);
    
    // Switch to metadata modal
    act(() => {
      result.current.openMetadataModal([0, 1, 2]);
    });
    
    expect(result.current.isBatchEditModalOpen).toBe(false);
    expect(result.current.isMetadataModalOpen).toBe(true);
  });

  it('should preserve modal data when switching modals', () => {
    const { result } = renderHook(() => useModalManager());
    
    act(() => {
      result.current.openEditModal(10);
    });
    
    expect(result.current.modalState.data?.imageIndex).toBe(10);
    
    act(() => {
      result.current.openBatchEditModal(7);
    });
    
    expect(result.current.modalState.data?.selectedCount).toBe(7);
    expect(result.current.modalState.data?.imageIndex).toBeUndefined();
  });

  it('should clear modal data when closing', () => {
    const { result } = renderHook(() => useModalManager());
    
    act(() => {
      result.current.openMetadataModal([1, 2, 3]);
    });
    
    expect(result.current.modalState.data).toBeDefined();
    
    act(() => {
      result.current.closeModal();
    });
    
    expect(result.current.modalState.type).toBe('none');
    expect(result.current.modalState.data).toBeUndefined();
  });
});
