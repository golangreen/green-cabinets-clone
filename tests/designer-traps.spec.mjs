// Playwright: switch P-trap → S-trap → Bottle trap inside the vanity-designer
// iframe and capture before/after canvas screenshots. Verifies geometry swaps
// produce a visibly different render, the WebGL canvas stays non-blank (no
// clipping/black-frame), and no console / page errors fire.
//
// Run: node tests/designer-traps.spec.mjs
// Requires dev server at http://localhost:8080 and Pixelmatch for diffing.

import { chromium } from "playwright";
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const OUT = "/tmp/designer-traps";
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
assert(f, "vanity-designer iframe not found");

// Ensure a sink exists so the trap chip group is rendered.
await f.waitForFunction(() => !!document.querySelector('[data-og="trap"]'), null, {
  timeout: 5_000,
});

// Open the bottom drawer so the plumbing block is visible in the capture.
// (the designer animates drawer-open via the "Look inside" button)
const peek = f.locator('button:has-text("Look inside")').first();
if (await peek.count()) {
  await peek.click().catch(() => {});
  await page.waitForTimeout(900); // ease-in dolly
}

const canvas = f.locator("canvas").first();
await canvas.waitFor({ state: "visible", timeout: 5_000 });

async function shot(name) {
  const buf = await canvas.screenshot();
  writeFileSync(`${OUT}/${name}.png`, buf);
  return PNG.sync.read(buf);
}

async function selectTrap(id) {
  await f.locator(`[data-og="trap"][data-ov="${id}"]`).click();
  // wait for re-render + material settle
  await page.waitForTimeout(700);
}

function diffPct(a, b) {
  const { width, height } = a;
  if (b.width !== width || b.height !== height) return 1;
  const out = new PNG({ width, height });
  const px = pixelmatch(a.data, b.data, out.data, width, height, { threshold: 0.1 });
  return px / (width * height);
}

function nonBlackPct(img) {
  const d = img.data;
  let nb = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] + d[i + 1] + d[i + 2] > 24) nb++;
  }
  return nb / (d.length / 4);
}

// Baseline: P-trap
await selectTrap("ptrap");
const shots = { ptrap: await shot("ptrap") };

for (const t of TRAPS.slice(1)) {
  await selectTrap(t);
  shots[t] = await shot(t);
}

// Re-select P-trap to confirm the swap is reversible / not cumulative.
await selectTrap("ptrap");
shots.ptrap2 = await shot("ptrap2");

// 1. Every render must be substantially non-black (no clipping / lost frame)
for (const [k, img] of Object.entries(shots)) {
  const fill = nonBlackPct(img);
  assert(fill > 0.6, `${k}: canvas mostly black (${(fill * 100).toFixed(1)}%)`);
}

// 2. Each trap variant must visibly differ from the others
const d_ps = diffPct(shots.ptrap, shots.strap);
const d_pb = diffPct(shots.ptrap, shots.bottle);
const d_sb = diffPct(shots.strap, shots.bottle);
console.log(`diff P↔S=${(d_ps * 100).toFixed(2)}%  P↔B=${(d_pb * 100).toFixed(2)}%  S↔B=${(d_sb * 100).toFixed(2)}%`);
assert(d_ps > 0.002, `P-trap vs S-trap render not distinct (${d_ps})`);
assert(d_pb > 0.002, `P-trap vs Bottle render not distinct (${d_pb})`);
assert(d_sb > 0.002, `S-trap vs Bottle render not distinct (${d_sb})`);

// 3. Re-selecting P-trap returns to (near) the baseline frame
const d_reset = diffPct(shots.ptrap, shots.ptrap2);
assert(d_reset < 0.02, `P-trap not reversible: ${(d_reset * 100).toFixed(2)}% drift`);

assert.equal(errors.length, 0, `errors:\n${errors.join("\n")}`);

console.log(`OK — traps swap cleanly, screenshots in ${OUT}/`);
await browser.close();
