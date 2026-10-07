// Writes src/data/galleryDims.json: { "<file name without extension>": [width, height] }
// for every photo in src/assets/gallery, so the gallery can reserve space (no CLS).
// Run after adding photos: node scripts/gallery-dims.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dir = "src/assets/gallery";
const out = {};
for (const f of fs.readdirSync(dir).sort()) {
  if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
  const txt = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", path.join(dir, f)], { encoding: "utf8" });
  const w = Number(/pixelWidth: (\d+)/.exec(txt)?.[1]);
  const h = Number(/pixelHeight: (\d+)/.exec(txt)?.[1]);
  if (w && h) out[f.replace(/\.[^.]+$/, "")] = [w, h];
}
fs.writeFileSync("src/data/galleryDims.json", JSON.stringify(out, null, 0) + "\n");
console.log(Object.keys(out).length, "photos");
