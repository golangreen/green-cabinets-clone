import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoCompression } from './useAutoCompression';

// Mock the compression service
vi.mock('../services/compression', () => ({
  detectOversizedFiles: vi.fn((files: File[]) => 
    files.filter(f => f.size > 10 * 1024 * 1024)
  ),
  separateFilesBySize: vi.fn((files: File[]) => ({
    oversized: files.filter(f => f.size > 10 * 1024 * 1024),
    acceptable: files.filter(f => f.size <= 10 * 1024 * 1024),
  })),
  analyzeOversizedFiles: vi.fn(async (files: File[]) => 
    files.map(file => ({
      file,
      currentSize: file.size,
      estimates: {
        low: Math.floor(file.size * 0.3),
        medium: Math.floor(file.size * 0.5),
        high: Math.floor(file.size * 0.7),
      },
    }))
  ),
  compressFilesWithResults: vi.fn(async (files: File[], quality: string, onProgress?: Function) => {
    if (onProgress) {
      files.forEach((_, idx) => onProgress(idx + 1, files.length));
    }
    return {
      compressed: files.map(f => new File([new Blob()], f.name, { type: f.type })),
      results: files.map(f => ({
        original: f,
        originalSize: f.size,
        compressedSize: Math.floor(f.size * 0.5),
        reduction: 50,
      })),
    };
  }),
}));

describe('useAutoCompression', () => {
  const createMockFile = (name: string, size: number): File => {
    const blob = new Blob(['x'.repeat(size)], { type: 'image/jpeg' });
    return new File([blob], name, { type: 'image/jpeg' });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAutoCompression());
    
    expect(result.current.oversizedFiles).toEqual([]);
    expect(result.current.isCompressing).toBe(false);
    expect(result.current.compressionProgress).toEqual({ current: 0, total: 0 });
  });

  it('should detect files that need compression', async () => {
    const { result } = renderHook(() => useAutoCompression());
    
    const files = [
      createMockFile('small.jpg', 5 * 1024 * 1024),
      createMockFile('large.jpg', 15 * 1024 * 1024),
    ];

    let checkResult: any;
    await act(async () => {
      checkResult = await result.current.checkForOversizedFiles(files);
    });

    expect(checkResult.needsCompression).toBe(true);
    expect(checkResult.oversized.length).toBe(1);
    expect(checkResult.acceptable.length).toBe(1);
    expect(result.current.oversizedFiles.length).toBe(1);
  });

  it('should return no compression needed for small files', async () => {
    const { result } = renderHook(() => useAutoCompression());
    
    const files = [
      createMockFile('small1.jpg', 5 * 1024 * 1024),
      createMockFile('small2.jpg', 3 * 1024 * 1024),
    ];

    let checkResult: any;
    await act(async () => {
      checkResult = await result.current.checkForOversizedFiles(files);
    });

    expect(checkResult.needsCompression).toBe(false);
    expect(checkResult.oversized.length).toBe(0);
    expect(checkResult.acceptable.length).toBe(2);
  });

  it('should compress oversized files', async () => {
    const { result } = renderHook(() => useAutoCompression());
    
    const files = [
      createMockFile('large1.jpg', 15 * 1024 * 1024),
      createMockFile('large2.jpg', 20 * 1024 * 1024),
    ];

    await act(async () => {
      await result.current.checkForOversizedFiles(files);
    });

    expect(result.current.oversizedFiles.length).toBe(2);

    let compressed: File[];
    await act(async () => {
      compressed = await result.current.compressOversizedFiles('medium');
    });

    // After compression completes, state should be reset
    expect(result.current.isCompressing).toBe(false);
    expect(result.current.oversizedFiles.length).toBe(0);
  });

  it('should update compression progress', async () => {
    const { result } = renderHook(() => useAutoCompression());
    
    const files = [
      createMockFile('large.jpg', 15 * 1024 * 1024),
    ];

    await act(async () => {
      await result.current.checkForOversizedFiles(files);
    });

    let compressed: File[];
    await act(async () => {
      compressed = await result.current.compressOversizedFiles('high');
    });

    // Should reset progress after completion
    expect(result.current.compressionProgress).toEqual({ current: 0, total: 0 });
    expect(result.current.isCompressing).toBe(false);
  });

  it('should clear oversized files', async () => {
    const { result } = renderHook(() => useAutoCompression());
    
    const files = [createMockFile('large.jpg', 15 * 1024 * 1024)];

    await act(async () => {
      await result.current.checkForOversizedFiles(files);
    });

    expect(result.current.oversizedFiles.length).toBe(1);

    act(() => {
      result.current.clearOversizedFiles();
    });

    expect(result.current.oversizedFiles.length).toBe(0);
  });

  it('should quickly check if files are oversized', () => {
    const { result } = renderHook(() => useAutoCompression());
    
    const files = [
      createMockFile('small.jpg', 5 * 1024 * 1024),
      createMockFile('large.jpg', 15 * 1024 * 1024),
    ];

    const hasOversized = result.current.hasOversizedFiles(files);
    expect(hasOversized).toBe(true);
  });

  it('should return false for hasOversizedFiles with all small files', () => {
    const { result } = renderHook(() => useAutoCompression());
    
    const files = [
      createMockFile('small1.jpg', 5 * 1024 * 1024),
      createMockFile('small2.jpg', 3 * 1024 * 1024),
    ];

    const hasOversized = result.current.hasOversizedFiles(files);
    expect(hasOversized).toBe(false);
  });
});
