import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  success: boolean;
  rowCount?: number;
  error?: string;
}

const STORAGE_KEY = 'sql-query-history';
const MAX_HISTORY_ITEMS = 20;

export function useQueryHistory() {
  const [history, setHistory] = useLocalStorage<QueryHistoryItem[]>(STORAGE_KEY, []);

  const addToHistory = useCallback(
    (query: string, success: boolean, rowCount?: number, error?: string) => {
      const item: QueryHistoryItem = {
        id: Date.now().toString(),
        query,
        timestamp: Date.now(),
        success,
        rowCount,
        error
      };
      setHistory(prev => [item, ...prev].slice(0, MAX_HISTORY_ITEMS));
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    history,
    addToHistory,
    clearHistory
  };
}
