/**
 * useAutoCompression Hook
 * Manages automatic compression workflow state
 */

import { useState, useCallback } from 'react';
import type { CompressionQuality } from '../types';
import {
  detectOversizedFiles,
  separateFilesBySize,
  analyzeOversizedFiles,
  compressFilesWithResults,
  type OversizedFile,
} from '../services/compression';
import { logger } from '@/lib/logger';

export function useAutoCompression() {
  const [oversizedFiles, setOversizedFiles] = useState<OversizedFile[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({ current: 0, total: 0 });

  /**
   * Check if files need compression and prepare oversized file data
   */
  const checkForOversizedFiles = useCallback(async (files: File[]): Promise<{
    needsCompression: boolean;
    oversized: OversizedFile[];
    acceptable: File[];
  }> => {
    const { oversized, acceptable } = separateFilesBySize(files);
    
    if (oversized.length === 0) {
      return {
        needsCompression: false,
        oversized: [],
        acceptable,
      };
    }

    const oversizedWithEstimates = await analyzeOversizedFiles(oversized);
    setOversizedFiles(oversizedWithEstimates);

    return {
      needsCompression: true,
      oversized: oversizedWithEstimates,
      acceptable,
    };
  }, []);

  /**
   * Compress oversized files
   */
  const compressOversizedFiles = useCallback(async (
    quality: CompressionQuality
  ): Promise<File[]> => {
    if (oversizedFiles.length === 0) {
      return [];
    }

    setIsCompressing(true);
    setCompressionProgress({ current: 0, total: oversizedFiles.length });

    try {
      const filesToCompress = oversizedFiles.map(item => item.file);
      
      const { compressed, results } = await compressFilesWithResults(
        filesToCompress,
        quality,
        (current, total) => {
          setCompressionProgress({ current, total });
        }
      );

      // Log compression results for monitoring
      logger.info('Compression completed', { 
        count: results.length,
        results: results.map(r => ({
          filename: r.original.name,
          originalSizeMB: (r.originalSize / 1024 / 1024).toFixed(2),
          compressedSizeMB: (r.compressedSize / 1024 / 1024).toFixed(2),
          reductionPercent: r.reduction.toFixed(1)
        })),
        component: 'useAutoCompression'
      });

      setOversizedFiles([]);
      return compressed;
    } catch (error) {
      logger.error('Compression failed', error, { component: 'useAutoCompression' });
      throw error;
    } finally {
      setIsCompressing(false);
      setCompressionProgress({ current: 0, total: 0 });
    }
  }, [oversizedFiles]);

  /**
   * Clear oversized files (user chose to skip)
   */
  const clearOversizedFiles = useCallback(() => {
    setOversizedFiles([]);
  }, []);

  /**
   * Quick check if any files are oversized (without analysis)
   */
  const hasOversizedFiles = useCallback((files: File[]): boolean => {
    return detectOversizedFiles(files).length > 0;
  }, []);

  return {
    oversizedFiles,
    isCompressing,
    compressionProgress,
    checkForOversizedFiles,
    compressOversizedFiles,
    clearOversizedFiles,
    hasOversizedFiles,
  };
}
