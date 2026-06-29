// Playwright: with the drawer OPEN, cycle P-trap → S-trap → Bottle → P-trap and
// verify the under-sink cavity never clips (canvas stays in-bounds) or turns black
// (mean luminance above floor, non-trivial pixel variance).
import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";
import fs from "node:fs";
import path from "node:path";

const OUT = "/tmp/designer-trap-switch-open";
fs.mkdirSync(OUT, { recursive: true });

const TRAPS = ["ptrap", "strap", "bottle"];

function analyze(buf) {
  const png = PNG.sync.read(buf);
  const { data, width, height } = png;
  let sum = 0, sumSq = 0, n = 0, dark = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    const y = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    sum += y; sumSq += y * y; n++;
    if (y < 8) dark++;
  }
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  return { width, height, mean, variance, darkRatio: dark / n };
}

test("drawer-open trap switching keeps cavity visible and unclipped", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.setViewportSize({ width: 1280, height: 1800 });
  await page.goto("http://localhost:8080/designer", { waitUntil: "domcontentloaded" });

  const frame = page.frameLocator('iframe[src*="vanity-designer"]');
  await frame.locator("canvas").first().waitFor({ state: "visible", timeout: 15000 });

  // Ensure a sink is active so traps render
  const sinkChip = frame.locator('[data-sinks]').first();
  if (await sinkChip.count()) await sinkChip.click().catch(() => {});

  // Open the drawer
  const lookInside = frame.getByRole("button", { name: /look inside/i });
  await lookInside.click();
  await page.waitForTimeout(700); // camera dolly ease

  const canvas = frame.locator("canvas").first();
  const box0 = await canvas.boundingBox();
  expect(box0, "canvas must be laid out").toBeTruthy();

  const results = [];
  for (const t of [...TRAPS, "ptrap"]) {
    const chip = frame.locator(`[data-trap="${t}"]`);
    await chip.click();
    await page.waitForTimeout(350);

    const box = await canvas.boundingBox();
    // No clipping: canvas stays inside viewport and keeps non-zero footprint
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.y).toBeGreaterThanOrEqual(-1);

    const file = path.join(OUT, `open_${t}_${Date.now()}.png`);
    const shot = await canvas.screenshot({ path: file });
    const a = analyze(shot);
    results.push({ trap: t, ...a, file });

    // Never black, never flat
    expect(a.mean, `${t} mean luminance`).toBeGreaterThan(18);
    expect(a.darkRatio, `${t} dark-pixel ratio`).toBeLessThan(0.85);
    expect(a.variance, `${t} variance`).toBeGreaterThan(50);
  }

  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ results, errors }, null, 2));
  expect(errors, errors.join("\n")).toEqual([]);
});
