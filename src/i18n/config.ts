/**
 * i18n Configuration for Multi-language Support
 * Phase 36f Implementation
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

// Get stored language or default to 'en' - safe for SSR
const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  try {
    return localStorage.getItem('language') || 'en';
  } catch {
    return 'en';
  }
};

// Initialize i18n synchronously - CRITICAL for React hooks to work
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: getStoredLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
