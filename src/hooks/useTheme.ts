import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as Theme) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(darkModeQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
      darkModeQuery.addEventListener('change', handleChange);
      return () => darkModeQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  const setThemePreference = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return { theme, setTheme: setThemePreference };
}
