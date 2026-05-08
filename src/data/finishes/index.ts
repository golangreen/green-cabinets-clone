import type { MaterialPanel } from "@/types/materials";
import { TAFISA_PANELS } from "./tafisa";
import { SHINNOKI_PANELS } from "./shinnoki";

export const ALL_PANELS: MaterialPanel[] = [...TAFISA_PANELS, ...SHINNOKI_PANELS];

export const PANELS_BY_BRAND = {
  Tafisa: TAFISA_PANELS,
  Shinnoki: SHINNOKI_PANELS,
  Egger: [] as MaterialPanel[],
  Wilsonart: [] as MaterialPanel[],
};
