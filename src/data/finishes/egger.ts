/**
 * Curated Egger decor selection — the most popular kitchen-relevant SKUs from
 * the Egger US/CA Furniture & Interior Design collection.
 *
 * Why curated, not scraped: Egger's catalog is JS-rendered behind a private
 * API and rehosting hundreds of brand swatches is a rights gray area. We
 * surface the real product code, an approximate color swatch, and link out
 * to the official Egger page so the live photo is always one click away.
 *
 * Source: https://www.egger.com/en/furniture-interior-design/?country=US
 */
import type { MaterialPanel } from "@/types/materials";

export const EGGER_CATALOG_URL =
  "https://www.egger.com/en/furniture-interior-design/?country=US";

const e = (
  code: string,
  name: string,
  category: string,
  finish: string,
  swatchHex: string,
): MaterialPanel => ({
  id: `egger-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  brand: "Egger",
  slug: code.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  codes: [code],
  category,
  finish,
  thumb: "",
  hiRes: "",
  swatchHex,
  detailUrl: `https://www.egger.com/en/furniture-interior-design/decors/${code.replace(/\s+/g, "_")}?country=US`,
});

export const EGGER_PANELS: MaterialPanel[] = [
  // ── Whites & Off-Whites ────────────────────────────────────────────────
  e("W1000 ST9", "Premium White", "White", "Smoothtouch Matt", "#F4F2EE"),
  e("W1100 ST9", "Alpine White", "White", "Smoothtouch Matt", "#EFECE6"),
  e("W980 ST2", "Platinum White", "White", "Satin", "#E8E5DE"),
  e("U104 ST9", "Soft White", "White", "Smoothtouch Matt", "#EAE7DF"),
  // ── Greys ──────────────────────────────────────────────────────────────
  e("U727 ST9", "Dust Grey", "Grey", "Smoothtouch Matt", "#A6A39C"),
  e("U732 ST9", "Stone Grey", "Grey", "Smoothtouch Matt", "#7E7C77"),
  e("U961 ST2", "Graphite Grey", "Grey", "Satin", "#3E3F41"),
  e("U899 ST9", "Soft Black", "Black", "Smoothtouch Matt", "#262625"),
  // ── Beiges & Sands ─────────────────────────────────────────────────────
  e("U156 ST9", "Cashmere Grey", "Beige", "Smoothtouch Matt", "#BDB29E"),
  e("U702 ST9", "Cubanit Grey", "Beige", "Smoothtouch Matt", "#A99F8E"),
  // ── Light Woods ────────────────────────────────────────────────────────
  e("H1180 ST37", "White Bardolino Oak", "Oak", "Wood Pore", "#D6C8B0"),
  e("H3331 ST10", "Natural Davos Oak", "Oak", "Sand", "#C9B393"),
  e("H1334 ST9", "Sand Gladstone Oak", "Oak", "Smoothtouch Matt", "#C2A782"),
  e("H1277 ST9", "Mountain Larch", "Larch", "Smoothtouch Matt", "#C2A276"),
  // ── Mid Woods ──────────────────────────────────────────────────────────
  e("H3433 ST22", "Natural Hamilton Oak", "Oak", "Cubanite", "#A8835A"),
  e("H1399 ST10", "Grey Brown Whiteriver Oak", "Oak", "Sand", "#8C7860"),
  e("H3146 ST19", "Natural Aida Walnut", "Walnut", "Pore", "#7B5A40"),
  // ── Dark Woods ─────────────────────────────────────────────────────────
  e("H1199 ST12", "Dark Brown Sorano Oak", "Oak", "Natural", "#5C4632"),
  e("H1137 ST12", "Black-Brown Sorano Oak", "Oak", "Natural", "#3B2D22"),
  e("H3325 ST28", "Tobacco Pacific Walnut", "Walnut", "Pore", "#5A3F2C"),
  // ── Stones & Marbles ───────────────────────────────────────────────────
  e("F812 ST9", "White Levanto Marble", "Stone", "Smoothtouch Matt", "#EDE9E2"),
  e("F204 ST75", "Marmara Marble", "Stone", "Pore", "#E5DFD4"),
  e("F206 ST9", "Black Marble", "Stone", "Smoothtouch Matt", "#2A2724"),
  e("F242 ST10", "Light Grey Beton", "Concrete", "Sand", "#B8B4AC"),
  e("F186 ST9", "Anthracite Metal Rock", "Concrete", "Smoothtouch Matt", "#4D4B47"),
];
