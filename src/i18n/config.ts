/**
 * i18n Configuration for Multi-language Support
 * Phase 36f Implementation
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

// Get stored language or default to 'en'
const getStoredLanguage = () => {
  try {
    return localStorage.getItem('language') || 'en';
  } catch {
    return 'en';
  }
};

// Initialize i18n asynchronously to avoid blocking React initialization
const initializeI18n = async () => {
  if (!i18n.isInitialized) {
    await i18n
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
  }
};

// Initialize immediately but don't block
initializeI18n().catch(console.error);

export default i18n;
