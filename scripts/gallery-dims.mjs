// Writes src/data/galleryDims.json: { "<file name without extension>": [width, height] }
// for every photo in src/assets/gallery, so the gallery can reserve space (no CLS).
// Run after adding photos: node scripts/gallery-dims.mjs
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dir = "src/assets/gallery";
// sharp reads the camera's rotation tag (a phone photo stored sideways); sips does not
let sharp = null;
try { sharp = (await import(process.env.SHARP_PATH || "sharp")).default; } catch {}
const out = {};
for (const f of fs.readdirSync(dir).sort()) {
  if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
  let w, h;
  if (sharp) {
    const m = await sharp(path.join(dir, f)).metadata();
    w = m.autoOrient?.width ?? m.width;
    h = m.autoOrient?.height ?? m.height;
  } else {
    const txt = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", path.join(dir, f)], { encoding: "utf8" });
    w = Number(/pixelWidth: (\d+)/.exec(txt)?.[1]);
    h = Number(/pixelHeight: (\d+)/.exec(txt)?.[1]);
  }
  if (w && h) out[f.replace(/\.[^.]+$/, "")] = [w, h];
}
fs.writeFileSync("src/data/galleryDims.json", JSON.stringify(out, null, 0) + "\n");
console.log(Object.keys(out).length, "photos");
