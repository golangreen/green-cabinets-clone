/**
 * Sentry Error Tracking Integration
 * Provides production error monitoring with stack traces, user context, and performance tracking
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for production error tracking
 * Call this once at app startup
 */
export function initSentry() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;
  const isDevelopment = import.meta.env.DEV;

  // Only initialize Sentry in production or if explicitly configured
  if (!sentryDsn || isDevelopment) {
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    
    // Set sample rate for production (0.0 - 1.0)
    // 1.0 = capture 100% of errors
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    
    // Set sample rate for session replay (requires additional setup)
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Integrations
    integrations: [
      // React-specific integration for error boundaries
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      // Session replay for debugging
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      // Browser profiling
      Sentry.browserProfilingIntegration(),
    ],

    // Filter out sensitive information
    beforeSend(event, hint) {
      // Don't send errors in development
      if (isDevelopment) {
        return null;
      }

      // Filter out specific errors (customize as needed)
      if (event.exception) {
        const error = hint.originalException;
        
        // Filter out network errors during development
        if (error instanceof Error && error.message.includes('NetworkError')) {
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Facebook errors
      'fb_xd_fragment',
      // Network errors that aren't actionable
      'NetworkError',
      'Failed to fetch',
      // ResizeObserver errors (common and usually harmless)
      'ResizeObserver loop',
    ],

    // Don't capture breadcrumbs for sensitive operations
    beforeBreadcrumb(breadcrumb, hint) {
      // Filter out console logs in breadcrumbs
      if (breadcrumb.category === 'console') {
        return null;
      }
      return breadcrumb;
    },
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (call on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add custom context to error reports
 */
export function setCustomContext(key: string, value: Record<string, any>) {
  Sentry.setContext(key, value);
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error | unknown, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    level: 'info',
  });
}

// Re-export necessary React utilities
import React from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';
