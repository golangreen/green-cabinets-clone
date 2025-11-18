import type { Page, Locator } from '@playwright/test';

export class VanityDesignerPage {
  readonly page: Page;
  readonly launchDesignerButton: Locator;
  readonly widthInput: Locator;
  readonly depthInput: Locator;
  readonly heightInput: Locator;
  readonly cabinetColorSelect: Locator;
  readonly countertopMaterialSelect: Locator;
  readonly sinkStyleSelect: Locator;
  readonly faucetStyleSelect: Locator;
  readonly mirrorToggle: Locator;
  readonly saveButton: Locator;
  readonly downloadButton: Locator;
  readonly shareButton: Locator;
  readonly pricingCard: Locator;
  readonly canvas3D: Locator;

  constructor(page: Page) {
    this.page = page;
    this.launchDesignerButton = page.locator('button:has-text("Launch Designer")');
    this.widthInput = page.locator('input[name="width"]').or(page.locator('label:has-text("Width")').locator('..').locator('input'));
    this.depthInput = page.locator('input[name="depth"]').or(page.locator('label:has-text("Depth")').locator('..').locator('input'));
    this.heightInput = page.locator('input[name="height"]').or(page.locator('label:has-text("Height")').locator('..').locator('input'));
    this.cabinetColorSelect = page.locator('button:has-text("Cabinet Color")');
    this.countertopMaterialSelect = page.locator('button:has-text("Countertop")');
    this.sinkStyleSelect = page.locator('button:has-text("Sink")');
    this.faucetStyleSelect = page.locator('button:has-text("Faucet")');
    this.mirrorToggle = page.locator('button:has-text("Mirror")');
    this.saveButton = page.locator('button:has-text("Save")');
    this.downloadButton = page.locator('button:has-text("Download")');
    this.shareButton = page.locator('button:has-text("Share")');
    this.pricingCard = page.locator('[data-testid="pricing-card"]').or(page.locator('text=Total Cost'));
    this.canvas3D = page.locator('canvas');
  }

  async goto() {
    await this.page.goto('/');
    await this.launchDesignerButton.click();
    await this.page.waitForURL('/designer');
  }

  async setDimensions(width: number, depth: number, height: number) {
    await this.widthInput.fill(width.toString());
    await this.depthInput.fill(depth.toString());
    await this.heightInput.fill(height.toString());
  }

  async selectCabinetColor(color: string) {
    await this.cabinetColorSelect.click();
    await this.page.locator(`button:has-text("${color}")`).first().click();
  }

  async selectCountertop(material: string) {
    await this.countertopMaterialSelect.click();
    await this.page.locator(`button:has-text("${material}")`).first().click();
  }

  async selectSink(style: string) {
    await this.sinkStyleSelect.click();
    await this.page.locator(`button:has-text("${style}")`).first().click();
  }

  async toggleMirror() {
    await this.mirrorToggle.click();
  }

  async saveDesign() {
    await this.saveButton.click();
  }

  async downloadDesign() {
    await this.downloadButton.click();
  }

  async waitFor3DRender() {
    await this.canvas3D.waitFor({ state: 'visible' });
    // Wait for canvas to be interactive
    await this.page.waitForTimeout(2000);
  }

  async getPricing() {
    const pricingText = await this.pricingCard.textContent();
    return pricingText;
  }
}
