import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  timeout: 30000, // 30 seconds per test
  expect: {
    timeout: 5000, // 5 seconds for assertions
    toHaveScreenshot: {
      // Maximum number of pixels that can differ
      maxDiffPixels: 100,
      // Maximum ratio of different pixels (0-1)
      maxDiffPixelRatio: 0.01, // 1%
      // Comparison threshold (0-1), lower = more strict
      threshold: 0.2,
      // Disable animations for consistent screenshots
      animations: 'disabled',
      // Image comparison scale
      scale: 'css',
    },
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Emulate viewport for consistent testing
    viewport: { width: 1280, height: 720 },
    // Ignore HTTPS errors in development
    ignoreHTTPSErrors: true,
    // Collect console logs
    contextOptions: {
      recordVideo: {
        dir: 'test-results/videos',
        size: { width: 1280, height: 720 },
      },
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
