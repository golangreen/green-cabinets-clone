/**
 * Curated AGT decor selection — panels we stock or specify on real installs,
 * pulled from the AGT panel collection (Supramat / 3P Premium PET / Trendy).
 *
 * Why curated, not scraped: AGT's catalog is JS-rendered behind a private
 * API and rehosting hundreds of brand swatches is a rights gray area. We
 * surface the real product code, an approximate color swatch, and link out
 * to the official AGT page so the live photo is always one click away.
 *
 * Source: https://www.agtwood.com/products/panel/panel
 */
import type { MaterialPanel } from "@/types/materials";

export const AGT_CATALOG_URL = "https://www.agtwood.com/products/panel/panel";

const a = (
  code: string,
  name: string,
  category: string,
  finish: string,
  swatchHex: string,
  detailUrl: string,
): MaterialPanel => ({
  id: `agt-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  brand: "AGT",
  slug: `${code.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name,
  codes: [`AGT ${code}`],
  category,
  finish,
  thumb: "",
  hiRes: "",
  swatchHex,
  detailUrl,
});

export const AGT_PANELS: MaterialPanel[] = [
  // ── Real install reference ────────────────────────────────────────────
  {
    id: "agt-647-antique-white",
    brand: "AGT",
    slug: "647-antique-white",
    name: "Antique White",
    codes: ["AGT 647"],
    category: "White",
    finish: "Soft Matte",
    thumb: "",
    hiRes: "",
    swatchHex: "#EFEAE0",
    detailUrl: "https://www.agtwood.com/products/panel/panel",
  },
  // ── Supramat (Soft Matte Lacquer) ─────────────────────────────────────
  a("3019", "Sahara Cream", "White", "Supramat (Soft Matte)", "#EFEAE0", "https://www.agtwood.com/products/panel/panel/supramat-panel/sahara-cream"),
  a("3091", "Sky Blue", "Blue", "Supramat (Soft Matte)", "#A8C8DD", "https://www.agtwood.com/products/panel/panel/supramat-panel/sky-blue"),
  a("3092", "Tobac", "Brown", "Supramat (Soft Matte)", "#5A3E2A", "https://www.agtwood.com/products/panel/panel/supramat-panel/tobac"),
  a("3093", "Linden", "Wood", "Supramat (Soft Matte)", "#B89970", "https://www.agtwood.com/products/panel/panel/supramat-panel/linden"),
  a("3094", "Sonara", "Wood", "Supramat (Soft Matte)", "#B89970", "https://www.agtwood.com/products/panel/panel/supramat-panel/sonara"),
  a("3095", "Victoria Grey", "Grey", "Supramat (Soft Matte)", "#8C8A85", "https://www.agtwood.com/products/panel/panel/supramat-panel/victoria-grey"),
  a("3096", "Havana Coffee", "Brown", "Supramat (Soft Matte)", "#5A3E2A", "https://www.agtwood.com/products/panel/panel/supramat-panel/havana-coffee"),
  a("3097", "Olive Green", "Green", "Supramat (Soft Matte)", "#7E834A", "https://www.agtwood.com/products/panel/panel/supramat-panel/olive-green"),
  a("3114", "Sakura Pink", "Pink", "Supramat (Soft Matte)", "#E8C4CC", "https://www.agtwood.com/products/panel/panel/supramat-panel/pink-daisy"),
  // ── 3P Premium PET (High Gloss) ───────────────────────────────────────
  a("3049", "Deep Blue", "Blue", "3P Premium PET (High Gloss)", "#3E5C7C", "https://www.agtwood.com/products/panel/panel/3p-panel/deep-blue"),
  a("3050", "Leaf Green", "Green", "3P Premium PET (High Gloss)", "#5C7650", "https://www.agtwood.com/products/panel/panel/3p-panel/leaf-green"),
  a("3051", "Caretta Green", "Green", "3P Premium PET (High Gloss)", "#5C7650", "https://www.agtwood.com/products/panel/panel/3p-panel/caretta-green"),
  a("3056", "Slate Cream", "White", "3P Premium PET (High Gloss)", "#F1ECE2", "https://www.agtwood.com/products/panel/panel/3p-panel/slate-cream"),
  a("3057", "Slate Grey", "Grey", "3P Premium PET (High Gloss)", "#8C8A85", "https://www.agtwood.com/products/panel/panel/3p-panel/slate-gray"),
  a("3058", "Slate Coffee", "Brown", "3P Premium PET (High Gloss)", "#7E7C77", "https://www.agtwood.com/products/panel/panel/3p-panel/slate-coffee"),
  a("3062", "Croco Blue", "Blue", "3P Premium PET (High Gloss)", "#3E5C7C", "https://www.agtwood.com/products/panel/panel/3p-panel/croco-blue"),
  a("3066", "Limba Light Grey", "Grey", "3P Premium PET (High Gloss)", "#8C8A85", "https://www.agtwood.com/products/panel/panel/3p-panel/limba-light-grey"),
  a("3069", "Slate Beige", "Stone", "3P Premium PET (High Gloss)", "#7E7C77", "https://www.agtwood.com/products/panel/panel/3p-panel/slate-beige"),
  // ── Trendy (Mixed Woodgrain / Solid / Stone) ──────────────────────────
  a("3103", "Linea Brown", "Brown", "Trendy", "#6A4A30", "https://www.agtwood.com/products/panel/panel/trendy-panel/linea-brown"),
  a("3105", "Mint Green", "Green", "Trendy", "#A8B89A", "https://www.agtwood.com/products/panel/panel/trendy-panel/mint-green"),
  a("3111", "Orbit Inox", "Grey", "Trendy", "#A8A9AB", "https://www.agtwood.com/products/panel/panel/trendy-panel/orbit-inox"),
  a("3112", "Luna Inox", "Grey", "Trendy", "#A8A9AB", "https://www.agtwood.com/products/panel/panel/trendy-panel/luna-inox"),
];
