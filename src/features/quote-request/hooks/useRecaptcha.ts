import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const useRecaptcha = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      logger.warn('useRecaptcha.config', 'reCAPTCHA site key not configured');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
          logger.info('useRecaptcha.ready', 'reCAPTCHA loaded and ready');
        });
      }
    };

    script.onerror = () => {
      logger.error('useRecaptcha.load', 'Failed to load reCAPTCHA script');
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (!isReady || !window.grecaptcha) {
      logger.warn('useRecaptcha.execute', 'reCAPTCHA not ready', { action });
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      logger.debug('useRecaptcha.execute', 'Token generated', { action });
      return token;
    } catch (error) {
      logger.error('useRecaptcha.execute', 'Failed to execute reCAPTCHA', {
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  };

  return {
    isLoaded,
    isReady,
    executeRecaptcha,
  };
};
