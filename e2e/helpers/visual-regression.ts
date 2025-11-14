/**
 * Visual Regression Test Helpers
 * Utilities for screenshot comparison tests
 */

import { Page, expect } from '@playwright/test';

export interface ScreenshotOptions {
  fullPage?: boolean;
  animations?: 'disabled' | 'allow';
  scale?: 'css' | 'device';
  timeout?: number;
  maxDiffPixels?: number;
  maxDiffPixelRatio?: number;
}

/**
 * Default screenshot options for consistent comparisons
 */
export const defaultScreenshotOptions: ScreenshotOptions = {
  fullPage: false,
  animations: 'disabled',
  scale: 'css',
  timeout: 5000,
};

/**
 * Take and compare a screenshot with custom options
 */
export async function compareScreenshot(
  page: Page,
  name: string,
  options: ScreenshotOptions = {}
) {
  const mergedOptions = { ...defaultScreenshotOptions, ...options };
  
  await expect(page).toHaveScreenshot(name, mergedOptions);
}

/**
 * Take a screenshot of a specific element
 */
export async function compareElementScreenshot(
  page: Page,
  selector: string,
  name: string,
  options: ScreenshotOptions = {}
) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout: options.timeout || 5000 });
  
  await expect(element).toHaveScreenshot(name, {
    animations: options.animations || 'disabled',
  });
}

/**
 * Wait for all images to load before taking screenshot
 */
export async function waitForImages(page: Page) {
  await page.evaluate(() => {
    const images = Array.from(document.images);
    return Promise.all(
      images
        .filter(img => !img.complete)
        .map(
          img =>
            new Promise(resolve => {
              img.addEventListener('load', resolve);
              img.addEventListener('error', resolve);
            })
        )
    );
  });
}

/**
 * Wait for animations to complete
 */
export async function waitForAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document.getAnimations().map(animation => animation.finished)
    )
  );
}

/**
 * Disable animations for consistent screenshots
 */
export async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
}

/**
 * Set viewport for responsive testing
 */
export async function setResponsiveViewport(
  page: Page,
  device: 'mobile' | 'tablet' | 'desktop' | 'wide'
) {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 720 },
    wide: { width: 1920, height: 1080 },
  };

  await page.setViewportSize(viewports[device]);
}

/**
 * Test component in different states
 */
export async function captureComponentStates(
  page: Page,
  selector: string,
  componentName: string,
  states: Array<{
    name: string;
    action: () => Promise<void>;
  }>
) {
  const element = page.locator(selector);

  for (const state of states) {
    await state.action();
    await expect(element).toHaveScreenshot(
      `${componentName}-${state.name}.png`,
      { animations: 'disabled' }
    );
  }
}

/**
 * Compare screenshots across different color schemes
 */
export async function compareColorSchemes(
  page: Page,
  name: string,
  options: ScreenshotOptions = {}
) {
  // Light mode
  await page.emulateMedia({ colorScheme: 'light' });
  await compareScreenshot(page, `${name}-light.png`, options);

  // Dark mode
  await page.emulateMedia({ colorScheme: 'dark' });
  await compareScreenshot(page, `${name}-dark.png`, options);
}

/**
 * Test cross-browser visual consistency
 */
export async function captureCrossBrowser(
  page: Page,
  browserName: string,
  name: string,
  options: ScreenshotOptions = {}
) {
  await compareScreenshot(page, `${name}-${browserName}.png`, options);
}

/**
 * Hide dynamic content before screenshot
 */
export async function hideDynamicContent(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    await page.locator(selector).evaluateAll(elements => {
      elements.forEach(el => {
        (el as HTMLElement).style.visibility = 'hidden';
      });
    });
  }
}

/**
 * Mask dynamic content with placeholders
 */
export async function maskDynamicContent(page: Page, selectors: string[]) {
  for (const selector of selectors) {
    await page.locator(selector).evaluateAll(elements => {
      elements.forEach(el => {
        (el as HTMLElement).style.filter = 'blur(10px)';
      });
    });
  }
}

/**
 * Wait for fonts to load
 */
export async function waitForFonts(page: Page) {
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Scroll to element before capturing
 */
export async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500); // Wait for scroll to complete
}

/**
 * Capture with tolerance for minor differences
 */
export async function compareWithTolerance(
  page: Page,
  name: string,
  maxDiffPixelRatio: number = 0.01 // 1% tolerance
) {
  await expect(page).toHaveScreenshot(name, {
    maxDiffPixelRatio,
    animations: 'disabled',
  });
}

/**
 * Create baseline screenshot
 */
export async function createBaseline(
  page: Page,
  name: string,
  options: ScreenshotOptions = {}
) {
  const mergedOptions = { ...defaultScreenshotOptions, ...options };
  
  // Ensure consistent state
  await waitForImages(page);
  await waitForFonts(page);
  
  if (mergedOptions.animations === 'disabled') {
    await disableAnimations(page);
  }
  
  await compareScreenshot(page, name, mergedOptions);
}

/**
 * Compare modal/dialog appearance
 */
export async function compareModalScreenshot(
  page: Page,
  name: string,
  options: ScreenshotOptions = {}
) {
  const modal = page.locator('[role="dialog"]');
  await modal.waitFor({ state: 'visible', timeout: 5000 });
  
  await expect(modal).toHaveScreenshot(name, {
    animations: options.animations || 'disabled',
  });
}

/**
 * Compare tooltip appearance
 */
export async function compareTooltipScreenshot(
  page: Page,
  triggerSelector: string,
  name: string
) {
  const trigger = page.locator(triggerSelector);
  await trigger.hover();
  await page.waitForTimeout(500); // Wait for tooltip to appear
  
  const tooltip = page.locator('[role="tooltip"]');
  await expect(tooltip).toHaveScreenshot(name, { animations: 'disabled' });
}
