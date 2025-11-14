import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageSelection } from './useImageSelection';

describe('useImageSelection', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useImageSelection());
    
    expect(result.current.selectedIndices.size).toBe(0);
    expect(result.current.hasSelection).toBe(false);
    expect(result.current.hasMultipleSelection).toBe(false);
    expect(result.current.selectionCount).toBe(0);
  });

  it('should toggle selection on and off', () => {
    const { result } = renderHook(() => useImageSelection());
    
    // Select index 0
    act(() => {
      result.current.toggleSelection(0);
    });
    
    expect(result.current.isSelected(0)).toBe(true);
    expect(result.current.selectionCount).toBe(1);
    
    // Deselect index 0
    act(() => {
      result.current.toggleSelection(0);
    });
    
    expect(result.current.isSelected(0)).toBe(false);
    expect(result.current.selectionCount).toBe(0);
  });

  it('should select multiple indices', () => {
    const { result } = renderHook(() => useImageSelection());
    
    act(() => {
      result.current.toggleSelection(0);
      result.current.toggleSelection(2);
      result.current.toggleSelection(5);
    });
    
    expect(result.current.selectedIndices.size).toBe(3);
    expect(result.current.isSelected(0)).toBe(true);
    expect(result.current.isSelected(2)).toBe(true);
    expect(result.current.isSelected(5)).toBe(true);
    expect(result.current.hasMultipleSelection).toBe(true);
  });

  it('should select all items', () => {
    const { result } = renderHook(() => useImageSelection());
    
    act(() => {
      result.current.selectAll(10);
    });
    
    expect(result.current.selectedIndices.size).toBe(10);
    expect(result.current.selectionCount).toBe(10);
    expect(result.current.hasSelection).toBe(true);
    
    // Verify all indices from 0 to 9 are selected
    for (let i = 0; i < 10; i++) {
      expect(result.current.isSelected(i)).toBe(true);
    }
  });

  it('should clear all selections', () => {
    const { result } = renderHook(() => useImageSelection());
    
    act(() => {
      result.current.selectAll(5);
    });
    
    expect(result.current.selectionCount).toBe(5);
    
    act(() => {
      result.current.clearSelection();
    });
    
    expect(result.current.selectedIndices.size).toBe(0);
    expect(result.current.hasSelection).toBe(false);
  });

  it('should adjust selections after removal', () => {
    const { result } = renderHook(() => useImageSelection());
    
    // Select indices 0, 2, 4, 6
    act(() => {
      result.current.toggleSelection(0);
      result.current.toggleSelection(2);
      result.current.toggleSelection(4);
      result.current.toggleSelection(6);
    });
    
    expect(result.current.selectionCount).toBe(4);
    
    // Remove index 2
    act(() => {
      result.current.adjustSelectionAfterRemoval(2);
    });
    
    // Index 2 should be removed, indices > 2 should be decremented
    expect(result.current.isSelected(0)).toBe(true);
    expect(result.current.isSelected(2)).toBe(false);
    expect(result.current.isSelected(3)).toBe(true); // Was 4
    expect(result.current.isSelected(5)).toBe(true); // Was 6
    expect(result.current.selectionCount).toBe(3);
  });

  it('should adjust selections correctly when removing first index', () => {
    const { result } = renderHook(() => useImageSelection());
    
    act(() => {
      result.current.toggleSelection(0);
      result.current.toggleSelection(1);
      result.current.toggleSelection(2);
    });
    
    // Remove index 0
    act(() => {
      result.current.adjustSelectionAfterRemoval(0);
    });
    
    // All indices should be decremented
    expect(result.current.isSelected(0)).toBe(true); // Was 1
    expect(result.current.isSelected(1)).toBe(true); // Was 2
    expect(result.current.selectionCount).toBe(2);
  });

  it('should adjust selections correctly when removing last index', () => {
    const { result } = renderHook(() => useImageSelection());
    
    act(() => {
      result.current.toggleSelection(0);
      result.current.toggleSelection(5);
      result.current.toggleSelection(9);
    });
    
    // Remove index 9
    act(() => {
      result.current.adjustSelectionAfterRemoval(9);
    });
    
    // Only index 9 should be removed, others unchanged
    expect(result.current.isSelected(0)).toBe(true);
    expect(result.current.isSelected(5)).toBe(true);
    expect(result.current.isSelected(9)).toBe(false);
    expect(result.current.selectionCount).toBe(2);
  });

  it('should handle hasSelection correctly', () => {
    const { result } = renderHook(() => useImageSelection());
    
    expect(result.current.hasSelection).toBe(false);
    
    act(() => {
      result.current.toggleSelection(0);
    });
    
    expect(result.current.hasSelection).toBe(true);
  });

  it('should handle hasMultipleSelection correctly', () => {
    const { result } = renderHook(() => useImageSelection());
    
    expect(result.current.hasMultipleSelection).toBe(false);
    
    act(() => {
      result.current.toggleSelection(0);
    });
    
    expect(result.current.hasMultipleSelection).toBe(false);
    
    act(() => {
      result.current.toggleSelection(1);
    });
    
    expect(result.current.hasMultipleSelection).toBe(true);
  });
});
