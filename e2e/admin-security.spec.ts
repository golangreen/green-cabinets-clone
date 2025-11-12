import { test, expect } from '@playwright/test';

test.describe('Admin Security Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin (you'll need to implement actual login)
    await page.goto('/auth');
    await page.getByLabel(/Email/i).fill('admin@example.com');
    await page.getByLabel(/Password/i).fill('test-password');
    await page.getByRole('button', { name: /Sign In/i }).click();
    
    // Navigate to security dashboard
    await page.goto('/admin-security');
  });

  test('should display security dashboard', async ({ page }) => {
    await expect(page.getByText(/Security Dashboard/i)).toBeVisible();
    await expect(page.getByText(/Recent Security Events/i)).toBeVisible();
  });

  test('should display security events table', async ({ page }) => {
    // Check for table headers
    await expect(page.getByText(/Event Type/i)).toBeVisible();
    await expect(page.getByText(/IP Address/i)).toBeVisible();
    await expect(page.getByText(/Severity/i)).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on Events tab
    await page.getByRole('tab', { name: /Events/i }).click();
    await expect(page.getByText(/Security Events Log/i)).toBeVisible();
    
    // Click on Blocks tab
    await page.getByRole('tab', { name: /Blocks/i }).click();
    await expect(page.getByText(/IP Block Management/i)).toBeVisible();
    
    // Click on Alerts tab
    await page.getByRole('tab', { name: /Alerts/i }).click();
    await expect(page.getByText(/Alert History/i)).toBeVisible();
  });

  test('should display blocked IPs', async ({ page }) => {
    await page.getByRole('tab', { name: /Blocks/i }).click();
    
    // Check for blocked IPs table
    await expect(page.getByText(/IP Address/i)).toBeVisible();
    await expect(page.getByText(/Reason/i)).toBeVisible();
  });
});
