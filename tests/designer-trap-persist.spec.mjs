// Verifies the selected trap (P/S/Bottle) survives a full reload via
// localStorage AND a fresh tab opened from the URL with ?s=... (URL share).
import { chromium } from "playwright";
import { strict as assert } from "node:assert";

const TRAPS = ["strap", "bottle", "ptrap"];
const browser = await chromium.launch({ headless: true });

async function getFrame(page) {
  await page.goto(page.url().includes("/designer") ? page.url() : "http://localhost:8080/designer",
    { waitUntil: "domcontentloaded" });
  await page.frameLocator('iframe[src*="vanity-designer.html"]').locator("body").first()
    .waitFor({ state: "visible", timeout: 15_000 });
  const f = page.frame({ url: /vanity-designer\.html/ });
  await f.waitForFunction(() => !!document.querySelector('[data-og="trap"]'), null, { timeout: 5_000 });
  return f;
}

async function activeTrap(f) {
  return f.evaluate(() => {
    const on = document.querySelector('[data-og="trap"].on');
    return on ? on.dataset.ov : null;
  });
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
const page = await ctx.newPage();

for (const trap of TRAPS) {
  // Land fresh on /designer (no query). Pick trap.
  await page.goto("http://localhost:8080/designer", { waitUntil: "domcontentloaded" });
  let f = await getFrame(page);
  await f.locator(`[data-og="trap"][data-ov="${trap}"]`).click();
  await page.waitForTimeout(250); // debounce save (120ms)
  assert.equal(await activeTrap(f), trap, `${trap}: chip didn't activate`);

  // Capture both persistence signals (URL lives on the iframe, same-origin)
  const ifrUrl = await page.evaluate(() => {
    const fr = document.querySelector('iframe[src*="vanity-designer.html"]');
    return fr.contentWindow.location.href;
  });
  const ls = await page.evaluate(() => {
    const fr = document.querySelector('iframe[src*="vanity-designer.html"]');
    return fr.contentWindow.localStorage.getItem("gc.designer.state.v1");
  });
  assert(/\?s=/.test(ifrUrl), `${trap}: iframe URL didn't get ?s= (${ifrUrl})`);
  assert(ls && JSON.parse(ls).trap === trap, `${trap}: localStorage missing/wrong`);

  // 1. Reload — localStorage path
  await page.reload({ waitUntil: "domcontentloaded" });
  f = await getFrame(page);
  assert.equal(await activeTrap(f), trap, `${trap}: lost after reload (localStorage)`);

  // 2. Fresh context — URL share path (no localStorage). Load the iframe URL
  //    directly; it's a same-origin static asset and self-hydrates from ?s=.
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page2 = await ctx2.newPage();
  await page2.goto(ifrUrl, { waitUntil: "domcontentloaded" });
  await page2.waitForFunction(() => !!document.querySelector('[data-og="trap"].on'), null, { timeout: 5_000 });
  const trapInShare = await page2.evaluate(() => document.querySelector('[data-og="trap"].on')?.dataset.ov);
  assert.equal(trapInShare, trap, `${trap}: lost via URL share`);
  await ctx2.close();

  // Clear localStorage between traps so each test starts clean
  await page.evaluate(() => {
    const fr = document.querySelector('iframe[src*="vanity-designer.html"]');
    fr.contentWindow.localStorage.removeItem("gc.designer.state.v1");
  });
  console.log(`OK  ${trap.padEnd(7)}  reload+URL share preserved`);
}

await browser.close();
console.log("All 3 traps persist across reload and URL share.");
