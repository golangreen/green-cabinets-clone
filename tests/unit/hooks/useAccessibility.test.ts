import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAccessibility } from '@/hooks/useAccessibility';

describe('useAccessibility', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    matchMediaMock = vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return default accessibility state', () => {
    const { result } = renderHook(() => useAccessibility());

    expect(result.current).toEqual({
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersColorScheme: 'no-preference',
    });
  });

  it('should detect reduced motion preference', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useAccessibility());

    expect(result.current.prefersReducedMotion).toBe(true);
  });

  it('should detect high contrast preference', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-contrast: high)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useAccessibility());

    expect(result.current.prefersHighContrast).toBe(true);
  });

  it('should detect dark color scheme', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useAccessibility());

    expect(result.current.prefersColorScheme).toBe('dark');
  });

  it('should detect light color scheme', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useAccessibility());

    expect(result.current.prefersColorScheme).toBe('light');
  });

  it('should update when preferences change', async () => {
    const listeners: Array<() => void> = [];
    
    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: (_: string, callback: () => void) => {
        listeners.push(callback);
      },
      removeEventListener: vi.fn(),
    }));

    const { result, rerender } = renderHook(() => useAccessibility());

    expect(result.current.prefersReducedMotion).toBe(false);

    // Simulate preference change
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    // Trigger listeners
    listeners.forEach(listener => listener());
    rerender();

    await waitFor(() => {
      expect(result.current.prefersReducedMotion).toBe(true);
    });
  });
});
