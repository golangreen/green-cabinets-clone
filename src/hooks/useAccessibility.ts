import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface AccessibilityState {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersColorScheme: 'light' | 'dark' | 'no-preference';
}

/**
 * Hook to detect user accessibility preferences
 */
export function useAccessibility(): AccessibilityState {
  const [state, setState] = useState<AccessibilityState>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersColorScheme: 'no-preference',
  });

  useEffect(() => {
    const updatePreferences = () => {
      try {
        setState({
          prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
          prefersColorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : window.matchMedia('(prefers-color-scheme: light)').matches
            ? 'light'
            : 'no-preference',
        });
      } catch (error) {
        logger.error('Failed to check accessibility preferences', { error });
      }
    };

    updatePreferences();

    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-color-scheme: light)'),
    ];

    const handler = () => updatePreferences();
    mediaQueries.forEach(mq => mq.addEventListener('change', handler));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handler));
    };
  }, []);

  return state;
}
