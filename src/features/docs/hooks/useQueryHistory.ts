import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  rowCount?: number;
  error?: string;
  success: boolean;
}

const MAX_HISTORY_SIZE = 20;

export const useQueryHistory = () => {
  const [history, setHistory] = useLocalStorage<QueryHistoryItem[]>('sql-query-history', []);

  const addToHistory = (item: Omit<QueryHistoryItem, 'timestamp' | 'id'>) => {
    const newItem: QueryHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      success: !item.error,
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
