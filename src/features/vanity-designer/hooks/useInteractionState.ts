import { useReducer, useCallback } from 'react';

type MeasurementType = 'height' | 'width' | 'depth' | 'door' | null;

interface InteractionState {
  measurementMode: boolean;
  activeMeasurement: MeasurementType;
  zoom: number;
}

type InteractionAction =
  | { type: 'TOGGLE_MEASUREMENT_MODE' }
  | { type: 'SET_ACTIVE_MEASUREMENT'; payload: MeasurementType }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'ZOOM_IN' }
  | { type: 'ZOOM_OUT' }
  | { type: 'RESET_ZOOM'; payload: number }
  | { type: 'RESET_STATE' };

const interactionReducer = (state: InteractionState, action: InteractionAction): InteractionState => {
  switch (action.type) {
    case 'TOGGLE_MEASUREMENT_MODE':
      return {
        ...state,
        measurementMode: !state.measurementMode,
        activeMeasurement: state.measurementMode ? null : state.activeMeasurement,
      };
    case 'SET_ACTIVE_MEASUREMENT':
      return {
        ...state,
        activeMeasurement: action.payload,
      };
    case 'SET_ZOOM':
      return {
        ...state,
        zoom: action.payload,
      };
    case 'ZOOM_IN':
      return {
        ...state,
        zoom: Math.min(8, state.zoom + 0.5),
      };
    case 'ZOOM_OUT':
      return {
        ...state,
        zoom: Math.max(2, state.zoom - 0.5),
      };
    case 'RESET_ZOOM':
      return {
        ...state,
        zoom: action.payload,
      };
    case 'RESET_STATE':
      return {
        measurementMode: false,
        activeMeasurement: null,
        zoom: state.zoom,
      };
    default:
      return state;
  }
};

export const useInteractionState = (initialZoom: number = 3) => {
  const [state, dispatch] = useReducer(interactionReducer, {
    measurementMode: false,
    activeMeasurement: null,
    zoom: initialZoom,
  });

  const toggleMeasurementMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_MEASUREMENT_MODE' });
  }, []);

  const setActiveMeasurement = useCallback((measurement: MeasurementType) => {
    dispatch({ type: 'SET_ACTIVE_MEASUREMENT', payload: measurement });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const zoomIn = useCallback(() => {
    dispatch({ type: 'ZOOM_IN' });
  }, []);

  const zoomOut = useCallback(() => {
    dispatch({ type: 'ZOOM_OUT' });
  }, []);

  const resetZoom = useCallback((defaultZoom: number) => {
    dispatch({ type: 'RESET_ZOOM', payload: defaultZoom });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  return {
    ...state,
    toggleMeasurementMode,
    setActiveMeasurement,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    resetState,
  };
};
