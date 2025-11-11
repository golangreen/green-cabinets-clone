import { useState, useEffect } from 'react';

export interface BookmarkItem {
  id: string;
  name: string;
  query: string;
  createdAt: number;
}

const STORAGE_KEY = 'sql-query-bookmarks';

export function useQueryBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (bookmarks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  const addBookmark = (name: string, query: string) => {
    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      name: name.trim(),
      query,
      createdAt: Date.now(),
    };
    setBookmarks(prev => [bookmark, ...prev]);
    return bookmark;
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    const remaining = bookmarks.filter(b => b.id !== id);
    if (remaining.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    bookmarks,
    addBookmark,
    deleteBookmark
  };
}
