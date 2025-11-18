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

export interface UseRecaptchaReturn {
  isLoaded: boolean;
  isReady: boolean;
  isConfigured: boolean;
  executeRecaptcha: (action: string) => Promise<string | null>;
}

export const useRecaptcha = (): UseRecaptchaReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      logger.warn('reCAPTCHA site key not configured', { hook: 'useRecaptcha' });
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
          logger.info('reCAPTCHA loaded and ready', { hook: 'useRecaptcha' });
        });
      }
    };

    script.onerror = () => {
      logger.error('Failed to load reCAPTCHA script', new Error('Script load failed'), { hook: 'useRecaptcha' });
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
      logger.warn('reCAPTCHA not ready', { hook: 'useRecaptcha', action });
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      logger.debug('reCAPTCHA token generated', { hook: 'useRecaptcha', action });
      return token;
    } catch (error) {
      logger.error('Failed to execute reCAPTCHA', error, {
        hook: 'useRecaptcha',
        action,
      });
      return null;
    }
  };

  return {
    isLoaded,
    isReady,
    isConfigured: !!RECAPTCHA_SITE_KEY,
    executeRecaptcha,
  };
};
