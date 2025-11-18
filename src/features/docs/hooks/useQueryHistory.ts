import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface QueryHistoryItem {
  query: string;
  timestamp: string;
  rowCount?: number;
  error?: string;
}

const MAX_HISTORY_SIZE = 20;

export const useQueryHistory = () => {
  const [history, setHistory] = useLocalStorage<QueryHistoryItem[]>('sql-query-history', []);

  const addToHistory = (item: Omit<QueryHistoryItem, 'timestamp'>) => {
    const newItem: QueryHistoryItem = {
      ...item,
      timestamp: new Date().toISOString(),
    };
    
    setHistory((prev) => {
      const updated = [newItem, ...prev];
      return updated.slice(0, MAX_HISTORY_SIZE);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    clearHistory,
  };
};
