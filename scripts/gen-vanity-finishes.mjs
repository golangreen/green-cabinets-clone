import { ALL_PANELS } from "../src/data/finishes/index.ts";
const brandKey = { "Tafisa":"tafisa","Shinnoki":"shinnoki","Egger":"egger","Wilsonart":"wilsonart","AGT":"agt","Raphael Stone":"raphael" };
const out = ALL_PANELS
  .filter(p => p.brand !== "Raphael Stone") // countertops handled by STONES
  .map(p => ({
    id: p.id,
    name: p.name,
    code: (p.codes && p.codes[0]) || "",
    brand: brandKey[p.brand],
    img: p.thumb || p.hiRes || "",
    c1: "#C9C2B6", c2: "#B6AE9F", grain: "#8F8675"
  }));
process.stdout.write(JSON.stringify(out, null, 2));
console.error("count:", out.length);
