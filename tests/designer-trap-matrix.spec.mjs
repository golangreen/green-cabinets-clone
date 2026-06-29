// Responsive screenshot matrix: for each viewport × trap, open the drawer
// (Look inside) and capture the canvas. Verifies the under-sink geometry
// stays in-frame and non-black at every resolution.
//
// Run: node tests/designer-trap-matrix.spec.mjs

import { chromium } from "playwright";
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const OUT = "/tmp/designer-trap-matrix";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "iphone-se",    w: 375,  h: 667  },
  { name: "iphone-14",    w: 390,  h: 844  },
  { name: "pixel-7",      w: 412,  h: 915  },
  { name: "ipad-mini",    w: 768,  h: 1024 },
  { name: "ipad-air",     w: 820,  h: 1180 },
  { name: "ipad-pro-11",  w: 1024, h: 1366 },
  { name: "laptop-13",    w: 1280, h: 800  },
  { name: "laptop-15",    w: 1440, h: 900  },
  { name: "desktop-fhd",  w: 1920, h: 1080 },
];
const TRAPS = ["ptrap", "strap", "bottle"];
const IGNORE = [/performance_metrics/i, /status of 401/i];
const keep = (m) => !IGNORE.some((re) => re.test(m));

function nonBlackPct(img) {
  const d = img.data;
  let nb = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 24) nb++;
  return nb / (d.length / 4);
}

const browser = await chromium.launch({ headless: true });
const rows = [];
const failures = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: Math.max(vp.h, 900) },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => keep(e.message) && errs.push(e.message));
  page.on("console", (m) => m.type() === "error" && keep(m.text()) && errs.push(m.text()));

  await page.goto("http://localhost:8080/designer", { waitUntil: "domcontentloaded" });
  await page
    .frameLocator('iframe[src*="vanity-designer.html"]')
    .locator("body")
    .first()
    .waitFor({ state: "visible", timeout: 15_000 });
  const f = page.frame({ url: /vanity-designer\.html/ });
  await f.waitForFunction(() => !!document.querySelector('[data-og="trap"]'), null, { timeout: 5_000 });

  const canvas = f.locator("canvas").first();
  const iframeEl = await page.locator('iframe[src*="vanity-designer.html"]').elementHandle();

  for (const trap of TRAPS) {
    const chip = f.locator(`[data-og="trap"][data-ov="${trap}"]`);
    await chip.click();
    await page.waitForTimeout(500);
    const isOn = await chip.evaluate((el) => el.classList.contains("on"));
    if (!isOn) { failures.push(`${vp.name}/${trap}: chip not active`); continue; }

    // Open drawer
    await f.locator("#animBtn").click();
    await page.waitForTimeout(1300);

    await canvas.scrollIntoViewIfNeeded();
    const ib = await iframeEl.boundingBox();
    const lb = await canvas.boundingBox();
    const pvp = page.viewportSize();
    const x = Math.max(0, ib.x + lb.x);
    const y = Math.max(0, ib.y + lb.y);
    const clip = {
      x, y,
      width: Math.min(lb.width, pvp.width - x),
      height: Math.min(lb.height, pvp.height - y),
    };
    const file = `${OUT}/${vp.name}_${trap}.png`;
    const buf = await page.screenshot({ clip });
    writeFileSync(file, buf);
    const img = PNG.sync.read(buf);
    const fill = nonBlackPct(img);
    const aspect = clip.width / clip.height;

    rows.push({
      viewport: `${vp.name} ${vp.w}×${vp.h}`,
      trap,
      canvas: `${Math.round(clip.width)}×${Math.round(clip.height)}`,
      aspect: aspect.toFixed(2),
      fill: `${(fill * 100).toFixed(1)}%`,
    });

    if (fill < 0.5) failures.push(`${vp.name}/${trap}: low fill ${(fill * 100).toFixed(1)}%`);
    if (clip.width < 240 || clip.height < 240) failures.push(`${vp.name}/${trap}: canvas too small ${clip.width}×${clip.height}`);

    // Close before next iteration so each open dolly is identical
    await f.locator("#animBtn").click();
    await page.waitForTimeout(900);
  }

  if (errs.length) failures.push(`${vp.name}: ${errs.join(" | ")}`);
  await ctx.close();
}

await browser.close();
console.table(rows);
if (failures.length) {
  console.error("FAIL:\n" + failures.join("\n"));
  process.exit(1);
}
console.log(`OK — ${rows.length} screenshots across ${VIEWPORTS.length} viewports × ${TRAPS.length} traps.`);
console.log(`Artifacts: ${OUT}/`);
