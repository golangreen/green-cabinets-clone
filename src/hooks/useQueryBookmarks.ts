import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface BookmarkItem {
  id: string;
  name: string;
  query: string;
  createdAt: number;
}

const STORAGE_KEY = 'sql-query-bookmarks';

export function useQueryBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkItem[]>(STORAGE_KEY, []);

  const addBookmark = useCallback(
    (name: string, query: string) => {
      const bookmark: BookmarkItem = {
        id: Date.now().toString(),
        name: name.trim(),
        query,
        createdAt: Date.now(),
      };
      setBookmarks(prev => [bookmark, ...prev]);
      return bookmark;
    },
    [setBookmarks]
  );

  const deleteBookmark = useCallback(
    (id: string) => {
      setBookmarks(prev => prev.filter(b => b.id !== id));
    },
    [setBookmarks]
  );

  return {
    bookmarks,
    addBookmark,
    deleteBookmark
  };
}
