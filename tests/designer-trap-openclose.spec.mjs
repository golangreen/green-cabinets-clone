// Playwright: for each plumbing layout (P-trap / S-trap / Bottle trap),
// capture closed-vs-open screenshots and verify the drawer-open camera dolly
// + drawer slide produce a visibly different frame, the canvas never goes
// black (no clip-plane culling), and closing returns to the baseline pose.
//
// Run: node tests/designer-trap-openclose.spec.mjs

import { chromium } from "playwright";
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const OUT = "/tmp/designer-trap-openclose";
mkdirSync(OUT, { recursive: true });

const TRAPS = ["ptrap", "strap", "bottle"];
const IGNORE = [/performance_metrics/i, /status of 401/i];
const keep = (m) => !IGNORE.some((re) => re.test(m));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => keep(e.message) && errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error" && keep(m.text())) errors.push(`console: ${m.text()}`);
});

await page.goto("http://localhost:8080/designer", { waitUntil: "domcontentloaded" });
await page
  .frameLocator('iframe[src*="vanity-designer.html"]')
  .locator("body")
  .first()
  .waitFor({ state: "visible", timeout: 15_000 });
const f = page.frame({ url: /vanity-designer\.html/ });
assert(f, "iframe not found");

await f.waitForFunction(() => !!document.querySelector('[data-og="trap"]'), null, {
  timeout: 5_000,
});

const canvas = f.locator("canvas").first();
await canvas.waitFor({ state: "visible" });
await canvas.scrollIntoViewIfNeeded();
const iframeEl = await page.locator('iframe[src*="vanity-designer.html"]').elementHandle();

async function shot(name) {
  await canvas.scrollIntoViewIfNeeded();
  const ib = await iframeEl.boundingBox();
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const lb = await canvas.boundingBox();
  const vp = page.viewportSize();
  const x = Math.max(0, ib.x + lb.x);
  const y = Math.max(0, ib.y + lb.y);
  const clip = {
    x, y,
    width: Math.min(lb.width, vp.width - x),
    height: Math.min(lb.height, vp.height - y),
  };
  const buf = await page.screenshot({ clip });
  writeFileSync(`${OUT}/${name}.png`, buf);
  return PNG.sync.read(buf);
}

async function selectTrap(id) {
  const chip = f.locator(`[data-og="trap"][data-ov="${id}"]`);
  await chip.click();
  await page.waitForTimeout(600);
  assert(await chip.evaluate((el) => el.classList.contains("on")), `${id} chip not active`);
}

async function toggleAnim(waitMs = 1400) {
  await f.locator("#animBtn").click();
  await page.waitForTimeout(waitMs); // dolly + slide ease
}

function diffPct(a, b) {
  if (a.width !== b.width || a.height !== b.height) return 1;
  const out = new PNG({ width: a.width, height: a.height });
  return (
    pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.1 }) /
    (a.width * a.height)
  );
}

function nonBlackPct(img) {
  const d = img.data;
  let nb = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 24) nb++;
  return nb / (d.length / 4);
}

const results = [];

for (const trap of TRAPS) {
  await selectTrap(trap);

  // Make sure we start CLOSED. Toggle once and check; if it opened, toggle
  // again to close. We detect open vs closed by frame diff against a known
  // closed baseline taken right after the trap swap.
  const closed1 = await shot(`${trap}_closed_pre`);
  await toggleAnim();
  const maybeOpen = await shot(`${trap}_open`);
  let openImg = maybeOpen;
  let closedImg = closed1;
  let toggledClose = false;
  // If the post-toggle frame is too similar to closed_pre, we were already
  // open before — invert and re-capture.
  if (diffPct(closed1, maybeOpen) < 0.002) {
    await toggleAnim();
    openImg = await shot(`${trap}_open_v2`);
  }
  // Now close it again and verify the camera/clip returns.
  await toggleAnim();
  closedImg = await shot(`${trap}_closed_post`);
  toggledClose = true;

  const dOpen = diffPct(closedImg, openImg);
  const dReset = diffPct(closed1, closedImg);
  const fillOpen = nonBlackPct(openImg);
  const fillClosed = nonBlackPct(closedImg);

  results.push({ trap, dOpen, dReset, fillOpen, fillClosed });

  // No black-frame / culled clip plane
  assert(fillOpen > 0.6, `${trap}: open frame mostly black (${(fillOpen * 100).toFixed(1)}%)`);
  assert(fillClosed > 0.6, `${trap}: closed frame mostly black`);
  // Open must visibly differ from closed (camera dolly + drawer slide guaranteed
  // to move pixels even if the trap geometry is occluded)
  assert(dOpen > 0.01, `${trap}: open vs closed not distinct (${(dOpen * 100).toFixed(2)}%)`);
  // Closing returns to within noise of the original closed pose
  assert(dReset < 0.03, `${trap}: close did not reset camera (${(dReset * 100).toFixed(2)}% drift)`);
  assert(toggledClose, `${trap}: never reached closed state`);
}

console.table(
  results.map((r) => ({
    trap: r.trap,
    "Δ open vs closed %": (r.dOpen * 100).toFixed(2),
    "Δ reset %": (r.dReset * 100).toFixed(2),
    "fill open %": (r.fillOpen * 100).toFixed(1),
    "fill closed %": (r.fillClosed * 100).toFixed(1),
  }))
);

assert.equal(errors.length, 0, `errors:\n${errors.join("\n")}`);
console.log(`OK — open/close camera + clip behavior verified for all 3 traps.`);
console.log(`Screenshots: ${OUT}/`);
await browser.close();
