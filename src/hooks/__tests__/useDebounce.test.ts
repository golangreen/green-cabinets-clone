import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    );

    expect(result.current).toBe('first');

    // Change value
    rerender({ value: 'second', delay: 500 });

    // Should still show old value
    expect(result.current).toBe('first');

    // Fast-forward time
    vi.advanceTimersByTime(500);

    // Wait for state update
    await vi.waitFor(() => {
      expect(result.current).toBe('second');
    });
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    vi.advanceTimersByTime(200);

    rerender({ value: 'third' });
    vi.advanceTimersByTime(200);

    // Should still show initial
    expect(result.current).toBe('first');

    // Complete the delay
    vi.advanceTimersByTime(300);

    // Wait for final update
    await vi.waitFor(() => {
      expect(result.current).toBe('third');
    });
  });
});
