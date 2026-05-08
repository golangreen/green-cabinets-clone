import type { MaterialPanel } from "@/types/materials";
import { TAFISA_PANELS } from "./tafisa";

export const ALL_PANELS: MaterialPanel[] = [...TAFISA_PANELS];

export const PANELS_BY_BRAND = {
  Tafisa: TAFISA_PANELS,
  Shinnoki: [] as MaterialPanel[],
  Egger: [] as MaterialPanel[],
  Wilsonart: [] as MaterialPanel[],
};
