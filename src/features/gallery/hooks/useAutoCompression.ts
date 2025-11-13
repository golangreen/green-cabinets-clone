/**
 * useAutoCompression Hook
 * Manages automatic compression workflow for oversized files
 */

import { useState, useCallback } from 'react';
import type { CompressionQuality } from '../types';
import type { OversizedFile } from '../components/CompressionDialog';
import {
  detectOversizedFiles,
  separateFilesBySize,
  analyzeOversizedFiles,
  compressFilesWithResults,
} from '../services/compressionService';

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

      // Log compression results
      console.log('Compression results:', results);
      results.forEach(result => {
        const reductionPercent = result.reduction.toFixed(1);
        console.log(
          `${result.original.name}: ${(result.originalSize / 1024 / 1024).toFixed(2)}MB → ` +
          `${(result.compressedSize / 1024 / 1024).toFixed(2)}MB (${reductionPercent}% reduction)`
        );
      });

      setOversizedFiles([]);
      return compressed;
    } catch (error) {
      console.error('Compression failed:', error);
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
