/**
 * The scan as an architect's floor plan, drawn flat from above: the floor,
 * walls in solid ink, door swings, windows, the cabinets and appliances the
 * scan found, and a dimension line outside every wall in the chosen unit
 * (none for a clean plan). Drawn into a canvas so it exports pixel for pixel.
 */
import type { ScannedRoom, Segment } from "./roomScan";
import { areaIn, lengthIn, polygonArea, wallLoopArea, type Unit } from "./roomScan";

const PAPER = "#F1EFEA";
const FLOOR = "#E7E0D2";
const WALL = "#26221E";
const LINE = "#5E574D";
const DIM = "#8A6A2F";
const CAB = "#DCC9A3";
const APPL = "#FBFAF7";
const BRASS = "#C6A15B";
const FADED = "#B9B1A4";

const NAMES: Record<string, string> = {
  fridge: "Fridge", stove: "Range", oven: "Oven", dishwasher: "DW", washer: "Washer", sink: "Sink", toilet: "WC",
  tub: "Tub", bed: "Bed", sofa: "Sofa", table: "Table", chair: "Chair", fireplace: "Fireplace", tv: "TV", stairs: "Stairs",
};

type P = [number, number];

export interface PlanCanvas extends HTMLCanvasElement {
  /** The wall under a point in canvas pixels, or -1. */
  wallAt: (px: number, py: number) => number;
}

export function drawFloorPlan(
  room: ScannedRoom,
  unit: Unit,
  { width = 2000, aspect = 0.72, selected = [] as number[], tags = false } = {},
): PlanCanvas {
  const len = lengthIn(unit);
  const area = areaIn(unit);
  const dims = unit !== "none";
  const walls = room.walls || [];
  const pts: P[] = [...walls.flatMap((w) => [w.a, w.b]), ...(room.objects || []).map((o) => o.c)];
  const minX = Math.min(...pts.map((p) => p[0])), maxX = Math.max(...pts.map((p) => p[0]));
  const minZ = Math.min(...pts.map((p) => p[1])), maxZ = Math.max(...pts.map((p) => p[1]));
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;

  // Fit the room with room around it for the dimension lines.
  const H = Math.round(width * aspect);
  const pad = width * (dims ? 0.11 : 0.07);
  const s = Math.min((width - 2 * pad) / Math.max(maxX - minX, 0.5), (H - 2 * pad) / Math.max(maxZ - minZ, 0.5));
  const X = (x: number) => width / 2 + (x - cx) * s;
  const Y = (z: number) => H / 2 + (z - cz) * s;
  const u = width / 1000; // one design unit

  const c = document.createElement("canvas") as PlanCanvas;
  c.width = width;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = PAPER;
  g.fillRect(0, 0, width, H);
  g.lineJoin = "round";

  // Floor
  const floors = (room.floors || []).filter((f) => f.poly?.length >= 3).map((f) => f.poly);
  const outline: P[][] = floors.length ? floors : walls.length >= 3 ? [walls.map((w) => w.a)] : [];
  g.fillStyle = FLOOR;
  for (const poly of outline) {
    g.beginPath();
    poly.forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))));
    g.closePath();
    g.fill();
  }

  // Objects under the walls
  for (const o of room.objects || []) {
    const ang = Math.atan2(o.ax[1], o.ax[0]);
    g.save();
    g.translate(X(o.c[0]), Y(o.c[1]));
    g.rotate(ang);
    const w = o.w * s, d = o.d * s;
    const isCab = o.cat === "cabinet";
    g.fillStyle = isCab ? CAB : APPL;
    g.strokeStyle = LINE;
    g.lineWidth = Math.max(1, 1.6 * u);
    g.fillRect(-w / 2, -d / 2, w, d);
    g.strokeRect(-w / 2, -d / 2, w, d);
    if (o.cat === "sink") {
      g.strokeRect(-w * 0.32, -d * 0.28, w * 0.64, d * 0.56);
    } else if (o.cat === "stove") {
      g.lineWidth = Math.max(1, 1.2 * u);
      for (const [fx, fy] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
        g.beginPath();
        g.arc(fx * w, fy * d, Math.min(w, d) * 0.15, 0, Math.PI * 2);
        g.stroke();
      }
    } else if (isCab) {
      // Counter edge line on the room side
      g.beginPath();
      g.moveTo(-w / 2, d / 2 - 3 * u);
      g.lineTo(w / 2, d / 2 - 3 * u);
      g.stroke();
    }
    const label = NAMES[o.cat];
    if (label && o.cat !== "stove") {
      // Keep text upright whatever way the object faces
      let r = ang;
      while (r > Math.PI / 2) r -= Math.PI;
      while (r < -Math.PI / 2) r += Math.PI;
      g.rotate(r - ang);
      g.fillStyle = LINE;
      g.font = `500 ${Math.min(15 * u, d * 0.42, w * 0.3)}px Outfit, Helvetica, Arial, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(label, 0, 0);
    }
    g.restore();
  }

  // Walls
  const wallW = Math.max(5 * u, 0.12 * s);
  g.strokeStyle = WALL;
  g.lineCap = "square";
  g.lineWidth = wallW;
  const picked = new Set(selected);
  walls.forEach((w, i) => {
    g.strokeStyle = picked.has(i) ? BRASS : picked.size ? FADED : WALL;
    g.beginPath();
    g.moveTo(X(w.a[0]), Y(w.a[1]));
    g.lineTo(X(w.b[0]), Y(w.b[1]));
    g.stroke();
  });
  g.strokeStyle = WALL;

  const centre: P = [cx, cz];
  const inward = (a: P, b: P): P => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    let n: P = [-(b[1] - a[1]) / l, (b[0] - a[0]) / l];
    const m: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (n[0] * (centre[0] - m[0]) + n[1] * (centre[1] - m[1]) < 0) n = [-n[0], -n[1]];
    return n;
  };
  const cut = (o: Segment) => {
    g.strokeStyle = PAPER;
    g.lineCap = "butt";
    g.lineWidth = wallW + 2;
    g.beginPath();
    g.moveTo(X(o.a[0]), Y(o.a[1]));
    g.lineTo(X(o.b[0]), Y(o.b[1]));
    g.stroke();
  };

  // Openings: a clean gap
  for (const o of room.openings || []) cut(o);

  // Windows: the gap with a double line of glass
  for (const o of room.windows || []) {
    cut(o);
    const n = inward(o.a, o.b), off = wallW / 2 / s;
    g.strokeStyle = WALL;
    g.lineWidth = Math.max(1, 1.6 * u);
    for (const k of [-off, 0, off]) {
      g.beginPath();
      g.moveTo(X(o.a[0] + n[0] * k), Y(o.a[1] + n[1] * k));
      g.lineTo(X(o.b[0] + n[0] * k), Y(o.b[1] + n[1] * k));
      g.stroke();
    }
  }

  // Doors: the gap, the leaf standing open into the room, and its swing
  for (const o of room.doors || []) {
    cut(o);
    const n = inward(o.a, o.b);
    const r = Math.hypot(o.b[0] - o.a[0], o.b[1] - o.a[1]);
    const hinge = o.a, tip: P = [hinge[0] + n[0] * r, hinge[1] + n[1] * r];
    g.strokeStyle = WALL;
    g.lineWidth = Math.max(1.5, 2.4 * u);
    g.beginPath();
    g.moveTo(X(hinge[0]), Y(hinge[1]));
    g.lineTo(X(tip[0]), Y(tip[1]));
    g.stroke();
    const a0 = Math.atan2(o.b[1] - hinge[1], o.b[0] - hinge[0]);
    const a1 = Math.atan2(n[1], n[0]);
    let d = a1 - a0;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    g.lineWidth = Math.max(1, 1.2 * u);
    g.setLineDash([6 * u, 5 * u]);
    g.beginPath();
    g.arc(X(hinge[0]), Y(hinge[1]), r * s, a0, a0 + d, d < 0);
    g.stroke();
    g.setLineDash([]);
  }

  // Dimension lines outside each wall
  if (dims) {
    const gap = Math.max(26 * u, wallW * 2.2);
    g.font = `500 ${15 * u}px Outfit, Helvetica, Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (const w of walls) {
      if (w.len < 0.3) continue;
      const n = inward(w.a, w.b);
      const ax = X(w.a[0]) - n[0] * gap, ay = Y(w.a[1]) - n[1] * gap;
      const bx = X(w.b[0]) - n[0] * gap, by = Y(w.b[1]) - n[1] * gap;
      g.strokeStyle = DIM;
      g.lineWidth = Math.max(1, 1.2 * u);
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      // extension lines back toward the wall
      g.moveTo(ax + n[0] * gap * 0.75, ay + n[1] * gap * 0.75);
      g.lineTo(ax - n[0] * 6 * u, ay - n[1] * 6 * u);
      g.moveTo(bx + n[0] * gap * 0.75, by + n[1] * gap * 0.75);
      g.lineTo(bx - n[0] * 6 * u, by - n[1] * 6 * u);
      g.stroke();
      // architect's ticks
      const t = 6 * u, dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
      g.lineWidth = Math.max(1.5, 2 * u);
      for (const [px, py] of [[ax, ay], [bx, by]]) {
        g.beginPath();
        g.moveTo(px - (ux + n[0]) * t, py - (uy + n[1]) * t);
        g.lineTo(px + (ux + n[0]) * t, py + (uy + n[1]) * t);
        g.stroke();
      }
      // the size, upright, on a paper chip so the line runs behind it
      const text = len(w.len);
      let ang = Math.atan2(dy, dx);
      if (ang > Math.PI / 2) ang -= Math.PI;
      if (ang < -Math.PI / 2) ang += Math.PI;
      g.save();
      g.translate((ax + bx) / 2, (ay + by) / 2);
      g.rotate(ang);
      const tw = g.measureText(text).width + 12 * u;
      g.fillStyle = PAPER;
      g.fillRect(-tw / 2, -11 * u, tw, 22 * u);
      g.fillStyle = DIM;
      g.fillText(text, 0, 0);
      g.restore();
    }

    // Floor area in the middle of the room
    const a = floors.length ? floors.reduce((t, f) => t + polygonArea(f), 0) : wallLoopArea(walls);
    const ceiling = Math.max(0, ...walls.map((w) => w.h));
    if (a > 0) {
      g.fillStyle = WALL;
      g.font = `500 ${24 * u}px "Cormorant Garamond", Georgia, serif`;
      g.fillText(area(a), width / 2, H / 2 - 12 * u);
      g.fillStyle = LINE;
      g.font = `400 ${13 * u}px Outfit, Helvetica, Arial, sans-serif`;
      g.fillText(`Ceiling ${len(ceiling)}`, width / 2, H / 2 + 14 * u);
    }
  }
  // Wall numbers, while walls are being picked: a numbered dot just inside each wall
  if (tags) {
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `600 ${15 * u}px Outfit, Helvetica, Arial, sans-serif`;
    walls.forEach((w, i) => {
      const n = inward(w.a, w.b), off = wallW * 0.5 + 20 * u;
      const mx = X((w.a[0] + w.b[0]) / 2) + n[0] * off, my = Y((w.a[1] + w.b[1]) / 2) + n[1] * off;
      g.fillStyle = picked.has(i) ? BRASS : WALL;
      g.beginPath();
      g.arc(mx, my, 15 * u, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = picked.has(i) ? WALL : PAPER;
      g.fillText(String(i + 1), mx, my + 1 * u);
    });
  }

  c.wallAt = (px, py) => {
    let best = -1, bd = Math.max(28 * u, wallW * 1.5);
    walls.forEach((w, i) => {
      const ax = X(w.a[0]), ay = Y(w.a[1]), bx = X(w.b[0]), by = Y(w.b[1]);
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  };
  return c;
}
