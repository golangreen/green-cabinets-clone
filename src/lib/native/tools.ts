/**
 * The app's native tools (ios/App/App/*Plugin.swift): cabinets in AR, the
 * camera tape measure and Apple's document scanner. Every call is safe on
 * the website too: it just reports "not available".
 */
import { registerPlugin } from "@capacitor/core";
import { isApp } from "@/lib/platform";
import type { Unit } from "@/lib/scan/roomScan";
import walnut from "@/assets/finishes/egger-walnut.jpg";
import whiteOak from "@/assets/finishes/egger-white-oak.jpg";
import casellaOak from "@/assets/finishes/egger-casella-oak.jpg";
import creamPuff from "@/assets/finishes/tafisa-cream-puff.jpg";

interface ARDesignPlugin {
  available(): Promise<{ ok: boolean }>;
  open(opts: { finishes: { name: string; hex?: string; texture?: string }[] }): Promise<{ photos: string[] }>;
}
interface ARMeasurePlugin {
  open(opts: { unit: Unit }): Promise<{ lengths: number[]; photos: string[] }>;
}
interface DocScanPlugin {
  available(): Promise<{ ok: boolean }>;
  scan(): Promise<{ pages: string[] }>;
}

const ARDesign = registerPlugin<ARDesignPlugin>("ARDesign");
const ARMeasure = registerPlugin<ARMeasurePlugin>("ARMeasure");
const DocScan = registerPlugin<DocScanPlugin>("DocScan");

/** The finishes the AR cabinets can wear: the wood and color samples from the site, then paint. */
export const AR_FINISHES = [
  { name: "Painted white", hex: "#EEEBE3" },
  { name: "White oak", texture: whiteOak },
  { name: "Walnut", texture: walnut },
  { name: "Casella oak", texture: casellaOak },
  { name: "Sage green", hex: "#7F8C77" },
  { name: "Cream", texture: creamPuff },
  { name: "Light grey", hex: "#B9B7B1" },
  { name: "Navy", hex: "#2F3A4A" },
  { name: "Black", hex: "#1E1D1C" },
];

const jpeg = (b64: string) => `data:image/jpeg;base64,${b64}`;

export async function arAvailable(): Promise<boolean> {
  if (!isApp()) return false;
  try {
    return (await ARDesign.available()).ok;
  } catch {
    return false;
  }
}

/** Opens the camera with cabinets; resolves to the pictures taken (data URLs). */
export async function openArCabinets(): Promise<string[]> {
  // Texture paths are the bundled site's own files (/assets/...), read natively
  const finishes = AR_FINISHES.map((f) => ({ name: f.name, hex: f.hex, texture: f.texture ? new URL(f.texture, location.href).pathname : undefined }));
  const r = await ARDesign.open({ finishes });
  return (r.photos ?? []).map(jpeg);
}

/** Opens the camera tape measure; lengths come back in meters. */
export async function openMeasure(unit: Unit): Promise<{ lengths: number[]; photos: string[] }> {
  const r = await ARMeasure.open({ unit });
  return { lengths: r.lengths ?? [], photos: (r.photos ?? []).map(jpeg) };
}

export async function docScanAvailable(): Promise<boolean> {
  if (!isApp()) return false;
  try {
    return (await DocScan.available()).ok;
  } catch {
    return false;
  }
}

/** Apple's document scanner; resolves to the scanned pages (data URLs), empty if cancelled. */
export async function scanDocuments(): Promise<string[]> {
  const r = await DocScan.scan();
  return (r.pages ?? []).map(jpeg);
}
