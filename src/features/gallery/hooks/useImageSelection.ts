/**
 * useImageSelection Hook
 * Manages image selection state
 */

import { useState, useCallback } from 'react';

export function useImageSelection() {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleSelection = useCallback((index: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((totalCount: number) => {
    setSelectedIndices(new Set(Array.from({ length: totalCount }, (_, i) => i)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIndices(new Set());
  }, []);

  const adjustSelectionAfterRemoval = useCallback((removedIndex: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set<number>();
      prev.forEach(idx => {
        if (idx < removedIndex) {
          newSet.add(idx);
        } else if (idx > removedIndex) {
          newSet.add(idx - 1);
        }
        // Skip the removed index
      });
      return newSet;
    });
  }, []);

  const isSelected = useCallback((index: number) => {
    return selectedIndices.has(index);
  }, [selectedIndices]);

  const hasSelection = selectedIndices.size > 0;
  const hasMultipleSelection = selectedIndices.size > 1;
  const selectionCount = selectedIndices.size;

  return {
    selectedIndices,
    toggleSelection,
    selectAll,
    clearSelection,
    adjustSelectionAfterRemoval,
    isSelected,
    hasSelection,
    hasMultipleSelection,
    selectionCount,
  };
}
