import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get stored value or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error(`Error loading localStorage key "${key}"`, error, { component: 'useLocalStorage' });
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      logger.error(`Error saving localStorage key "${key}"`, error, { component: 'useLocalStorage' });
    }
  }, [key, storedValue]);

  // Wrapper to match useState API
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      logger.error(`Error setting localStorage key "${key}"`, error, { component: 'useLocalStorage' });
    }
  };

  // Clear function
  const clearValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      logger.error(`Error clearing localStorage key "${key}"`, error, { component: 'useLocalStorage' });
    }
  };

  return [storedValue, setValue, clearValue];
}
