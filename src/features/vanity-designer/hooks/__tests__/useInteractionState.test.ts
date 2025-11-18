import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInteractionState } from '../useInteractionState';

describe('useInteractionState', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useInteractionState());
    
    expect(result.current.measurementMode).toBe(false);
    expect(result.current.activeMeasurement).toBe(null);
    expect(result.current.zoom).toBe(3);
  });

  it('initializes with custom zoom value', () => {
    const { result } = renderHook(() => useInteractionState(5));
    
    expect(result.current.zoom).toBe(5);
  });

  it('toggles measurement mode', () => {
    const { result } = renderHook(() => useInteractionState());
    
    act(() => {
      result.current.toggleMeasurementMode();
    });
    
    expect(result.current.measurementMode).toBe(true);
    
    act(() => {
      result.current.toggleMeasurementMode();
    });
    
    expect(result.current.measurementMode).toBe(false);
  });

  it('clears active measurement when toggling measurement mode off', () => {
    const { result } = renderHook(() => useInteractionState());
    
    act(() => {
      result.current.toggleMeasurementMode();
      result.current.setActiveMeasurement('width');
    });
    
    expect(result.current.activeMeasurement).toBe('width');
    
    act(() => {
      result.current.toggleMeasurementMode();
    });
    
    expect(result.current.activeMeasurement).toBe(null);
  });

  it('sets active measurement', () => {
    const { result } = renderHook(() => useInteractionState());
    
    act(() => {
      result.current.setActiveMeasurement('height');
    });
    
    expect(result.current.activeMeasurement).toBe('height');
    
    act(() => {
      result.current.setActiveMeasurement('depth');
    });
    
    expect(result.current.activeMeasurement).toBe('depth');
  });

  it('zooms in correctly', () => {
    const { result } = renderHook(() => useInteractionState(3));
    
    act(() => {
      result.current.zoomIn();
    });
    
    expect(result.current.zoom).toBe(3.5);
    
    act(() => {
      result.current.zoomIn();
    });
    
    expect(result.current.zoom).toBe(4);
  });

  it('does not zoom in beyond max value', () => {
    const { result } = renderHook(() => useInteractionState(7.8));
    
    act(() => {
      result.current.zoomIn();
    });
    
    expect(result.current.zoom).toBe(8); // Max is 8
    
    act(() => {
      result.current.zoomIn();
    });
    
    expect(result.current.zoom).toBe(8); // Should not exceed 8
  });

  it('zooms out correctly', () => {
    const { result } = renderHook(() => useInteractionState(5));
    
    act(() => {
      result.current.zoomOut();
    });
    
    expect(result.current.zoom).toBe(4.5);
  });

  it('does not zoom out beyond min value', () => {
    const { result } = renderHook(() => useInteractionState(2.3));
    
    act(() => {
      result.current.zoomOut();
    });
    
    expect(result.current.zoom).toBe(2); // Min is 2
    
    act(() => {
      result.current.zoomOut();
    });
    
    expect(result.current.zoom).toBe(2); // Should not go below 2
  });

  it('resets zoom to default value', () => {
    const { result } = renderHook(() => useInteractionState(3));
    
    act(() => {
      result.current.zoomIn();
      result.current.zoomIn();
    });
    
    expect(result.current.zoom).toBe(4);
    
    act(() => {
      result.current.resetZoom(5);
    });
    
    expect(result.current.zoom).toBe(5);
  });

  it('resets state completely', () => {
    const { result } = renderHook(() => useInteractionState(3));
    
    act(() => {
      result.current.toggleMeasurementMode();
      result.current.setActiveMeasurement('width');
      result.current.zoomIn();
    });
    
    expect(result.current.measurementMode).toBe(true);
    expect(result.current.activeMeasurement).toBe('width');
    expect(result.current.zoom).toBe(3.5);
    
    act(() => {
      result.current.resetState();
    });
    
    expect(result.current.measurementMode).toBe(false);
    expect(result.current.activeMeasurement).toBe(null);
    expect(result.current.zoom).toBe(3.5); // Zoom is preserved
  });

  it('sets zoom directly', () => {
    const { result } = renderHook(() => useInteractionState());
    
    act(() => {
      result.current.setZoom(6);
    });
    
    expect(result.current.zoom).toBe(6);
  });
});
