/**
 * Configuration Validation
 * Validates all environment variables and configuration values on app startup
 */

import { CACHE_CONFIG, SECURITY_CONFIG, PERFORMANCE_CONFIG, APP_CONFIG } from './index';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate required Supabase environment variables
 */
function validateSupabaseConfig(): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!APP_CONFIG.API.SUPABASE_URL) {
    errors.push({
      field: 'VITE_SUPABASE_URL',
      message: 'Supabase URL is missing',
      severity: 'error',
      suggestion: 'This should be automatically provided by Lovable Cloud. Check your project settings.',
    });
  } else if (!APP_CONFIG.API.SUPABASE_URL.startsWith('https://')) {
    errors.push({
      field: 'VITE_SUPABASE_URL',
      message: 'Supabase URL must start with https://',
      severity: 'error',
      suggestion: 'Ensure the URL is correctly formatted: https://[project-id].supabase.co',
    });
  }

  if (!APP_CONFIG.API.SUPABASE_ANON_KEY) {
    errors.push({
      field: 'VITE_SUPABASE_PUBLISHABLE_KEY',
      message: 'Supabase anon key is missing',
      severity: 'error',
      suggestion: 'This should be automatically provided by Lovable Cloud. Check your project settings.',
    });
  }

  return errors;
}

/**
 * Validate cache configuration values
 */
function validateCacheConfig(): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate cache duration
  if (CACHE_CONFIG.PRODUCT_CACHE_DURATION < 0) {
    errors.push({
      field: 'VITE_PRODUCT_CACHE_DURATION',
      message: 'Cache duration cannot be negative',
      severity: 'error',
      suggestion: 'Set to 300000 (5 minutes) or higher',
    });
  } else if (CACHE_CONFIG.PRODUCT_CACHE_DURATION < 60000) {
    errors.push({
      field: 'VITE_PRODUCT_CACHE_DURATION',
      message: 'Cache duration is very short (less than 1 minute)',
      severity: 'warning',
      suggestion: 'Consider increasing to at least 300000 (5 minutes) for better performance',
    });
  }

  // Validate preload count
  if (CACHE_CONFIG.PRELOAD_COUNT < 1) {
    errors.push({
      field: 'VITE_PRELOAD_COUNT',
      message: 'Preload count must be at least 1',
      severity: 'error',
      suggestion: 'Set to a value between 1 and 50',
    });
  } else if (CACHE_CONFIG.PRELOAD_COUNT > CACHE_CONFIG.MAX_PRELOAD_COUNT) {
    errors.push({
      field: 'VITE_PRELOAD_COUNT',
      message: `Preload count exceeds maximum (${CACHE_CONFIG.MAX_PRELOAD_COUNT})`,
      severity: 'warning',
      suggestion: `Reduce to ${CACHE_CONFIG.MAX_PRELOAD_COUNT} or lower for optimal performance`,
    });
  }

  // Validate refresh interval
  if (CACHE_CONFIG.PRELOAD_REFRESH_INTERVAL < CACHE_CONFIG.MIN_REFRESH_INTERVAL) {
    errors.push({
      field: 'VITE_PRELOAD_INTERVAL',
      message: `Refresh interval is below minimum (${CACHE_CONFIG.MIN_REFRESH_INTERVAL}ms)`,
      severity: 'warning',
      suggestion: `Increase to at least ${CACHE_CONFIG.MIN_REFRESH_INTERVAL}ms to avoid excessive API calls`,
    });
  }

  return errors;
}

/**
 * Validate security configuration values
 */
function validateSecurityConfig(): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate max retries
  if (SECURITY_CONFIG.MAX_RETRIES < 1) {
    errors.push({
      field: 'VITE_MAX_RETRIES',
      message: 'Max retries must be at least 1',
      severity: 'error',
      suggestion: 'Set to a value between 1 and 10',
    });
  } else if (SECURITY_CONFIG.MAX_RETRIES > 10) {
    errors.push({
      field: 'VITE_MAX_RETRIES',
      message: 'Max retries is very high (greater than 10)',
      severity: 'warning',
      suggestion: 'Consider reducing to avoid excessive retry attempts',
    });
  }

  // Validate retry threshold
  if (SECURITY_CONFIG.DEFAULT_RETRY_THRESHOLD < 1) {
    errors.push({
      field: 'VITE_RETRY_THRESHOLD',
      message: 'Retry threshold must be at least 1',
      severity: 'error',
      suggestion: 'Set to a value between 1 and 20',
    });
  }

  // Validate time window
  if (SECURITY_CONFIG.DEFAULT_RETRY_TIME_WINDOW_MINUTES < 1) {
    errors.push({
      field: 'VITE_RETRY_TIME_WINDOW',
      message: 'Time window must be at least 1 minute',
      severity: 'error',
      suggestion: 'Set to a value between 1 and 120 minutes',
    });
  } else if (SECURITY_CONFIG.DEFAULT_RETRY_TIME_WINDOW_MINUTES > 120) {
    errors.push({
      field: 'VITE_RETRY_TIME_WINDOW',
      message: 'Time window is very large (greater than 2 hours)',
      severity: 'warning',
      suggestion: 'Consider reducing for more timely alerts',
    });
  }

  return errors;
}

/**
 * Validate performance configuration values
 */
function validatePerformanceConfig(): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate network timeout
  if (PERFORMANCE_CONFIG.NETWORK_TIMEOUT < 1000) {
    errors.push({
      field: 'VITE_NETWORK_TIMEOUT',
      message: 'Network timeout is very short (less than 1 second)',
      severity: 'warning',
      suggestion: 'Increase to at least 5000ms to avoid premature timeouts',
    });
  } else if (PERFORMANCE_CONFIG.NETWORK_TIMEOUT > 60000) {
    errors.push({
      field: 'VITE_NETWORK_TIMEOUT',
      message: 'Network timeout is very long (greater than 1 minute)',
      severity: 'warning',
      suggestion: 'Consider reducing for better user experience',
    });
  }

  // Validate search debounce
  if (PERFORMANCE_CONFIG.SEARCH_DEBOUNCE_MS < 0) {
    errors.push({
      field: 'VITE_SEARCH_DEBOUNCE',
      message: 'Search debounce cannot be negative',
      severity: 'error',
      suggestion: 'Set to 0 for no debounce or 300+ for optimal UX',
    });
  } else if (PERFORMANCE_CONFIG.SEARCH_DEBOUNCE_MS > 1000) {
    errors.push({
      field: 'VITE_SEARCH_DEBOUNCE',
      message: 'Search debounce is very long (greater than 1 second)',
      severity: 'warning',
      suggestion: 'Reduce to 300-500ms for better responsiveness',
    });
  }

  return errors;
}

/**
 * Run all configuration validations
 */
export function validateConfiguration(): ValidationResult {
  const allErrors: ValidationError[] = [
    ...validateSupabaseConfig(),
    ...validateCacheConfig(),
    ...validateSecurityConfig(),
    ...validatePerformanceConfig(),
  ];

  const errors = allErrors.filter((e) => e.severity === 'error');
  const warnings = allErrors.filter((e) => e.severity === 'warning');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push('❌ Configuration Errors:');
    lines.push('');
    result.errors.forEach((error) => {
      lines.push(`  • ${error.field}: ${error.message}`);
      if (error.suggestion) {
        lines.push(`    → ${error.suggestion}`);
      }
      lines.push('');
    });
  }

  if (result.warnings.length > 0) {
    lines.push('⚠️  Configuration Warnings:');
    lines.push('');
    result.warnings.forEach((warning) => {
      lines.push(`  • ${warning.field}: ${warning.message}`);
      if (warning.suggestion) {
        lines.push(`    → ${warning.suggestion}`);
      }
      lines.push('');
    });
  }

  return lines.join('\n');
}
