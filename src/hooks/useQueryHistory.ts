import { useState, useEffect } from 'react';

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
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse query history:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }, [history]);

  const addToHistory = (
    query: string,
    success: boolean,
    rowCount?: number,
    error?: string
  ) => {
    const item: QueryHistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: Date.now(),
      success,
      rowCount,
      error
    };
    setHistory(prev => [item, ...prev].slice(0, MAX_HISTORY_ITEMS));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    history,
    addToHistory,
    clearHistory
  };
}
