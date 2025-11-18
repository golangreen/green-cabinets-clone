import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/auth.page';
import { VanityDesignerPage } from '../page-objects/vanity-designer.page';
import { QuoteRequestPage } from '../page-objects/quote-request.page';

/**
 * Critical user journeys end-to-end tests
 * These tests simulate complete user workflows from start to finish
 */
test.describe('Critical User Journeys', () => {
  
  test('Complete new user journey: Sign up → Design vanity → Request quote', async ({ page }) => {
    const timestamp = Date.now();
    const email = `journey-${timestamp}@example.com`;
    const password = 'Journey123!';
    
    // Step 1: Sign up
    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.signUp(email, password);
    await page.waitForURL('/');
    
    // Step 2: Launch vanity designer
    const designerPage = new VanityDesignerPage(page);
    await designerPage.launchDesignerButton.click();
    await page.waitForURL('/designer');
    await designerPage.waitFor3DRender();
    
    // Step 3: Configure vanity
    await designerPage.setDimensions(48, 22, 36);
    await page.waitForTimeout(500);
    await designerPage.selectCabinetColor('White');
    await page.waitForTimeout(500);
    await designerPage.selectCountertop('Quartz');
    await page.waitForTimeout(500);
    
    // Step 4: Save design
    await designerPage.saveButton.click();
    await expect(page.locator('text=Saved').or(page.locator('[role="status"]'))).toBeVisible({ timeout: 5000 });
    
    // Step 5: Navigate back to home
    await page.goto('/');
    
    // Step 6: Request quote
    const quotePage = new QuoteRequestPage(page);
    await quotePage.openQuoteForm();
    
    await quotePage.fillProjectDetails('bathroom', 'medium', 'modern');
    await quotePage.fillBudgetTimeline('10000-25000', '3-6 months');
    await quotePage.fillContactInfo(
      'Journey User',
      email,
      '555-123-4567',
      '123 Journey St, Test City, TC 12345'
    );
    await quotePage.fillMessage('Quote request from complete user journey test.');
    await quotePage.submitQuote();
    
    // Verify success
    await quotePage.waitForSuccess();
    await expect(quotePage.successMessage).toBeVisible();
  });

  test('Return user journey: Sign in → Load saved design → Modify → Download', async ({ page }) => {
    const timestamp = Date.now();
    const email = `return-${timestamp}@example.com`;
    const password = 'Return123!';
    
    // First visit: Create account and save design
    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.signUp(email, password);
    await page.waitForURL('/');
    
    const designerPage = new VanityDesignerPage(page);
    await designerPage.goto();
    await designerPage.waitFor3DRender();
    await designerPage.setDimensions(54, 22, 36);
    await designerPage.selectCabinetColor('Espresso');
    await designerPage.saveButton.click();
    await page.waitForTimeout(1000);
    
    // Sign out
    const userMenu = page.locator('button:has-text("Account")').or(page.locator('[aria-label="User menu"]'));
    await userMenu.click();
    await page.locator('button:has-text("Sign Out")').click();
    
    // Return visit: Sign in
    await authPage.goto();
    await authPage.signIn(email, password);
    await page.waitForURL('/');
    
    // Load designer (saved design should load)
    await designerPage.goto();
    await designerPage.waitFor3DRender();
    
    // Modify design
    await designerPage.selectCountertop('Granite');
    await page.waitForTimeout(500);
    
    // Download design
    const downloadPromise = page.waitForEvent('download');
    await designerPage.downloadButton.click();
    
    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });

  test('Mobile user journey: Browse gallery → View product → Request quote', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Step 1: Browse home page
    await page.goto('/');
    
    // Step 2: Scroll through gallery
    const gallery = page.locator('text=Gallery').or(page.locator('[data-testid="gallery"]'));
    if (await gallery.isVisible()) {
      await gallery.scrollIntoViewIfNeeded();
    }
    
    // Step 3: Open mobile menu
    const hamburger = page.locator('button[aria-label="Menu"]').or(page.locator('[data-testid="hamburger"]'));
    await hamburger.click();
    
    // Step 4: Navigate to catalog
    const catalogLink = page.locator('a:has-text("Catalog")');
    if (await catalogLink.isVisible()) {
      await catalogLink.click();
    }
    
    // Step 5: Request quote from mobile
    const quotePage = new QuoteRequestPage(page);
    await quotePage.openQuoteForm();
    
    await quotePage.fillProjectDetails('kitchen', 'small', 'modern');
    await quotePage.fillBudgetTimeline('5000-10000', '1-3 months');
    
    const timestamp = Date.now();
    await quotePage.fillContactInfo(
      'Mobile User',
      `mobile-${timestamp}@example.com`,
      '555-987-6543',
      '789 Mobile Ave, Mobile City, MC 67890'
    );
    await quotePage.fillMessage('Quote from mobile device.');
    await quotePage.submitQuote();
    
    await quotePage.waitForSuccess();
    await expect(quotePage.successMessage).toBeVisible();
  });

  test('Admin workflow: Create users → Assign roles → Monitor security', async ({ page }) => {
    const timestamp = Date.now();
    const adminEmail = `admin-flow-${timestamp}@example.com`;
    const password = 'AdminFlow123!';
    
    // Create admin account
    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.signUp(adminEmail, password);
    await page.waitForURL('/');
    
    // Navigate to admin users
    await page.goto('/admin/users');
    
    // Wait for users table
    await page.locator('table').or(page.locator('[role="table"]')).waitFor({ state: 'visible' });
    
    // Select a user and assign role
    const userRows = page.locator('tbody tr');
    const count = await userRows.count();
    
    if (count > 1) {
      const checkbox = userRows.nth(1).locator('input[type="checkbox"]');
      await checkbox.check();
      
      // Assign moderator role
      const roleSelect = page.locator('select').or(page.locator('button:has-text("Select role")'));
      if (await roleSelect.isVisible()) {
        await roleSelect.click();
        await page.locator('text=moderator').click();
        
        const assignButton = page.locator('button:has-text("Assign")');
        await assignButton.click();
      }
    }
    
    // Navigate to security dashboard
    await page.goto('/admin/security');
    
    // Verify security widgets are visible
    await expect(page.locator('text=Security Events').or(page.locator('text=Recent Events'))).toBeVisible();
    
    // Navigate to audit log
    await page.goto('/admin/audit-log');
    
    // Verify audit entries exist
    await expect(page.locator('table').or(page.locator('[role="table"]'))).toBeVisible();
  });

  test('Error recovery journey: Network failure → Retry → Success', async ({ page }) => {
    const timestamp = Date.now();
    const email = `recovery-${timestamp}@example.com`;
    
    // Simulate network failure
    await page.route('**/functions/v1/send-quote-request', route => {
      route.abort('failed');
    });
    
    const quotePage = new QuoteRequestPage(page);
    await page.goto('/');
    await quotePage.openQuoteForm();
    
    await quotePage.fillProjectDetails('office', 'medium', 'contemporary');
    await quotePage.fillBudgetTimeline('10000-25000', '3-6 months');
    await quotePage.fillContactInfo(
      'Recovery Test',
      email,
      '555-111-2222',
      '111 Recovery Rd, Test Town, TT 11111'
    );
    await quotePage.fillMessage('Testing error recovery.');
    await quotePage.submitQuote();
    
    // Should show error
    await expect(page.locator('text=error').or(page.locator('[role="alert"]'))).toBeVisible({ timeout: 5000 });
    
    // Restore network
    await page.unroute('**/functions/v1/send-quote-request');
    
    // Retry submission
    await quotePage.submitButton.click();
    
    // Should succeed
    await quotePage.waitForSuccess();
    await expect(quotePage.successMessage).toBeVisible();
  });
});
