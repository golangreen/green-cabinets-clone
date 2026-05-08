/**
 * Material panel = a real laminate/melamine swatch from a partner brand
 * (Tafisa, Shinnoki, Egger, Wilsonart, etc.) that the showroom stocks or
 * can order. Used by the Materials Browser on /wood-species.
 */
export type MaterialBrand = "Tafisa" | "Shinnoki" | "Egger" | "Wilsonart";

export interface MaterialPanel {
  id: string;
  brand: MaterialBrand;
  slug: string;
  name: string;
  /** Manufacturer product codes (TFL/HPL/decor numbers) */
  codes: string[];
  /** Color family used for filtering */
  category: string;
  /** Surface finish/texture used for filtering */
  finish: string;
  /** ~220px square swatch (catalog thumbnail) */
  thumb: string;
  /** Higher-resolution version for the modal/zoom */
  hiRes: string;
  /** Link back to the manufacturer product page */
  detailUrl: string;
}
