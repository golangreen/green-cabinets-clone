import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

// Add your reCAPTCHA v3 site key here
// Get it from: https://www.google.com/recaptcha/admin
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

// Gracefully handle missing site key - app works without reCAPTCHA if not configured
const IS_RECAPTCHA_ENABLED = !!RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY.length > 0;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const useRecaptcha = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Skip loading if reCAPTCHA is not enabled
    if (!IS_RECAPTCHA_ENABLED) {
      setIsLoaded(false);
      return;
    }

    // Check if reCAPTCHA script is already loaded
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setIsLoaded(true);
        });
      }
    };

    script.onerror = () => {
      logger.warn('reCAPTCHA script failed to load', { hook: 'useRecaptcha' });
      setIsLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector(`script[src*="recaptcha"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    // Return null if not configured - forms will work without it
    if (!IS_RECAPTCHA_ENABLED) {
      return null;
    }

    if (!isLoaded || !window.grecaptcha) {
      logger.warn('reCAPTCHA not loaded', { hook: 'useRecaptcha' });
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      return token;
    } catch (error) {
      logger.error('reCAPTCHA execution failed', error, { hook: 'useRecaptcha' });
      return null;
    }
  };

  return { isLoaded, executeRecaptcha, isConfigured: IS_RECAPTCHA_ENABLED };
};
