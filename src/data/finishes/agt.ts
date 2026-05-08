/**
 * AGT — Turkish manufacturer of high-pressure laminate and PVC-membrane
 * cabinet doors. We use specific AGT decors on real installs but only catalog
 * the ones our shop stocks samples of. Add more as we use them.
 *
 * Source: https://www.agtwood.com/products/panel/panel
 */
import type { MaterialPanel } from "@/types/materials";

export const AGT_CATALOG_URL = "https://www.agtwood.com/products/panel/panel";

export const AGT_PANELS: MaterialPanel[] = [
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
];
