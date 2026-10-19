#!/usr/bin/env node
/**
 * Makes the responsive AVIF/WebP copies of the gallery photos and the
 * homepage hero. Output is committed (public/img/opt/ + src/data/responsiveImages.json),
 * so the normal build and Lovable need no image tooling.
 *
 * Re-run after adding gallery photos:
 *   npm i --no-save sharp && node scripts/optimize-images.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "public/img/opt");
const MANIFEST = resolve(ROOT, "src/data/responsiveImages.json");
const WIDTHS = [480, 960];

let sharp;
try {
  sharp = (await import(process.env.SHARP_PATH || "sharp")).default;
} catch {
  console.error("sharp is not installed: run `npm i --no-save sharp` first.");
  process.exit(1);
}

// Every photo imported by the gallery data.
const galleryTs = readFileSync(resolve(ROOT, "src/data/galleryImages.ts"), "utf8");
const files = [...galleryTs.matchAll(/from "@\/assets\/gallery\/([^"]+)"/g)].map((m) => `src/assets/gallery/${m[1]}`);
const jobs = [...new Set(files)].map((f) => ({ file: f, widths: WIDTHS }));
jobs.push({ file: "public/hero-lcp.webp", widths: [640, 960, 1206] });

mkdirSync(OUT, { recursive: true });
const manifest = {};
for (const { file, widths } of jobs) {
  const name = basename(file, extname(file));
  const img = sharp(resolve(ROOT, file)).rotate();
  const meta = await img.metadata();
  const w0 = meta.autoOrient?.width ?? meta.width;
  const h0 = meta.autoOrient?.height ?? meta.height;
  const ws = [...new Set(widths.map((w) => Math.min(w, w0)))];
  for (const w of ws) {
    for (const [fmt, opts] of [["avif", { quality: 50, effort: 4 }], ["webp", { quality: 72 }]]) {
      const out = resolve(OUT, `${name}-${w}.${fmt}`);
      if (existsSync(out)) continue;
      await sharp(resolve(ROOT, file)).rotate().resize({ width: w, withoutEnlargement: true })[fmt](opts).toFile(out);
    }
  }
  manifest[name] = { w: w0, h: h0, widths: ws };
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0) + "\n");
console.log(`optimized ${jobs.length} images → public/img/opt`);
