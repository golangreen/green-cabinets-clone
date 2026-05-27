import type { MaterialBrand, MaterialPanel } from "@/types/materials";
import { TAFISA_PANELS } from "./tafisa";
import { SHINNOKI_PANELS } from "./shinnoki";
import { EGGER_PANELS, EGGER_CATALOG_URL } from "./egger";
import { WILSONART_PANELS, WILSONART_CATALOG_URL } from "./wilsonart";
import { AGT_PANELS, AGT_CATALOG_URL } from "./agt";
import { RAPHAEL_PANELS, RAPHAEL_CATALOG_URL } from "./raphael";

export const ALL_PANELS: MaterialPanel[] = [
  ...TAFISA_PANELS,
  ...SHINNOKI_PANELS,
  ...EGGER_PANELS,
  ...WILSONART_PANELS,
  ...AGT_PANELS,
  ...RAPHAEL_PANELS,
];

export const PANELS_BY_BRAND: Record<MaterialBrand, MaterialPanel[]> = {
  Tafisa: TAFISA_PANELS,
  Shinnoki: SHINNOKI_PANELS,
  Egger: EGGER_PANELS,
  Wilsonart: WILSONART_PANELS,
  AGT: AGT_PANELS,
  "Raphael Stone": RAPHAEL_PANELS,
};

/**
 * Per-brand link to the manufacturer's full design library, shown when we
 * only carry a curated subset (Egger, Wilsonart, AGT) so power users can
 * browse the complete catalog at the source.
 */
export const BRAND_FULL_CATALOG_URL: Partial<Record<MaterialBrand, string>> = {
  Egger: EGGER_CATALOG_URL,
  Wilsonart: WILSONART_CATALOG_URL,
  AGT: AGT_CATALOG_URL,
  "Raphael Stone": RAPHAEL_CATALOG_URL,
};
