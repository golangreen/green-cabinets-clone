import type { Page, Locator } from '@playwright/test';

export class AdminUsersPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly userTable: Locator;
  readonly assignRoleButton: Locator;
  readonly removeRoleButton: Locator;
  readonly bulkSelectCheckbox: Locator;
  readonly bulkActionsBar: Locator;
  readonly roleSelect: Locator;
  readonly expirationDatePicker: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.userTable = page.locator('[role="table"]').or(page.locator('table'));
    this.assignRoleButton = page.locator('button:has-text("Assign")');
    this.removeRoleButton = page.locator('button:has-text("Remove")');
    this.bulkSelectCheckbox = page.locator('input[type="checkbox"]').first();
    this.bulkActionsBar = page.locator('text=selected');
    this.roleSelect = page.locator('select[name="role"]').or(page.locator('button:has-text("Select role")'));
    this.expirationDatePicker = page.locator('input[type="date"]');
    this.confirmButton = page.locator('button:has-text("Confirm")');
  }

  async goto() {
    await this.page.goto('/admin/users');
  }

  async searchUser(email: string) {
    await this.searchInput.fill(email);
    await this.page.waitForTimeout(500); // Debounce delay
  }

  async selectUser(email: string) {
    const userRow = this.page.locator(`tr:has-text("${email}")`);
    const checkbox = userRow.locator('input[type="checkbox"]');
    await checkbox.check();
  }

  async assignRole(email: string, role: string, temporary: boolean = false) {
    const userRow = this.page.locator(`tr:has-text("${email}")`);
    const assignButton = userRow.locator('button:has-text("Assign")');
    await assignButton.click();
    
    await this.roleSelect.click();
    await this.page.locator(`text=${role}`).click();
    
    if (temporary) {
      await this.expirationDatePicker.fill('2025-12-31');
    }
    
    await this.confirmButton.click();
  }

  async removeRole(email: string, role: string) {
    const userRow = this.page.locator(`tr:has-text("${email}")`);
    const roleBadge = userRow.locator(`text=${role}`);
    await roleBadge.hover();
    const removeButton = userRow.locator('button:has-text("Remove")');
    await removeButton.click();
    await this.confirmButton.click();
  }

  async bulkAssignRole(role: string) {
    await this.roleSelect.click();
    await this.page.locator(`text=${role}`).click();
    const bulkAssignButton = this.bulkActionsBar.locator('button:has-text("Assign")');
    await bulkAssignButton.click();
  }

  async getUserCount() {
    const rows = this.userTable.locator('tbody tr');
    return await rows.count();
  }

  async verifyRoleAssigned(email: string, role: string) {
    const userRow = this.page.locator(`tr:has-text("${email}")`);
    const roleBadge = userRow.locator(`text=${role}`);
    return await roleBadge.isVisible();
  }
}
