import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ScanSession } from '@/features/room-scanner/utils/roomScanner';

/**
 * Hook for managing saved room scans in localStorage
 * Provides CRUD operations with automatic persistence
 */
export function useSavedScans() {
  const [scans, setScans] = useLocalStorage<ScanSession[]>('room_scans', []);

  const addScan = useCallback((scan: ScanSession) => {
    setScans(prev => [...prev, scan]);
  }, [setScans]);

  const deleteScan = useCallback((scanId: string) => {
    setScans(prev => prev.filter(s => s.id !== scanId));
  }, [setScans]);

  const getLatestScan = useCallback(() => {
    return scans.length > 0 ? scans[scans.length - 1] : null;
  }, [scans]);

  const clearAllScans = useCallback(() => {
    setScans([]);
  }, [setScans]);

  return {
    scans,
    addScan,
    deleteScan,
    getLatestScan,
    clearAllScans,
  };
}
