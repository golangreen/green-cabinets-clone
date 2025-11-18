import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export interface AuthFixtures {
  authenticatedPage: Page;
  adminPage: Page;
}

/**
 * Creates a test user and logs them in
 */
async function createAndLoginUser(page: Page, isAdmin = false) {
  const timestamp = Date.now();
  const email = `test-user-${timestamp}@example.com`;
  const password = 'TestPassword123!';

  // Navigate to auth page
  await page.goto('/auth');
  
  // Sign up
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign Up")');
  
  // Wait for redirect to home page
  await page.waitForURL('/');
  
  // If admin, we'd need to grant admin role via database
  // For now, assume first user gets admin automatically
  
  return { email, password };
}

/**
 * Extended test with authenticated page fixture
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await createAndLoginUser(page, false);
    
    await use(page);
    
    await context.close();
  },
  
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await createAndLoginUser(page, true);
    
    await use(page);
    
    await context.close();
  },
});

export { expect };
