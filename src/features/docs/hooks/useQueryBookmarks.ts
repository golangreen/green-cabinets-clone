import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface QueryBookmark {
  id: string;
  name: string;
  query: string;
  createdAt: string;
}

export const useQueryBookmarks = () => {
  const [bookmarks, setBookmarks] = useLocalStorage<QueryBookmark[]>('sql-query-bookmarks', []);

  const addBookmark = (name: string, query: string) => {
    const newBookmark: QueryBookmark = {
      id: crypto.randomUUID(),
      name,
      query,
      createdAt: new Date().toISOString(),
    };
    
    setBookmarks((prev) => [...prev, newBookmark]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBookmark = (id: string, updates: Partial<Omit<QueryBookmark, 'id'>>) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    updateBookmark,
  };
};
