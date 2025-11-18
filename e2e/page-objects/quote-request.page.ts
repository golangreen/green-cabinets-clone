import type { Page, Locator } from '@playwright/test';

export class QuoteRequestPage {
  readonly page: Page;
  readonly getQuoteButton: Locator;
  readonly projectTypeSelect: Locator;
  readonly roomSizeSelect: Locator;
  readonly styleSelect: Locator;
  readonly budgetSelect: Locator;
  readonly timelineSelect: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly messageInput: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getQuoteButton = page.locator('button:has-text("Get Quote")');
    this.projectTypeSelect = page.locator('[name="projectType"]');
    this.roomSizeSelect = page.locator('[name="roomSize"]');
    this.styleSelect = page.locator('[name="style"]');
    this.budgetSelect = page.locator('[name="budget"]');
    this.timelineSelect = page.locator('[name="timeline"]');
    this.nameInput = page.locator('[name="name"]');
    this.emailInput = page.locator('[name="email"]');
    this.phoneInput = page.locator('[name="phone"]');
    this.addressInput = page.locator('[name="address"]');
    this.messageInput = page.locator('[name="message"]');
    this.nextButton = page.locator('button:has-text("Next")');
    this.previousButton = page.locator('button:has-text("Previous")');
    this.submitButton = page.locator('button:has-text("Submit")');
    this.successMessage = page.locator('text=Thank you');
  }

  async openQuoteForm() {
    await this.getQuoteButton.click();
    await this.page.waitForSelector('[role="dialog"]');
  }

  async fillProjectDetails(projectType: string, roomSize: string, style: string) {
    await this.projectTypeSelect.selectOption(projectType);
    await this.roomSizeSelect.selectOption(roomSize);
    await this.styleSelect.selectOption(style);
    await this.nextButton.click();
  }

  async fillBudgetTimeline(budget: string, timeline: string) {
    await this.budgetSelect.selectOption(budget);
    await this.timelineSelect.selectOption(timeline);
    await this.nextButton.click();
  }

  async fillContactInfo(name: string, email: string, phone: string, address: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
    await this.addressInput.fill(address);
    await this.nextButton.click();
  }

  async fillMessage(message: string) {
    await this.messageInput.fill(message);
  }

  async submitQuote() {
    await this.submitButton.click();
  }

  async waitForSuccess() {
    await this.successMessage.waitFor({ state: 'visible' });
  }
}
