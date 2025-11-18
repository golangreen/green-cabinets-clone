import type { Page, Locator } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.signUpButton = page.locator('button:has-text("Sign Up")');
    this.signInButton = page.locator('button:has-text("Sign In")');
    this.errorMessage = page.locator('[role="alert"]:has-text("error")');
    this.successMessage = page.locator('[role="alert"]:has-text("success")');
  }

  async goto() {
    await this.page.goto('/auth');
  }

  async signUp(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signUpButton.click();
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async waitForRedirect() {
    await this.page.waitForURL('/');
  }
}
