// Playwright: with the drawer OPEN, cycle P-trap → S-trap → Bottle → P-trap and
// verify the under-sink cavity never clips (canvas stays in-bounds) or turns
// black (mean luminance above floor, non-trivial pixel variance).
//
// Run: node tests/designer-trap-switch-open.spec.mjs

import { chromium } from "playwright";
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import path from "node:path";

const OUT = "/tmp/designer-trap-switch-open";
mkdirSync(OUT, { recursive: true });

const TRAPS = ["ptrap", "strap", "bottle", "ptrap"];
const IGNORE = [/performance_metrics/i, /status of 401/i];
const keep = (m) => !IGNORE.some((re) => re.test(m));

function analyze(buf) {
  const png = PNG.sync.read(buf);
  const { data, width, height } = png;
  let sum = 0, sumSq = 0, n = 0, dark = 0;
  for (let i = 0; i < data.length; i += 4) {
    const y = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sum += y; sumSq += y * y; n++;
    if (y < 8) dark++;
  }
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  return { width, height, mean, variance, darkRatio: dark / n };
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && keep(m.text()) && errors.push(m.text()));

await page.goto("http://localhost:8080/designer", { waitUntil: "domcontentloaded" });

const iframeEl = await page.waitForSelector('iframe[src*="vanity-designer"]', { timeout: 15000 });
const frame = await iframeEl.contentFrame();
await frame.waitForSelector("canvas", { state: "visible", timeout: 15000 });

// Ensure we're on the vanity (sinks default to "sink1" → trap chips render)
const vanityTab = await frame.$('button:has-text("Vanity")');
if (vanityTab) await vanityTab.click().catch(() => {});
await page.waitForTimeout(200);

// Open the drawer to fully expose the cavity + plumbing
const openBtn =
  (await frame.$('button:has-text("Look inside")')) ||
  (await frame.$('button:has-text("look inside")'));
assert.ok(openBtn, "Look-inside button not found");
await openBtn.click();
await page.waitForTimeout(800); // camera dolly + drawer ease

const canvas = await frame.$("canvas");
const baseBox = await canvas.boundingBox();
assert.ok(baseBox && baseBox.width > 100 && baseBox.height > 100, "canvas must be laid out");

const results = [];
for (const t of TRAPS) {
  const chip = await frame.$(`[data-og="trap"][data-ov="${t}"]`);
  assert.ok(chip, `trap chip [data-trap="${t}"] not found`);
  await chip.click();
  await page.waitForTimeout(400);

  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const box = await canvas.boundingBox();
  // No clipping: canvas keeps a real footprint after scrolling into view
  assert.ok(box && box.width > 100 && box.height > 100,
    `${t}: canvas collapsed (${box?.width}x${box?.height})`);
  assert.ok(box.y + box.height > 0 && box.x + box.width > 0,
    `${t}: canvas off-viewport (${box.x},${box.y})`);

  const file = path.join(OUT, `open_${t}_${Date.now()}.png`);
  const shot = await canvas.screenshot({ path: file });
  const a = analyze(shot);
  results.push({ trap: t, ...a, file });

  // Never black / never flat
  assert.ok(a.mean > 18, `${t}: frame too dark (mean=${a.mean.toFixed(2)})`);
  assert.ok(a.darkRatio < 0.85, `${t}: too many black pixels (${(a.darkRatio * 100).toFixed(1)}%)`);
  assert.ok(a.variance > 50, `${t}: frame too flat (var=${a.variance.toFixed(2)})`);
}

writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ results, errors }, null, 2));
assert.equal(errors.length, 0, "console/page errors:\n" + errors.join("\n"));

await browser.close();
console.log("OK", results.map(r => `${r.trap}:mean=${r.mean.toFixed(1)},var=${r.variance.toFixed(0)},dark=${(r.darkRatio*100).toFixed(1)}%`).join(" | "));
