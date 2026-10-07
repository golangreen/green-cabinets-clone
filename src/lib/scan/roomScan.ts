/**
 * Room scanning for the Green Cabinets app.
 *
 * The scan itself is native (RoomScanPlugin.swift, Apple RoomPlan on LiDAR
 * iPhones and iPads). It hands back the room seen from above, in meters:
 * walls, doors, windows and openings as segments, fixed objects (cabinets,
 * sink, fridge...) as footprints. On the website there is no LiDAR, so
 * `scanAvailable()` is false and the page offers the sample instead.
 */
import { registerPlugin } from "@capacitor/core";
import { isApp } from "@/lib/platform";
import sample from "./sampleRoom.json";

export interface Segment {
  a: [number, number];
  b: [number, number];
  len: number;
  h: number;
  y?: number;
  open?: boolean;
}

export interface RoomObject {
  c: [number, number];
  ax: [number, number];
  w: number;
  d: number;
  h: number;
  y?: number;
  cat: string;
}

export interface ScannedRoom {
  v: number;
  rooms?: number;
  walls: Segment[];
  doors: Segment[];
  windows: Segment[];
  openings: Segment[];
  objects: RoomObject[];
  floors?: { poly: [number, number][]; y?: number }[];
  sections?: { label: string; c: [number, number] }[];
}

interface RoomScanPlugin {
  available(): Promise<{ ok: boolean; multi?: boolean }>;
  scan(opts: { labels?: Record<string, string>; multi?: boolean }): Promise<ScannedRoom>;
}

const RoomScan = registerPlugin<RoomScanPlugin>("RoomScan");

export { isApp };

/** True only inside the iPhone/iPad app on a device with LiDAR. */
export async function scanAvailable(): Promise<{ ok: boolean; multi: boolean }> {
  if (!isApp()) return { ok: false, multi: false };
  try {
    const r = await RoomScan.available();
    return { ok: !!r.ok, multi: !!r.multi };
  } catch {
    return { ok: false, multi: false };
  }
}

/** Runs Apple's guided scan. Resolves null if the person cancels. */
export async function scanRoom(multi: boolean): Promise<ScannedRoom | null> {
  try {
    return await RoomScan.scan({
      multi,
      labels: {
        cancel: "Cancel",
        done: "Done",
        next: "Next room",
        hint: "Walk slowly around the room, pointing at the walls, corners and floor. Tap Done when the outline is complete.",
        saving: "Saving this room…",
        building: "Building your room…",
        room: "Room {0} saved. Walk into the next room and keep scanning.",
      },
    });
  } catch {
    return null;
  }
}

export const SAMPLE_ROOM = sample as unknown as ScannedRoom;

// ── Feet and inches (US clients) ──

const M_TO_IN = 39.3701;

/** 3.6 m -> 11' 10" */
export function feet(m: number): string {
  const totalIn = Math.round(m * M_TO_IN);
  const ft = Math.floor(totalIn / 12);
  const inch = totalIn % 12;
  return inch ? `${ft}' ${inch}"` : `${ft}'`;
}

/** m² -> "142 sq ft" */
export function sqft(m2: number): string {
  return `${Math.round(m2 * 10.7639).toLocaleString("en-US")} sq ft`;
}

function polygonArea(poly: [number, number][]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % poly.length];
    s += x1 * z2 - x2 * z1;
  }
  return Math.abs(s) / 2;
}

/** Floor outline from the walls when the scan has no floor polygon (iOS 16). */
function wallLoopArea(walls: Segment[]): number {
  if (walls.length < 3) return 0;
  return polygonArea(walls.map((w) => w.a));
}

export interface RoomSummary {
  area: string;
  ceiling: string;
  wallRun: string;
  walls: number;
  doors: number;
  windows: number;
  cabinets: number;
  appliances: string[];
  lines: string[];
}

const APPLIANCES = ["fridge", "stove", "oven", "sink", "dishwasher", "washer"];

/** The numbers Green Cabinets needs first, in words and feet. */
export function summarize(room: ScannedRoom): RoomSummary {
  const floorArea = room.floors?.length
    ? room.floors.reduce((s, f) => s + polygonArea(f.poly), 0)
    : wallLoopArea(room.walls);
  const ceilingM = Math.max(0, ...room.walls.map((w) => w.h));
  const runM = room.walls.reduce((s, w) => s + w.len, 0);
  const cabinets = room.objects.filter((o) => o.cat === "cabinet");
  const appliances = [...new Set(room.objects.map((o) => o.cat).filter((c) => APPLIANCES.includes(c)))];

  const s: RoomSummary = {
    area: sqft(floorArea),
    ceiling: feet(ceilingM),
    wallRun: feet(runM),
    walls: room.walls.length,
    doors: room.doors.length,
    windows: room.windows.length,
    cabinets: cabinets.length,
    appliances,
    lines: [],
  };
  s.lines = [
    `Floor area: ${s.area}`,
    `Ceiling height: ${s.ceiling}`,
    `Total wall length: ${s.wallRun} over ${s.walls} walls`,
    `Doors: ${s.doors} · Windows: ${s.windows}`,
    `Existing cabinets found: ${s.cabinets}`,
    ...(appliances.length ? [`Appliances found: ${appliances.join(", ")}`] : []),
    "Walls: " + room.walls.map((w, i) => `${i + 1}) ${feet(w.len)}`).join("  "),
  ];
  return s;
}
