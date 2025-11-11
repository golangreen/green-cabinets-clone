/**
 * Configuration Presets
 * Pre-configured settings optimized for different deployment environments
 */

export interface ConfigPreset {
  name: string;
  description: string;
  environment: 'development' | 'staging' | 'production';
  values: Record<string, string | number | boolean>;
}

export const CONFIG_PRESETS: ConfigPreset[] = [
  {
    name: 'Development',
    description: 'Optimized for local development with verbose logging and fast refresh',
    environment: 'development',
    values: {
      // Cache - Short durations for quick testing
      VITE_PRODUCT_CACHE_DURATION: 60000, // 1 minute
      VITE_PRELOAD_COUNT: 5,
      VITE_PRELOAD_INTERVAL: 300000, // 5 minutes

      // Security - Relaxed for testing
      VITE_MAX_RETRIES: 5,
      VITE_RETRY_THRESHOLD: 5,
      VITE_RETRY_TIME_WINDOW: 30, // 30 minutes

      // Performance - Fast feedback
      VITE_NETWORK_TIMEOUT: 5000, // 5 seconds
      VITE_SEARCH_DEBOUNCE: 100, // 100ms

      // Features - All enabled for testing
      VITE_ENABLE_PRELOAD: true,
      VITE_ENABLE_OFFLINE: true,
      VITE_ENABLE_ANALYTICS: true,
    },
  },
  {
    name: 'Staging',
    description: 'Production-like environment for testing and QA',
    environment: 'staging',
    values: {
      // Cache - Moderate durations
      VITE_PRODUCT_CACHE_DURATION: 180000, // 3 minutes
      VITE_PRELOAD_COUNT: 15,
      VITE_PRELOAD_INTERVAL: 900000, // 15 minutes

      // Security - Balanced settings
      VITE_MAX_RETRIES: 3,
      VITE_RETRY_THRESHOLD: 3,
      VITE_RETRY_TIME_WINDOW: 10, // 10 minutes

      // Performance - Balanced
      VITE_NETWORK_TIMEOUT: 8000, // 8 seconds
      VITE_SEARCH_DEBOUNCE: 200, // 200ms

      // Features - All enabled
      VITE_ENABLE_PRELOAD: true,
      VITE_ENABLE_OFFLINE: true,
      VITE_ENABLE_ANALYTICS: true,
    },
  },
  {
    name: 'Production',
    description: 'Optimized for performance, reliability, and user experience',
    environment: 'production',
    values: {
      // Cache - Longer durations for performance
      VITE_PRODUCT_CACHE_DURATION: 300000, // 5 minutes
      VITE_PRELOAD_COUNT: 20,
      VITE_PRELOAD_INTERVAL: 1800000, // 30 minutes

      // Security - Strict settings
      VITE_MAX_RETRIES: 3,
      VITE_RETRY_THRESHOLD: 3,
      VITE_RETRY_TIME_WINDOW: 10, // 10 minutes

      // Performance - Optimized
      VITE_NETWORK_TIMEOUT: 10000, // 10 seconds
      VITE_SEARCH_DEBOUNCE: 300, // 300ms

      // Features - Selectively enabled
      VITE_ENABLE_PRELOAD: true,
      VITE_ENABLE_OFFLINE: true,
      VITE_ENABLE_ANALYTICS: false, // Disabled for privacy
    },
  },
];

/**
 * Get preset by environment
 */
export function getPreset(environment: 'development' | 'staging' | 'production'): ConfigPreset | undefined {
  return CONFIG_PRESETS.find((preset) => preset.environment === environment);
}

/**
 * Compare current values with preset values
 */
export function compareWithPreset(
  currentValues: Record<string, any>,
  preset: ConfigPreset
): { matches: number; total: number; differences: Record<string, { current: any; preset: any }> } {
  const differences: Record<string, { current: any; preset: any }> = {};
  let matches = 0;

  Object.entries(preset.values).forEach(([key, presetValue]) => {
    const currentValue = currentValues[key];
    if (String(currentValue) === String(presetValue)) {
      matches++;
    } else {
      differences[key] = { current: currentValue, preset: presetValue };
    }
  });

  return {
    matches,
    total: Object.keys(preset.values).length,
    differences,
  };
}
