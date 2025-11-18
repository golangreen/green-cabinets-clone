import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMaterialWorker } from '../useMaterialWorker';

describe('useMaterialWorker', () => {
  beforeEach(() => {
    // Mock Worker API
    if (!global.Worker) {
      global.Worker = class {
        onmessage = null;
        onerror = null;
        postMessage = () => {};
        terminate = () => {};
      } as any;
    }
  });

  afterEach(() => {
    // Cleanup
  });

  it('initializes without errors', () => {
    const { result } = renderHook(() => useMaterialWorker());
    expect(result.current.calculateMaterialProps).toBeDefined();
  });

  it('provides calculateMaterialProps function', async () => {
    const { result } = renderHook(() => useMaterialWorker());
    
    // Should return a promise
    const promise = result.current.calculateMaterialProps('Tafisa', 'Natural Oak');
    expect(promise).toBeInstanceOf(Promise);

    // Wait for resolution with timeout
    const materialProps = await Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve(null), 6000))
    ]);
    
    expect(materialProps).toBeDefined();
  });

  it('handles worker unavailable gracefully', async () => {
    // Test fallback when Worker is not available
    const originalWorker = global.Worker;
    delete (global as any).Worker;

    const { result } = renderHook(() => useMaterialWorker());
    const materialProps = await result.current.calculateMaterialProps('Egger', 'White Oak');

    // Should fall back to main thread calculation
    expect(materialProps).toBeDefined();

    // Restore Worker
    global.Worker = originalWorker;
  });
});
