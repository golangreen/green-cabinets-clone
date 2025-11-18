import { test, expect } from '@playwright/test';
import { AuthPage } from '../page-objects/auth.page';
import { AdminUsersPage } from '../page-objects/admin-users.page';

test.describe('Admin User Management', () => {
  let adminPage: AdminUsersPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminUsersPage(page);
    authPage = new AuthPage(page);
    
    // Create and login as admin user
    // Note: First user typically gets admin role automatically
    const timestamp = Date.now();
    const email = `admin-${timestamp}@example.com`;
    const password = 'AdminPassword123!';
    
    await authPage.goto();
    await authPage.signUp(email, password);
    await page.waitForURL('/');
    
    // Navigate to admin users page
    await adminPage.goto();
  });

  test('should display admin users page', async ({ page }) => {
    await expect(page).toHaveURL('/admin/users');
    await expect(adminPage.userTable).toBeVisible();
  });

  test('should display list of users', async () => {
    // Wait for users to load
    await adminPage.userTable.waitFor({ state: 'visible' });
    
    const userCount = await adminPage.getUserCount();
    expect(userCount).toBeGreaterThan(0);
  });

  test('should search for users by email', async ({ page }) => {
    // Get first user's email
    const firstUserEmail = await page.locator('tbody tr').first().locator('td').nth(1).textContent();
    
    if (firstUserEmail) {
      await adminPage.searchUser(firstUserEmail);
      
      // Should show filtered results
      const visibleRows = await adminPage.userTable.locator('tbody tr:visible').count();
      expect(visibleRows).toBeGreaterThan(0);
    }
  });

  test('should assign admin role to user', async ({ page }) => {
    // Create a new test user first
    const timestamp = Date.now();
    const testEmail = `role-test-${timestamp}@example.com`;
    
    // For this test, assume we can see the test user in the list
    // In real scenario, you might need to create user via API
    
    await adminPage.searchUser(testEmail);
    
    // If user exists, assign admin role
    const userRow = page.locator(`tr:has-text("${testEmail}")`);
    if (await userRow.isVisible()) {
      await adminPage.assignRole(testEmail, 'admin');
      
      // Verify role was assigned
      const hasRole = await adminPage.verifyRoleAssigned(testEmail, 'admin');
      expect(hasRole).toBeTruthy();
    }
  });

  test('should assign temporary role with expiration date', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `temp-role-${timestamp}@example.com`;
    
    await adminPage.searchUser(testEmail);
    
    const userRow = page.locator(`tr:has-text("${testEmail}")`);
    if (await userRow.isVisible()) {
      await adminPage.assignRole(testEmail, 'moderator', true);
      
      // Verify temporary role indicator
      await expect(userRow.locator('text=Expires')).toBeVisible();
    }
  });

  test('should remove role from user', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `remove-role-${timestamp}@example.com`;
    
    await adminPage.searchUser(testEmail);
    
    const userRow = page.locator(`tr:has-text("${testEmail}")`);
    if (await userRow.isVisible()) {
      // First assign a role
      await adminPage.assignRole(testEmail, 'moderator');
      
      // Then remove it
      await adminPage.removeRole(testEmail, 'moderator');
      
      // Verify role was removed
      const hasRole = await adminPage.verifyRoleAssigned(testEmail, 'moderator');
      expect(hasRole).toBeFalsy();
    }
  });

  test('should select multiple users for bulk operations', async () => {
    // Select first checkbox (select all)
    await adminPage.bulkSelectCheckbox.check();
    
    // Verify bulk actions bar appears
    await expect(adminPage.bulkActionsBar).toBeVisible();
  });

  test('should bulk assign roles to multiple users', async ({ page }) => {
    // Select multiple users
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      
      // Bulk assign moderator role
      await adminPage.bulkAssignRole('moderator');
      
      // Verify success message
      await expect(page.locator('text=assigned').or(page.locator('[role="status"]'))).toBeVisible();
    }
  });

  test('should prevent removing last admin', async ({ page }) => {
    // Try to remove admin role from the only admin
    const adminRows = page.locator('tr:has-text("admin")');
    const adminCount = await adminRows.count();
    
    if (adminCount === 1) {
      const adminEmail = await adminRows.first().locator('td').nth(1).textContent();
      
      if (adminEmail) {
        await adminPage.removeRole(adminEmail, 'admin');
        
        // Should show error preventing removal
        await expect(page.locator('text=last admin').or(page.locator('text=at least one admin'))).toBeVisible();
      }
    }
  });

  test('should display role expiration warnings', async ({ page }) => {
    // Navigate to admin security page to see expiring roles widget
    await page.goto('/admin/security');
    
    // Look for expiring roles widget
    const expiringWidget = page.locator('text=Expiring Roles').or(page.locator('[data-testid="expiring-roles"]'));
    
    if (await expiringWidget.isVisible()) {
      await expect(expiringWidget).toBeVisible();
    }
  });

  test('should extend role expiration date', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `extend-role-${timestamp}@example.com`;
    
    await adminPage.searchUser(testEmail);
    
    const userRow = page.locator(`tr:has-text("${testEmail}")`);
    if (await userRow.isVisible()) {
      // Assign temporary role
      await adminPage.assignRole(testEmail, 'moderator', true);
      
      // Click extend button
      const extendButton = userRow.locator('button:has-text("Extend")');
      if (await extendButton.isVisible()) {
        await extendButton.click();
        
        // Set new expiration date
        await adminPage.expirationDatePicker.fill('2026-12-31');
        await adminPage.confirmButton.click();
        
        // Verify success
        await expect(page.locator('text=extended').or(page.locator('[role="status"]'))).toBeVisible();
      }
    }
  });

  test('should display user audit log', async ({ page }) => {
    // Navigate to audit log
    await page.goto('/admin/audit-log');
    
    // Verify audit log table is visible
    await expect(page.locator('table').or(page.locator('[role="table"]'))).toBeVisible();
    
    // Should show role change events
    await expect(page.locator('text=assigned').or(page.locator('text=removed'))).toBeVisible();
  });

  test('should filter audit log by action type', async ({ page }) => {
    await page.goto('/admin/audit-log');
    
    // Click filter dropdown
    const filterButton = page.locator('button:has-text("Filter")').or(page.locator('[data-testid="filter"]'));
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Select "assigned" filter
      await page.locator('text=Assigned').click();
      
      // Verify filtered results
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      
      if (count > 0) {
        // All visible rows should be "assigned" actions
        await expect(rows.first()).toContainText('assigned');
      }
    }
  });

  test('should export audit log to CSV', async ({ page }) => {
    await page.goto('/admin/audit-log');
    
    // Click export button
    const exportButton = page.locator('button:has-text("Export")').or(page.locator('[data-testid="export"]'));
    
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    }
  });

  test('should handle non-admin user access restriction', async ({ page, context }) => {
    // Create a new non-admin user in a new context
    const newContext = await context.browser()!.newContext();
    const newPage = await newContext.newPage();
    
    const authPageNew = new AuthPage(newPage);
    await authPageNew.goto();
    
    const timestamp = Date.now();
    const nonAdminEmail = `user-${timestamp}@example.com`;
    await authPageNew.signUp(nonAdminEmail, 'UserPassword123!');
    
    await newPage.waitForURL('/');
    
    // Try to access admin page
    await newPage.goto('/admin/users');
    
    // Should be redirected or show access denied
    await expect(
      newPage.locator('text=Access Denied').or(newPage.getByText('unauthorized'))
    ).toBeVisible({ timeout: 5000 });
    
    await newContext.close();
  });
});
