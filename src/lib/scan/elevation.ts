/**
 * One wall drawn flat, as an architect's elevation: the wall seen straight on
 * from inside the room, its doors, windows and openings cut in, the cabinets
 * and appliances standing against it, and the sizes a cabinetmaker needs
 * (overall width and height, each opening's size and how high it sits).
 * Canvas, so it exports exactly as drawn. unit "none" draws it clean.
 */
import type { RoomObject, ScannedRoom, Segment } from "./roomScan";
import { lengthIn, type Unit } from "./roomScan";

const PAPER = "#F1EFEA";
const FACE = "#E9E2D4";
const WALL = "#26221E";
const LINE = "#5E574D";
const DIM = "#8A6A2F";
const CAB = "#DCC9A3";
const APPL = "#FBFAF7";
const GLASS = "#CFE0E6";

const NAMES: Record<string, string> = {
  fridge: "Fridge", stove: "Range", oven: "Oven", dishwasher: "DW", washer: "Washer", sink: "Sink", toilet: "WC",
  tub: "Tub", fireplace: "Fireplace", tv: "TV", stairs: "Stairs", table: "Table", sofa: "Sofa", bed: "Bed", chair: "Chair",
};

/** Where the floor is: the scan's floors, else the walls' bottoms, else 0 (same rule as the 3D). */
function floorLevel(room: ScannedRoom): number {
  const fy = (room.floors || []).map((f) => f.y).filter((y): y is number => typeof y === "number");
  if (fy.length) return Math.min(...fy);
  const wy = room.walls.filter((w) => typeof w.y === "number").map((w) => (w.y as number) - w.h / 2);
  return wy.length ? Math.min(...wy) : 0;
}

interface Piece {
  kind: "doors" | "windows" | "openings";
  s0: number;
  s1: number;
  bot: number;
  top: number;
  open?: boolean;
}

/** Doors, windows and openings in this wall, as spans along it (metres from end a). */
function holesIn(w: Segment, room: ScannedRoom, fy: number): Piece[] {
  const ax = w.b[0] - w.a[0], az = w.b[1] - w.a[1], len = Math.hypot(ax, az) || 1;
  const ux = ax / len, uz = az / len;
  const out: Piece[] = [];
  for (const kind of ["doors", "windows", "openings"] as const) {
    for (const o of room[kind] || []) {
      const mx = (o.a[0] + o.b[0]) / 2 - w.a[0], mz = (o.a[1] + o.b[1]) / 2 - w.a[1];
      const s = mx * ux + mz * uz, off = Math.abs(mx * uz - mz * ux);
      if (off > 0.25 || s < -0.1 || s > len + 0.1) continue;
      const olen = Math.hypot(o.b[0] - o.a[0], o.b[1] - o.a[1]) || 1;
      if (Math.abs(((o.b[0] - o.a[0]) * ux + (o.b[1] - o.a[1]) * uz) / olen) < 0.8) continue;
      let bot = typeof o.y === "number" ? o.y - o.h / 2 - fy : kind === "windows" ? Math.max(0.3, Math.min(0.9, w.h - o.h - 0.15)) : 0;
      bot = Math.max(0, bot);
      const top = Math.min(w.h, bot + o.h);
      const s0 = Math.max(0, s - o.len / 2), s1 = Math.min(len, s + o.len / 2);
      if (s1 - s0 > 0.05 && top - bot > 0.05) out.push({ kind, s0, s1, bot, top, open: o.open });
    }
  }
  return out.sort((p, q) => p.s0 - q.s0);
}

/** Objects standing against this wall, as spans along it. */
function objectsAgainst(w: Segment, room: ScannedRoom, fy: number): { o: RoomObject; s0: number; s1: number; bot: number; top: number }[] {
  const len = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1, ux = (w.b[0] - w.a[0]) / len, uz = (w.b[1] - w.a[1]) / len;
  const out = [];
  for (const o of room.objects || []) {
    if (Math.abs(o.ax[0] * ux + o.ax[1] * uz) < 0.8) continue;
    const mx = o.c[0] - w.a[0], mz = o.c[1] - w.a[1], s = mx * ux + mz * uz, off = Math.abs(mx * uz - mz * ux);
    if (s < -0.2 || s > len + 0.2 || off > o.d / 2 + 0.25) continue;
    const bot = typeof o.y === "number" ? Math.max(0, o.y - o.h / 2 - fy) : 0;
    out.push({ o, s0: Math.max(0, s - o.w / 2), s1: Math.min(len, s + o.w / 2), bot, top: bot + o.h });
  }
  // tall and appliance pieces last, so they sit on top of cabinet runs
  return out.sort((p, q) => (p.o.cat === "cabinet" ? 0 : 1) - (q.o.cat === "cabinet" ? 0 : 1));
}

export function drawWallElevation(room: ScannedRoom, wi: number, unit: Unit, width = 2000, aspect = 0.72): HTMLCanvasElement {
  const w = room.walls[wi];
  const len = lengthIn(unit);
  const dims = unit !== "none";
  const fy = floorLevel(room);
  const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
  const Hm = w.h;

  // Seen from inside the room: flip so the wall's left end is on the left.
  const pts = room.walls.flatMap((x) => [x.a, x.b]);
  const cxw = pts.reduce((t, p) => t + p[0], 0) / pts.length, czw = pts.reduce((t, p) => t + p[1], 0) / pts.length;
  const ux = (w.b[0] - w.a[0]) / (L || 1), uz = (w.b[1] - w.a[1]) / (L || 1);
  const mid = [(w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2];
  let nx = -uz, nz = ux; // a normal; make it point out of the room
  if (nx * (mid[0] - cxw) + nz * (mid[1] - czw) < 0) { nx = -nx; nz = -nz; }
  const flip = ux * -nz + uz * nx < 0; // the viewer's right is (-nz, nx)
  const along = (s: number) => (flip ? L - s : s);

  const H = Math.round(width * aspect);
  const u = width / 1000;
  const padX = dims ? 120 * u : 70 * u, padTop = dims ? 110 * u : 60 * u, padBot = dims ? 90 * u : 60 * u;
  const k = Math.min((width - 2 * padX) / Math.max(L, 0.5), (H - padTop - padBot) / Math.max(Hm, 0.5));
  const x0 = (width - L * k) / 2, floorY = padTop + Hm * k + ((H - padTop - padBot) - Hm * k) / 2;
  const X = (s: number) => x0 + along(s) * k;
  const Y = (y: number) => floorY - y * k;
  const span = (s0: number, s1: number) => [Math.min(X(s0), X(s1)), Math.abs(X(s1) - X(s0))] as const;

  const c = document.createElement("canvas");
  c.width = width;
  c.height = H;
  const g = c.getContext("2d")!;
  g.fillStyle = PAPER;
  g.fillRect(0, 0, width, H);

  // The wall face
  g.fillStyle = FACE;
  g.fillRect(x0, Y(Hm), L * k, Hm * k);

  // Doors, windows, openings
  const holes = holesIn(w, room, fy);
  for (const h of holes) {
    const [hx, hw] = span(h.s0, h.s1), hy = Y(h.top), hh = (h.top - h.bot) * k;
    g.fillStyle = h.kind === "windows" ? GLASS : PAPER;
    g.fillRect(hx, hy, hw, hh);
    g.strokeStyle = WALL;
    g.lineWidth = Math.max(1.5, 2.2 * u);
    if (h.kind === "openings") g.setLineDash([8 * u, 6 * u]);
    g.strokeRect(hx, hy, hw, hh);
    g.setLineDash([]);
    if (h.kind === "windows") {
      g.lineWidth = Math.max(1, 1.2 * u);
      g.strokeRect(hx + 6 * u, hy + 6 * u, hw - 12 * u, hh - 12 * u);
      g.beginPath();
      g.moveTo(hx + hw / 2, hy + 6 * u);
      g.lineTo(hx + hw / 2, hy + hh - 6 * u);
      g.stroke();
      // the sill
      g.lineWidth = Math.max(2, 3 * u);
      g.beginPath();
      g.moveTo(hx - 8 * u, hy + hh);
      g.lineTo(hx + hw + 8 * u, hy + hh);
      g.stroke();
    } else if (h.kind === "doors") {
      // elevation convention: the swing drawn as a dashed V to the hinge side
      g.lineWidth = Math.max(1, 1.2 * u);
      g.setLineDash([7 * u, 6 * u]);
      g.beginPath();
      g.moveTo(hx, hy);
      g.lineTo(hx + hw, hy + hh / 2);
      g.lineTo(hx, hy + hh);
      g.stroke();
      g.setLineDash([]);
    }
  }

  // Cabinets and appliances against the wall
  for (const p of objectsAgainst(w, room, fy)) {
    const [ox, ow] = span(p.s0, p.s1), oy = Y(p.top), oh = (p.top - p.bot) * k;
    const isCab = p.o.cat === "cabinet";
    g.fillStyle = isCab ? CAB : APPL;
    g.fillRect(ox, oy, ow, oh);
    g.strokeStyle = LINE;
    g.lineWidth = Math.max(1, 1.6 * u);
    g.strokeRect(ox, oy, ow, oh);
    if (isCab) {
      // door fronts about every 20 in, and a counter edge on base runs
      const n = Math.max(1, Math.round((p.s1 - p.s0) / 0.5));
      g.lineWidth = Math.max(1, 1 * u);
      for (let i = 1; i < n; i++) {
        g.beginPath();
        g.moveTo(ox + (ow * i) / n, oy + (p.top < 1.2 ? 10 * u : 0));
        g.lineTo(ox + (ow * i) / n, oy + oh);
        g.stroke();
      }
      if (p.top < 1.2) {
        g.lineWidth = Math.max(2, 3 * u);
        g.beginPath();
        g.moveTo(ox - 4 * u, oy + 2 * u);
        g.lineTo(ox + ow + 4 * u, oy + 2 * u);
        g.stroke();
      }
    } else if (NAMES[p.o.cat]) {
      g.fillStyle = LINE;
      g.font = `500 ${Math.min(16 * u, oh * 0.3, ow * 0.22)}px Outfit, Helvetica, Arial, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(NAMES[p.o.cat], ox + ow / 2, oy + oh / 2);
    }
  }

  // Wall outline, floor and ceiling lines
  g.strokeStyle = WALL;
  g.lineWidth = Math.max(2, 2.6 * u);
  g.strokeRect(x0, Y(Hm), L * k, Hm * k);
  g.lineWidth = Math.max(3, 5 * u);
  g.beginPath();
  g.moveTo(x0 - 30 * u, floorY);
  g.lineTo(x0 + L * k + 30 * u, floorY);
  g.stroke();

  if (dims) {
    g.font = `500 ${15 * u}px Outfit, Helvetica, Arial, sans-serif`;
    g.textBaseline = "middle";
    const chip = (text: string, x: number, y: number, rot = 0) => {
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      const tw = g.measureText(text).width + 12 * u;
      g.fillStyle = PAPER;
      g.fillRect(-tw / 2, -11 * u, tw, 22 * u);
      g.fillStyle = DIM;
      g.textAlign = "center";
      g.fillText(text, 0, 0);
      g.restore();
    };
    const hDim = (xa: number, xb: number, y: number, text: string, ext0: number, ext1: number) => {
      g.strokeStyle = DIM;
      g.lineWidth = Math.max(1, 1.2 * u);
      g.beginPath();
      g.moveTo(xa, y); g.lineTo(xb, y);
      g.moveTo(xa, ext0); g.lineTo(xa, y - 6 * u * Math.sign(ext0 - y || 1));
      g.moveTo(xb, ext1); g.lineTo(xb, y - 6 * u * Math.sign(ext1 - y || 1));
      g.stroke();
      g.lineWidth = Math.max(1.5, 2 * u);
      for (const x of [xa, xb]) { g.beginPath(); g.moveTo(x - 6 * u, y + 6 * u); g.lineTo(x + 6 * u, y - 6 * u); g.stroke(); }
      chip(text, (xa + xb) / 2, y);
    };
    const vDim = (x: number, ya: number, yb: number, text: string) => {
      g.strokeStyle = DIM;
      g.lineWidth = Math.max(1, 1.2 * u);
      g.beginPath();
      g.moveTo(x, ya); g.lineTo(x, yb);
      g.stroke();
      g.lineWidth = Math.max(1.5, 2 * u);
      for (const y of [ya, yb]) { g.beginPath(); g.moveTo(x - 6 * u, y + 6 * u); g.lineTo(x + 6 * u, y - 6 * u); g.stroke(); }
      chip(text, x, (ya + yb) / 2, -Math.PI / 2);
    };

    // overall width above, overall height at the right
    hDim(x0, x0 + L * k, Y(Hm) - 46 * u, len(L), Y(Hm) - 8 * u, Y(Hm) - 8 * u);
    vDim(x0 + L * k + 52 * u, Y(Hm), floorY, len(Hm));

    // each opening: its width under it... above the wall for windows, and how high the sill sits
    for (const h of holes) {
      const [hx, hw] = span(h.s0, h.s1);
      const label = `${len(h.s1 - h.s0)} × ${len(h.top - h.bot)}`;
      chip(label, hx + hw / 2, Y(h.top) + Math.min(24 * u, ((h.top - h.bot) * k) / 2));
      if (h.bot > 0.05) vDim(hx - 18 * u, Y(h.bot), floorY, len(h.bot));
    }
  }
  return c;
}
