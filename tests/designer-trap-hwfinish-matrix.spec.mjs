// Playwright: matrix-verify open-vs-closed rendering for every plumbing trap
// (P-trap / S-trap / Bottle trap) under every hardware finish (chrome, nickel,
// brass, matte black). Asserts each frame stays non-black + non-flat (no shader
// blowups from finish↔trap material swaps), open differs from closed (drawer
// dolly + slide fired), and re-closing returns near the baseline.
//
// Run: node tests/designer-trap-hwfinish-matrix.spec.mjs

import { chromium } from "playwright";
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import path from "node:path";

const OUT = "/tmp/designer-trap-hwfinish-matrix";
mkdirSync(OUT, { recursive: true });

const TRAPS = ["ptrap", "strap", "bottle"];
const FINISHES = ["chrome", "nickel", "brass", "black"];
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
  return { width, height, mean, variance: sumSq / n - mean * mean, darkRatio: dark / n, png };
}

function diffPct(a, b) {
  if (a.width !== b.width || a.height !== b.height) return 1;
  const out = new PNG({ width: a.width, height: a.height });
  const px = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0.18 });
  return px / (a.width * a.height);
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

// Enable hardware so the hwfinish chips render
const pickChip = async (group, id) => {
  const c = await frame.$(`[data-og="${group}"][data-ov="${id}"]`);
  assert.ok(c, `chip [data-og="${group}"][data-ov="${id}"] missing`);
  await c.click();
  await page.waitForTimeout(280);
};
await pickChip("hardware", "bar"); // any non-"none" so hwfinish appears

const canvas = await frame.$("canvas");
const lookInside = await frame.$('button:has-text("Look inside")');
assert.ok(lookInside, "Look-inside button not found");

const cap = async (label) => {
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(220);
  const file = path.join(OUT, `${label}.png`);
  const buf = await canvas.screenshot({ path: file });
  const a = analyze(buf);
  return { ...a, file };
};

const rows = [];
for (const hw of FINISHES) {
  await pickChip("hwfinish", hw);
  for (const t of TRAPS) {
    await pickChip("trap", t);

    // closed baseline
    const closed = await cap(`${hw}_${t}_closed`);
    // open
    await lookInside.click();
    await page.waitForTimeout(800);
    const open = await cap(`${hw}_${t}_open`);
    // close again
    await lookInside.click();
    await page.waitForTimeout(700);
    const reclosed = await cap(`${hw}_${t}_reclosed`);

    const dOpen = diffPct(closed.png, open.png);
    const dReset = diffPct(closed.png, reclosed.png);

    // Material/shader sanity per state
    for (const [state, s] of [["closed", closed], ["open", open], ["reclosed", reclosed]]) {
      assert.ok(s.mean > 18, `${hw}/${t}/${state}: too dark (mean=${s.mean.toFixed(2)})`);
      assert.ok(s.darkRatio < 0.85, `${hw}/${t}/${state}: too many black pixels (${(s.darkRatio*100).toFixed(1)}%)`);
      assert.ok(s.variance > 50, `${hw}/${t}/${state}: too flat (var=${s.variance.toFixed(2)})`);
    }
    // Open must differ from closed; reclose must converge back
    assert.ok(dOpen > 0.003, `${hw}/${t}: open frame didn't move enough (${(dOpen*100).toFixed(3)}%)`);
    assert.ok(dReset < dOpen,  `${hw}/${t}: reclose drift ${(dReset*100).toFixed(3)}% >= open ${(dOpen*100).toFixed(3)}%`);

    rows.push({
      hw, trap: t,
      dOpenPct: +(dOpen * 100).toFixed(3),
      dResetPct: +(dReset * 100).toFixed(3),
      closedMean: +closed.mean.toFixed(1),
      openMean: +open.mean.toFixed(1),
      closedVar: +closed.variance.toFixed(0),
      openVar: +open.variance.toFixed(0),
    });
  }
}

writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ rows, errors }, null, 2));
assert.equal(errors.length, 0, "console/page errors:\n" + errors.join("\n"));

await browser.close();
console.table(rows);
console.log("OK", rows.length, "combos →", OUT);
