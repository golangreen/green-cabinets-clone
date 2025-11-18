/**
 * Interaction State Hook
 * Consolidates all user interaction state for the VanityDesigner canvas
 */

import { useReducer, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface DragHandle {
  type: 'wall-start' | 'wall-end' | 'opening';
  id: number;
}

export interface DragFeedback {
  x: number;
  y: number;
  label: string;
}

export interface ScanSourced {
  walls: number[];
  openings: number[];
}

export interface InteractionState {
  // Wall drawing
  drawingWall: Point | null;
  tempWallEnd: Point | null;
  
  // Rotation
  rotatingCabinet: number | null;
  rotationStartAngle: number;
  currentRotation: number;
  
  // Selection
  selectedOpeningId: number | null;
  
  // Scan tracking
  scanSourced: ScanSourced;
  
  // Drag handles
  draggingHandle: DragHandle | null;
  
  // Drag feedback
  dragFeedback: DragFeedback | null;
}

type InteractionAction =
  | { type: 'START_DRAWING_WALL'; payload: Point }
  | { type: 'UPDATE_TEMP_WALL_END'; payload: Point }
  | { type: 'FINISH_DRAWING_WALL' }
  | { type: 'START_ROTATING_CABINET'; payload: { id: number; startAngle: number } }
  | { type: 'UPDATE_ROTATION'; payload: number }
  | { type: 'FINISH_ROTATION' }
  | { type: 'SELECT_OPENING'; payload: number | null }
  | { type: 'SET_SCAN_SOURCED'; payload: ScanSourced }
  | { type: 'START_DRAGGING_HANDLE'; payload: DragHandle }
  | { type: 'FINISH_DRAGGING_HANDLE' }
  | { type: 'SET_DRAG_FEEDBACK'; payload: DragFeedback | null }
  | { type: 'RESET_ALL' };

// ============================================================================
// Initial State
// ============================================================================

const initialState: InteractionState = {
  drawingWall: null,
  tempWallEnd: null,
  rotatingCabinet: null,
  rotationStartAngle: 0,
  currentRotation: 0,
  selectedOpeningId: null,
  scanSourced: { walls: [], openings: [] },
  draggingHandle: null,
  dragFeedback: null,
};

// ============================================================================
// Reducer
// ============================================================================

function interactionReducer(
  state: InteractionState,
  action: InteractionAction
): InteractionState {
  switch (action.type) {
    case 'START_DRAWING_WALL':
      return {
        ...state,
        drawingWall: action.payload,
        tempWallEnd: null,
      };
      
    case 'UPDATE_TEMP_WALL_END':
      return {
        ...state,
        tempWallEnd: action.payload,
      };
      
    case 'FINISH_DRAWING_WALL':
      return {
        ...state,
        drawingWall: null,
        tempWallEnd: null,
      };
      
    case 'START_ROTATING_CABINET':
      return {
        ...state,
        rotatingCabinet: action.payload.id,
        rotationStartAngle: action.payload.startAngle,
        currentRotation: 0,
      };
      
    case 'UPDATE_ROTATION':
      return {
        ...state,
        currentRotation: action.payload,
      };
      
    case 'FINISH_ROTATION':
      return {
        ...state,
        rotatingCabinet: null,
        rotationStartAngle: 0,
        currentRotation: 0,
      };
      
    case 'SELECT_OPENING':
      return {
        ...state,
        selectedOpeningId: action.payload,
      };
      
    case 'SET_SCAN_SOURCED':
      return {
        ...state,
        scanSourced: action.payload,
      };
      
    case 'START_DRAGGING_HANDLE':
      return {
        ...state,
        draggingHandle: action.payload,
      };
      
    case 'FINISH_DRAGGING_HANDLE':
      return {
        ...state,
        draggingHandle: null,
        dragFeedback: null,
      };
      
    case 'SET_DRAG_FEEDBACK':
      return {
        ...state,
        dragFeedback: action.payload,
      };
      
    case 'RESET_ALL':
      return initialState;
      
    default:
      return state;
  }
}

// ============================================================================
// Hook
// ============================================================================

export function useInteractionState() {
  const [state, dispatch] = useReducer(interactionReducer, initialState);
  
  const startDrawingWall = useCallback((point: Point) => {
    dispatch({ type: 'START_DRAWING_WALL', payload: point });
  }, []);
  
  const updateTempWallEnd = useCallback((point: Point) => {
    dispatch({ type: 'UPDATE_TEMP_WALL_END', payload: point });
  }, []);
  
  const finishDrawingWall = useCallback(() => {
    dispatch({ type: 'FINISH_DRAWING_WALL' });
  }, []);
  
  const startRotatingCabinet = useCallback((id: number, startAngle: number) => {
    dispatch({ type: 'START_ROTATING_CABINET', payload: { id, startAngle } });
  }, []);
  
  const updateRotation = useCallback((angle: number) => {
    dispatch({ type: 'UPDATE_ROTATION', payload: angle });
  }, []);
  
  const finishRotation = useCallback(() => {
    dispatch({ type: 'FINISH_ROTATION' });
  }, []);
  
  const selectOpening = useCallback((id: number | null) => {
    dispatch({ type: 'SELECT_OPENING', payload: id });
  }, []);
  
  const setScanSourced = useCallback((sourced: ScanSourced) => {
    dispatch({ type: 'SET_SCAN_SOURCED', payload: sourced });
  }, []);
  
  const startDraggingHandle = useCallback((handle: DragHandle) => {
    dispatch({ type: 'START_DRAGGING_HANDLE', payload: handle });
  }, []);
  
  const finishDraggingHandle = useCallback(() => {
    dispatch({ type: 'FINISH_DRAGGING_HANDLE' });
  }, []);
  
  const setDragFeedback = useCallback((feedback: DragFeedback | null) => {
    dispatch({ type: 'SET_DRAG_FEEDBACK', payload: feedback });
  }, []);
  
  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);
  
  return {
    ...state,
    startDrawingWall,
    updateTempWallEnd,
    finishDrawingWall,
    startRotatingCabinet,
    updateRotation,
    finishRotation,
    selectOpening,
    setScanSourced,
    startDraggingHandle,
    finishDraggingHandle,
    setDragFeedback,
    resetAll,
  };
}
