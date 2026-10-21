// Copies the website's supplier panels (src/data/finishes) into the app as
// Resources/panels.json, so the app and greencabinetsny.com list the same
// decors. Run from the repo root: node ios-native/scripts/export-panels.mjs
import { build } from "esbuild";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const out = join(mkdtempSync(join(tmpdir(), "panels-")), "panels.mjs");
await build({ entryPoints: ["src/data/finishes/index.ts"], bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "warning" });
const { ALL_PANELS } = await import(out);

const entities = { "&amp;": "&", "&#039;": "'", "&apos;": "'", "&quot;": '"', "&lt;": "<", "&gt;": ">", "&nbsp;": " " };
const clean = (s) => (s || "").replace(/&[a-z0-9#]+;/gi, (m) => entities[m.toLowerCase()] ?? m).replace(/\s*[—–]\s*/g, ", ").trim();
const panels = ALL_PANELS.map((p) => ({
  id: p.id,
  brand: p.brand,
  name: clean(p.name),
  codes: (p.codes || []).map(clean),
  category: clean(p.category),
  finish: clean(p.finish),
  thumb: p.thumb || "",
  hiRes: p.hiRes || "",
  hex: p.swatchHex && p.swatchHex.startsWith("#") ? p.swatchHex : "",
  link: p.detailUrl || "",
}));
writeFileSync("ios-native/GreenCabinets/Resources/panels.json", JSON.stringify(panels));
const by = panels.reduce((m, p) => ((m[p.brand] = (m[p.brand] || 0) + 1), m), {});
console.log(panels.length, "panels", by);
