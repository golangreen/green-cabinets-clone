import { test, expect } from '@playwright/test';
import { QuoteRequestPage } from '../page-objects/quote-request.page';

test.describe('Quote Request Submission', () => {
  let quotePage: QuoteRequestPage;

  test.beforeEach(async ({ page }) => {
    quotePage = new QuoteRequestPage(page);
    await page.goto('/');
  });

  test('should open quote request form', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    // Verify dialog is open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('should display multi-step form', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    // Step 1 should be visible
    await expect(quotePage.projectTypeSelect).toBeVisible();
    await expect(quotePage.nextButton).toBeVisible();
  });

  test('should navigate through form steps', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    // Step 1: Project details
    await quotePage.fillProjectDetails('kitchen', 'medium', 'modern');
    
    // Step 2: Budget and timeline
    await expect(quotePage.budgetSelect).toBeVisible();
    await quotePage.fillBudgetTimeline('10000-25000', '1-3 months');
    
    // Step 3: Contact info
    await expect(quotePage.nameInput).toBeVisible();
  });

  test('should allow going back to previous steps', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    await quotePage.fillProjectDetails('bathroom', 'small', 'traditional');
    await quotePage.fillBudgetTimeline('5000-10000', '3-6 months');
    
    // Go back
    await quotePage.previousButton.click();
    
    // Should be on budget/timeline step
    await expect(quotePage.budgetSelect).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    // Try to proceed without filling
    await quotePage.nextButton.click();
    
    // Should show validation error
    await expect(page.locator('text=required').or(page.locator('[aria-invalid="true"]'))).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    await quotePage.fillProjectDetails('kitchen', 'large', 'contemporary');
    await quotePage.fillBudgetTimeline('25000-50000', '6-12 months');
    
    // Enter invalid email
    await quotePage.nameInput.fill('John Doe');
    await quotePage.emailInput.fill('invalid-email');
    await quotePage.phoneInput.fill('555-123-4567');
    await quotePage.addressInput.fill('123 Main St, City, State 12345');
    
    await quotePage.nextButton.click();
    
    // Should show email validation error
    await expect(page.locator('text=valid email').or(page.locator('[aria-invalid="true"]'))).toBeVisible();
  });

  test('should validate phone number format', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    await quotePage.fillProjectDetails('closet', 'medium', 'modern');
    await quotePage.fillBudgetTimeline('5000-10000', '1-3 months');
    
    await quotePage.nameInput.fill('Jane Smith');
    await quotePage.emailInput.fill('jane@example.com');
    await quotePage.phoneInput.fill('invalid');
    await quotePage.addressInput.fill('456 Oak Ave, Town, State 67890');
    
    await quotePage.nextButton.click();
    
    // Should show phone validation error
    await expect(page.locator('text=phone').or(page.locator('[aria-invalid="true"]'))).toBeVisible();
  });

  test('should successfully submit complete quote request', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    // Step 1: Project details
    await quotePage.fillProjectDetails('kitchen', 'large', 'modern');
    
    // Step 2: Budget and timeline
    await quotePage.fillBudgetTimeline('25000-50000', '3-6 months');
    
    // Step 3: Contact info
    const timestamp = Date.now();
    await quotePage.fillContactInfo(
      'Test User',
      `test-${timestamp}@example.com`,
      '555-123-4567',
      '123 Test Street, Test City, TS 12345'
    );
    
    // Step 4: Message
    await quotePage.fillMessage('I would like to get a quote for a modern kitchen renovation.');
    
    // Submit
    await quotePage.submitQuote();
    
    // Wait for success message
    await quotePage.waitForSuccess();
    await expect(quotePage.successMessage).toBeVisible();
  });

  test('should handle reCAPTCHA verification', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    await quotePage.fillProjectDetails('bathroom', 'medium', 'contemporary');
    await quotePage.fillBudgetTimeline('10000-25000', '1-3 months');
    
    const timestamp = Date.now();
    await quotePage.fillContactInfo(
      'Captcha Test',
      `captcha-${timestamp}@example.com`,
      '555-987-6543',
      '789 Captcha Lane, Test Town, TT 11111'
    );
    
    await quotePage.fillMessage('Testing reCAPTCHA verification.');
    
    await quotePage.submitQuote();
    
    // Should either show success or reCAPTCHA challenge
    // In test environment, reCAPTCHA might be bypassed
    await expect(
      quotePage.successMessage.or(page.locator('.g-recaptcha'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('should clear form data after successful submission', async ({ page }) => {
    await quotePage.openQuoteForm();
    
    await quotePage.fillProjectDetails('office', 'small', 'modern');
    await quotePage.fillBudgetTimeline('5000-10000', '1-3 months');
    
    const timestamp = Date.now();
    await quotePage.fillContactInfo(
      'Clear Test',
      `clear-${timestamp}@example.com`,
      '555-111-2222',
      '321 Clear St, Clear City, CC 22222'
    );
    
    await quotePage.fillMessage('Test message for form clearing.');
    await quotePage.submitQuote();
    
    await quotePage.waitForSuccess();
    
    // Close success dialog
    await page.locator('button:has-text("Close")').or(page.keyboard.press('Escape')).click();
    
    // Open form again
    await quotePage.openQuoteForm();
    
    // Form should be cleared
    const projectValue = await quotePage.projectTypeSelect.inputValue();
    expect(projectValue).toBe('');
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/functions/v1/send-quote-request', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await quotePage.openQuoteForm();
    
    await quotePage.fillProjectDetails('kitchen', 'medium', 'traditional');
    await quotePage.fillBudgetTimeline('10000-25000', '3-6 months');
    
    const timestamp = Date.now();
    await quotePage.fillContactInfo(
      'Error Test',
      `error-${timestamp}@example.com`,
      '555-333-4444',
      '999 Error Road, Error Town, ET 99999'
    );
    
    await quotePage.fillMessage('Testing error handling.');
    await quotePage.submitQuote();
    
    // Should show error message
    await expect(page.locator('text=error').or(page.locator('[role="alert"]'))).toBeVisible();
  });
});
