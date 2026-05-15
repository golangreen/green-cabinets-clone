/**
 * Custom Vanity Configurator domain logic.
 * Pure functions + constants — no React.
 */
import { z } from "zod";
import { getTafisaColorNames } from "@/lib/tafisaColors";
import { getEggerColorNames } from "@/lib/eggerColors";

export type VanityBrand = "Tafisa" | "Egger" | "Shinnoki";

export const TAX_RATES: Record<string, number> = {
  NY: 0.08875,
  NJ: 0.06625,
  CT: 0.0635,
  PA: 0.06,
  other: 0,
};

export const SHIPPING_RATES: Record<string, number> = {
  NY: 150,
  NJ: 200,
  CT: 250,
  PA: 300,
  other: 400,
};

export const SHINNOKI_FINISHES = [
  "Bondi Oak", "Milk Oak", "Ivory Oak", "Ivory Infinite Oak",
  "Natural Oak", "Manhattan Oak", "Desert Oak", "Sahara Oak", "Burley Oak",
  "Raven Oak",
  "Frozen Walnut", "Smoked Walnut", "Pure Walnut", "Stardust Walnut",
  "Pebble Triba", "Terra Sapele", "Cinnamon Triba", "Shadow Eucalyptus",
];

export const BRAND_INFO: Record<VanityBrand, { price: number; description: string }> = {
  Tafisa: { price: 250, description: "Premium melamine panels - 60+ colors available" },
  Egger:  { price: 300, description: "Premium TFL & HPL panels - 98+ woodgrain and solid colors" },
  Shinnoki: { price: 350, description: "Prefinished wood veneer panels - Natural wood beauty" },
};

export const BRANDS = Object.keys(BRAND_INFO) as VanityBrand[];

const PRICE_PER_LINEAR_FOOT = 350;

export const dimensionSchema = z.object({
  width: z.number().min(12, "Width must be at least 12 inches").max(120, "Width cannot exceed 120 inches"),
  height: z.number().min(12, "Height must be at least 12 inches").max(60, "Height cannot exceed 60 inches"),
  depth: z.number().min(12, "Depth must be at least 12 inches").max(36, "Depth cannot exceed 36 inches"),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
});

const FRACTIONS_BY_SIXTEENTHS: Record<string, string> = {
  "0": "", "1": "1/16", "2": "1/8", "3": "3/16", "4": "1/4",
  "5": "5/16", "6": "3/8", "7": "7/16", "8": "1/2",
  "9": "9/16", "10": "5/8", "11": "11/16", "12": "3/4",
  "13": "13/16", "14": "7/8", "15": "15/16",
};

export const customVanityService = {
  getFractionDisplay(sixteenths: string): string {
    return FRACTIONS_BY_SIXTEENTHS[sixteenths] ?? "";
  },

  inchesFromParts(whole: string, sixteenths: string): number {
    return parseFloat(whole || "0") + parseInt(sixteenths || "0") / 16;
  },

  getAvailableFinishes(brand: VanityBrand | string): string[] {
    if (brand === "Tafisa") return getTafisaColorNames();
    if (brand === "Egger") return getEggerColorNames();
    if (brand === "Shinnoki") return SHINNOKI_FINISHES;
    return [];
  },

  zipToState(zipCode: string): string {
    if (zipCode.length !== 5) return "";
    const zip = parseInt(zipCode, 10);
    if (zip >= 10000 && zip <= 14999) return "NY";
    if (zip >= 7000 && zip <= 8999) return "NJ";
    if (zip >= 6000 && zip <= 6999) return "CT";
    if (zip >= 15000 && zip <= 19999) return "PA";
    return "other";
  },

  calculateBasePrice(widthInches: number): number {
    const linearFeet = widthInches / 12;
    return linearFeet * PRICE_PER_LINEAR_FOOT;
  },

  calculateTax(subtotal: number, state: string): number {
    if (!state) return 0;
    return subtotal * (TAX_RATES[state] ?? 0);
  },

  calculateShipping(state: string): number {
    if (!state) return 0;
    return SHIPPING_RATES[state] ?? SHIPPING_RATES.other;
  },

  pricePerLinearFoot: PRICE_PER_LINEAR_FOOT,
};
