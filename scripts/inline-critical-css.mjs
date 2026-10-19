/**
 * Post-build step (after scripts/prerender.mjs): for every pre-rendered page in
 * dist/, inline the CSS rules that page's static HTML actually uses and load
 * the full stylesheet without blocking the first paint. Removes the
 * render-blocking CSS request from the critical path (Lighthouse
 * "render-blocking resources"), which was the main LCP render delay on mobile.
 *
 * Beasties keeps every rule that matches any element in the page (not only
 * above the fold), so pre-rendered content does not shift when the full
 * stylesheet arrives. A <noscript> fallback keeps the stylesheet for no-JS
 * visitors. Never fails the build: on any error the page keeps its normal
 * blocking stylesheet.
 */
import Beasties from "beasties";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "assets" || name === "img" || name === "fonts") continue;
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith(".html") && name !== "vanity-designer.html") out.push(p);
  }
  return out;
}

const beasties = new Beasties({
  path: DIST,
  publicPath: "/",
  preload: "media",
  noscriptFallback: true,
  inlineFonts: false,
  pruneSource: false,
  reduceInlineStyles: false,
  mergeStylesheets: true,
  logLevel: "silent",
});

let ok = 0, skipped = 0, inlinedBytes = 0;
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  if (!html.includes('rel="stylesheet"')) { skipped++; continue; }
  try {
    const out = await beasties.process(html);
    writeFileSync(file, out);
    inlinedBytes += out.length - html.length;
    ok++;
  } catch (e) {
    skipped++;
    console.warn(`[critical-css] kept blocking CSS for ${file}: ${e?.message || e}`);
  }
}
console.log(`[critical-css] inlined critical CSS in ${ok} pages (${skipped} skipped), avg +${ok ? Math.round(inlinedBytes / ok / 1024) : 0} KB HTML`);
