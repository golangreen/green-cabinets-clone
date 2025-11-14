/**
 * useGalleryManager Hook
 * Pure composition hook that combines state and actions
 */

import { useGalleryState } from './useGalleryState';
import { useGalleryActions } from './useGalleryActions';

export function useGalleryManager() {
  const state = useGalleryState();
  const actions = useGalleryActions(state);

  return {
    ...state,
    ...actions,
  };
}
