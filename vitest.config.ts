import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__tests__/**',
        '**/index.ts',
        'src/integrations/supabase/types.ts',
        'src/integrations/supabase/client.ts',
        '*.config.{ts,js}',
        '**/types/**',
        '**/*.d.ts',
        'src/components/ui/**', // Shadcn components
        'src/main.tsx',
        'src/App.tsx',
        '.eslintrc.cjs',
        'postcss.config.js',
        'tailwind.config.ts',
      ],
      include: [
        'src/**/*.{ts,tsx}',
      ],
      all: true,
      // Coverage thresholds - tests will fail if coverage drops below these values
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
      // Per-file thresholds for critical modules
      perFile: true,
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Test execution settings
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
