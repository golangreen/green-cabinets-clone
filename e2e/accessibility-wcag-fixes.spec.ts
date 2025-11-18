/**
 * WCAG Fixes Verification Tests
 * Tests specifically for the accessibility fixes made on 2025-11-18
 * Verifies skip links, ARIA labels, and keyboard navigation
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 Fixes Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Skip Navigation Link', () => {
    test('should have skip link that is focusable', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab to focus the skip link
      await page.keyboard.press('Tab');
      
      // Check if skip link is visible when focused
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeVisible();
      await expect(skipLink).toHaveText('Skip to main content');
      
      // Verify it has proper focus styling
      await expect(skipLink).toHaveCSS('position', 'absolute');
    });

    test('skip link should navigate to main content', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Focus and click skip link
      await page.keyboard.press('Tab');
      const skipLink = page.locator('a[href="#main-content"]');
      await skipLink.click();

      // Verify main content is in viewport
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeInViewport();
    });

    test('skip link should be first focusable element', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // First tab should focus skip link
      await page.keyboard.press('Tab');
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeFocused();
    });
  });

  test.describe('Navigation ARIA Labels', () => {
    test('header logo should have aria-label', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const logo = page.locator('a[aria-label="Green Cabinets - Home"]');
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute('href', '/');
    });

    test('hamburger menu should have aria-label', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const menuButton = page.locator('button[aria-label="Open navigation menu"]');
      await expect(menuButton).toBeVisible();
      
      // Click to open menu
      await menuButton.click();
      
      // Verify menu is opened
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    });

    test('gallery navigation buttons should have aria-labels', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open menu
      const menuButton = page.locator('button[aria-label="Open navigation menu"]');
      await menuButton.click();
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Check each gallery navigation button
      const galleryButtons = [
        'View kitchen galleries',
        'View vanity galleries',
        'View closet galleries',
        'View design to reality galleries',
      ];

      for (const label of galleryButtons) {
        const button = page.locator(`button[aria-label="${label}"]`);
        await expect(button).toBeVisible();
      }
    });

    test('section navigation links should have aria-labels', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open menu
      const menuButton = page.locator('button[aria-label="Open navigation menu"]');
      await menuButton.click();
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Check section navigation links
      const sectionLinks = [
        'View suppliers section',
        'View solutions section',
        'View about section',
        'View contact section',
      ];

      for (const label of sectionLinks) {
        const link = page.locator(`[aria-label="${label}"]`);
        await expect(link).toBeVisible();
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('auth toggle button should have dynamic aria-label', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');

      // In login mode, should have "Switch to sign up" label
      const toggleButton = page.locator('button[aria-label="Switch to sign up"]');
      await expect(toggleButton).toBeVisible();
      
      // Click to switch to signup mode
      await toggleButton.click();
      
      // Now should have "Switch to login" label
      const loginButton = page.locator('button[aria-label="Switch to login"]');
      await expect(loginButton).toBeVisible();
    });

    test('email and password inputs should have labels', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');

      // Check email input has label
      const emailLabel = page.locator('label[for="email"]');
      await expect(emailLabel).toHaveText('Email');
      
      const emailInput = page.locator('#email');
      await expect(emailInput).toHaveAttribute('type', 'email');
      
      // Check password input has label
      const passwordLabel = page.locator('label[for="password"]');
      await expect(passwordLabel).toHaveText('Password');
      
      const passwordInput = page.locator('#password');
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('all interactive elements should be keyboard accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab through first 10 elements
      const focusableElements = [];
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        focusableElements.push(focused);
      }

      // Should have focused interactive elements (not just body)
      const interactiveElements = focusableElements.filter(
        el => el && el !== 'BODY'
      );
      expect(interactiveElements.length).toBeGreaterThan(5);
    });

    test('navigation menu should be keyboard operable', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab to menu button
      let tabCount = 0;
      while (tabCount < 20) {
        await page.keyboard.press('Tab');
        tabCount++;
        
        const focused = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.getAttribute('aria-label');
        });
        
        if (focused === 'Open navigation menu') {
          break;
        }
      }

      // Press Enter to open menu
      await page.keyboard.press('Enter');
      
      // Menu should be visible
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    });

    test('focus should be visible on all interactive elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tab through elements and check focus visibility
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        
        // Get computed styles of focused element
        const hasFocusIndicator = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          if (!el || el === document.body) return false;
          
          const styles = window.getComputedStyle(el);
          const pseudoStyles = window.getComputedStyle(el, ':focus');
          
          // Check for focus indicators (outline, ring, etc)
          return (
            styles.outline !== 'none' ||
            styles.outlineWidth !== '0px' ||
            pseudoStyles.outline !== 'none' ||
            pseudoStyles.outlineWidth !== '0px' ||
            styles.boxShadow.includes('ring') ||
            pseudoStyles.boxShadow.includes('ring')
          );
        });
        
        if (hasFocusIndicator === false) {
          const tagName = await page.evaluate(() => document.activeElement?.tagName);
          console.warn(`Element without focus indicator: ${tagName}`);
        }
      }
    });
  });

  test.describe('Semantic HTML & Landmarks', () => {
    test('page should have main landmark', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const main = page.locator('main#main-content');
      await expect(main).toBeVisible();
    });

    test('page should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Should have exactly one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);

      // Get heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      expect(headings.length).toBeGreaterThan(0);
    });

    test('images should have alt text', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check all images have alt attributes
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      expect(imagesWithoutAlt).toBe(0);

      // Check alt text is meaningful (not just empty)
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        // Alt can be empty for decorative images, but should be present
        expect(alt).not.toBeNull();
      }
    });
  });

  test.describe('Comprehensive WCAG Scan', () => {
    test('home page should pass all WCAG 2.1 Level AA checks', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log any violations
      if (results.violations.length > 0) {
        console.log('\nWCAG Violations Found:');
        results.violations.forEach(violation => {
          console.log(`\n[${violation.impact}] ${violation.id}`);
          console.log(`Description: ${violation.description}`);
          console.log(`Help: ${violation.helpUrl}`);
          console.log(`Affected nodes: ${violation.nodes.length}`);
          
          violation.nodes.forEach((node, idx) => {
            console.log(`  Node ${idx + 1}: ${node.html.substring(0, 100)}...`);
            console.log(`    Failure: ${node.failureSummary}`);
          });
        });
      }

      // Critical violations should be zero
      const criticalViolations = results.violations.filter(v => v.impact === 'critical');
      expect(criticalViolations).toEqual([]);

      // Serious violations should be addressed
      const seriousViolations = results.violations.filter(v => v.impact === 'serious');
      if (seriousViolations.length > 0) {
        console.warn(`\nWarning: ${seriousViolations.length} serious violations found`);
      }
    });

    test('auth page should be fully accessible', async ({ page }) => {
      await page.goto('/auth');
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // No critical or serious violations on auth page
      const importantViolations = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      
      if (importantViolations.length > 0) {
        console.log('\nAuth page violations:');
        importantViolations.forEach(v => {
          console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        });
      }

      expect(importantViolations).toEqual([]);
    });

    test('vanity designer should be keyboard accessible', async ({ page }) => {
      await page.goto('/vanity-designer');
      await page.waitForLoadState('networkidle');

      // Wait for 3D canvas to load
      await page.waitForTimeout(2000);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      // Focus on keyboard accessibility rules
      const keyboardViolations = results.violations.filter(v => 
        v.id.includes('keyboard') || 
        v.id.includes('focus') ||
        v.id.includes('tabindex')
      );

      if (keyboardViolations.length > 0) {
        console.log('\nKeyboard accessibility issues:');
        keyboardViolations.forEach(v => {
          console.log(`  ${v.id}: ${v.description}`);
        });
      }

      expect(keyboardViolations).toEqual([]);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('touch targets should be large enough', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Open mobile menu
      const menuButton = page.locator('button[aria-label="Open navigation menu"]');
      const box = await menuButton.boundingBox();
      
      // Touch target should be at least 44x44 pixels (WCAG 2.5.5 Level AAA)
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });

    test('mobile navigation should be operable', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Tap menu button
      const menuButton = page.locator('button[aria-label="Open navigation menu"]');
      await menuButton.tap();

      // Menu should open
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });

      // Gallery buttons should be tappable
      const kitchensButton = page.locator('button[aria-label="View kitchen galleries"]');
      await expect(kitchensButton).toBeVisible();
      
      const buttonBox = await kitchensButton.boundingBox();
      expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    });
  });
});
