/**
 * Curated Wilsonart laminate selection — the most popular kitchen designs
 * from the Wilsonart Design Library.
 *
 * Why curated, not scraped: Wilsonart's site is gated behind AWS WAF and
 * we don't want to rehost their swatches. We display real design numbers,
 * an approximate color, and link out to wilsonart.com for the live photo.
 *
 * Source: https://www.wilsonart.com/laminate/design-library
 */
import type { MaterialPanel } from "@/types/materials";

export const WILSONART_CATALOG_URL =
  "https://www.wilsonart.com/laminate/design-library?product_list_mode=largethumb";

const w = (
  code: string,
  slug: string,
  name: string,
  category: string,
  finish: string,
  swatchHex: string,
): MaterialPanel => ({
  id: `wilsonart-${code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  brand: "Wilsonart",
  slug,
  name,
  codes: [code],
  category,
  finish,
  thumb: "",
  hiRes: "",
  swatchHex,
  detailUrl: `https://www.wilsonart.com/laminate/${code.toLowerCase()}-${slug}`,
});

export const WILSONART_PANELS: MaterialPanel[] = [
  // ── Whites ─────────────────────────────────────────────────────────────
  w("4951-38", "calcutta-marble", "Calcutta Marble", "Stone", "Fine Velvet Texture", "#EDE9E1"),
  w("4925-38", "carrara-envision", "Carrara Envision", "Stone", "Fine Velvet Texture", "#E8E6DE"),
  w("1573-60", "designer-white", "Designer White", "White", "Matte", "#F1EFE8"),
  w("4924-38", "white-cararra", "White Cararra", "Stone", "Fine Velvet Texture", "#E5E2D8"),
  w("4926-38", "calacatta-marble", "Calacatta Marble", "Stone", "Fine Velvet Texture", "#EFECE3"),
  // ── Greys & Stones ────────────────────────────────────────────────────
  w("4931-38", "calcutta-blanc", "Calcutta Blanc", "Stone", "Fine Velvet Texture", "#E6E2D9"),
  w("4934-38", "marbled-dawn", "Marbled Dawn", "Stone", "Fine Velvet Texture", "#D6CFC4"),
  w("4940-38", "smokey-topaz", "Smokey Topaz", "Stone", "Fine Velvet Texture", "#827870"),
  w("4942-38", "luna-night", "Luna Night", "Stone", "Fine Velvet Texture", "#2E2C2A"),
  w("4882-38", "asian-night", "Asian Night", "Stone", "Fine Velvet Texture", "#1F1E1C"),
  // ── Solids ─────────────────────────────────────────────────────────────
  w("1595-60", "black", "Black", "Black", "Matte", "#1A1A1A"),
  w("1500-60", "natural-almond", "Natural Almond", "Beige", "Matte", "#D9CDB6"),
  w("1572-60", "frosty-white", "Frosty White", "White", "Matte", "#EEE9DD"),
  w("D381-60", "dove-grey", "Dove Grey", "Grey", "Matte", "#9C9893"),
  w("D90-60", "graphite-nebula", "Graphite Nebula", "Grey", "Matte", "#3D3D3D"),
  // ── Light Woods ────────────────────────────────────────────────────────
  w("7965K-12", "salvage-planked-elm", "Salvage Planked Elm", "Elm", "Soft Grain", "#C7B091"),
  w("7972K-12", "monticello-maple", "Monticello Maple", "Maple", "Soft Grain", "#D5BB94"),
  w("7977K-12", "asian-sun", "Asian Sun", "Wood", "Soft Grain", "#B89870"),
  w("7980K-12", "kalahari-topaz", "Kalahari Topaz", "Wood", "Soft Grain", "#A88560"),
  // ── Mid / Dark Woods ───────────────────────────────────────────────────
  w("7949K-12", "bannister-oak", "Bannister Oak", "Oak", "Soft Grain", "#8B6F4F"),
  w("7964K-12", "cafelle", "Cafelle", "Wood", "Soft Grain", "#6E4F35"),
  w("7981K-12", "florence-walnut", "Florence Walnut", "Walnut", "Soft Grain", "#4E3622"),
  w("7973K-12", "skyros-walnut", "Skyros Walnut", "Walnut", "Soft Grain", "#3F2A1C"),
  // ── Concrete & Industrial ──────────────────────────────────────────────
  w("4884-38", "concrete-formwood", "Concrete Formwood", "Concrete", "Fine Velvet Texture", "#9A958C"),
  w("4885-38", "weathered-fiberwood", "Weathered Fiberwood", "Concrete", "Fine Velvet Texture", "#7C7770"),
];
