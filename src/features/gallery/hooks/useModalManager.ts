/**
 * useModalManager Hook
 * Manages modal state for gallery operations
 */

import { useState, useCallback } from 'react';

export type ModalType = 'none' | 'edit' | 'batchEdit' | 'metadata';

interface ModalState {
  type: ModalType;
  data?: any;
}

export function useModalManager() {
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  const openEditModal = useCallback((imageIndex: number) => {
    setModalState({
      type: 'edit',
      data: { imageIndex },
    });
  }, []);

  const openBatchEditModal = useCallback((selectedCount: number) => {
    setModalState({
      type: 'batchEdit',
      data: { selectedCount },
    });
  }, []);

  const openMetadataModal = useCallback((selectedIndices: number[]) => {
    setModalState({
      type: 'metadata',
      data: { selectedIndices },
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: 'none' });
  }, []);

  const isEditModalOpen = modalState.type === 'edit';
  const isBatchEditModalOpen = modalState.type === 'batchEdit';
  const isMetadataModalOpen = modalState.type === 'metadata';
  const isAnyModalOpen = modalState.type !== 'none';

  return {
    modalState,
    openEditModal,
    openBatchEditModal,
    openMetadataModal,
    closeModal,
    isEditModalOpen,
    isBatchEditModalOpen,
    isMetadataModalOpen,
    isAnyModalOpen,
  };
}
