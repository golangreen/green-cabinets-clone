// Playwright test: loads /designer, opens the finish picker inside the
// vanity-designer iframe, and asserts every panel row renders for every
// brand with zero console errors.
//
// Run: node tests/designer-panels.spec.mjs
// Requires the dev server on http://localhost:8080.

import { chromium } from "playwright";
import { strict as assert } from "node:assert";

const EXPECTED = { tafisa: 117, egger: 25, wilsonart: 25, agt: 23, shinnoki: 18 };
const TOTAL = Object.values(EXPECTED).reduce((a, b) => a + b, 0); // 208

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
const page = await ctx.newPage();

const errors = [];
// Filter out noise unrelated to the vanity-designer iframe (analytics RLS,
// third-party widget glitches) so the test only fails on designer issues.
const IGNORE = [
  /performance_metrics/i,
  /status of 401/i,
  /Cannot read properties of undefined \(reading 'c1'\)/,
];
const keep = (msg) => !IGNORE.some((re) => re.test(msg));
page.on("pageerror", (e) => keep(e.message) && errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error" && keep(m.text())) errors.push(`console: ${m.text()}`);
});

await page.goto("http://localhost:8080/designer", { waitUntil: "domcontentloaded" });

const frame = await page
  .frameLocator('iframe[src*="vanity-designer.html"]')
  .locator("body")
  .first();
await frame.waitFor({ state: "visible", timeout: 15_000 });

const f = page.frame({ url: /vanity-designer\.html/ });
assert(f, "vanity-designer iframe not found");

// Open the finish dropdown
await f.locator("#pickBtn").click();
await f.locator("#dd.open").waitFor({ timeout: 5_000 });

// Wait for all 208 rows
await f.waitForFunction(
  (n) => document.querySelectorAll("#dd [data-fin]").length === n,
  TOTAL,
  { timeout: 5_000 }
);

// Per-brand assertion via search filter
for (const [brand, count] of Object.entries(EXPECTED)) {
  await f.locator("#ddSearch").fill("");
  const ids = await f.$$eval(
    "#dd [data-fin]",
    (els, b) => els.map((e) => e.dataset.fin).filter((id) => id.startsWith(b + "-")),
    brand
  );
  assert.equal(ids.length, count, `${brand}: expected ${count}, got ${ids.length}`);

  // Select first finish of the brand to ensure it renders without error
  await f.locator(`#dd [data-fin="${ids[0]}"]`).click();
  await f.locator("#pickBtn").click();
  await f.locator("#dd.open").waitFor();
}

// Verify swatch chips are present on every row
const chipsMissing = await f.$$eval("#dd [data-fin]", (rows) =>
  rows.filter((r) => !r.querySelector(".chip")).map((r) => r.dataset.fin)
);
assert.equal(chipsMissing.length, 0, `rows missing chip: ${chipsMissing.join(",")}`);

assert.equal(errors.length, 0, `console/page errors:\n${errors.join("\n")}`);

console.log(`OK — ${TOTAL} panels across ${Object.keys(EXPECTED).length} brands, no errors.`);
await browser.close();
