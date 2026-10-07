/**
 * Every picture that leaves the app is branded and marked confidential: the
 * Green Cabinets logo and name on top, a faint diagonal "confidential" mark
 * across the room, and the no-sharing notice with the scan's ID underneath.
 * It is all drawn into the pixels, so it travels with the file.
 */
import logoUrl from "@/assets/logos/logo-white.svg";

export const NOTICE_SHORT = "Confidential. Prepared for Green Cabinets NY only.";
export const NOTICE_LONG =
  "This room scan was made with the Green Cabinets app for a project with Green Cabinets NY. " +
  "It may not be shared with or used by other cabinet companies, contractors or designers.";

const INK = "#0E0D0C";
const IVORY = "#F2ECE2";
const BRASS = "#C6A15B";
const STONE = "#A39C91";

export interface WatermarkMeta {
  scanId: string;
  date: string;
  client?: string;
  sample?: boolean;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (g.measureText(next).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function brandSnapshot(shot: HTMLCanvasElement, meta: WatermarkMeta): Promise<HTMLCanvasElement> {
  await document.fonts?.ready;
  const W = shot.width;
  const u = W / 1000; // one design unit, so the layout scales with the picture
  const head = Math.round(96 * u);
  const foot = Math.round(150 * u);
  const H = head + shot.height + foot;

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;

  // Header: logo, name, what this is
  g.fillStyle = INK;
  g.fillRect(0, 0, W, H);
  try {
    const logo = await loadImage(logoUrl);
    const lh = 58 * u;
    const lw = (logo.width / logo.height) * lh;
    g.drawImage(logo, 32 * u, (head - lh) / 2, lw, lh);
    g.fillStyle = IVORY;
    g.font = `500 ${34 * u}px "Cormorant Garamond", Georgia, serif`;
    g.textBaseline = "middle";
    g.fillText("Green Cabinets NY", 32 * u + lw + 16 * u, head / 2);
  } catch {
    g.fillStyle = IVORY;
    g.font = `500 ${34 * u}px "Cormorant Garamond", Georgia, serif`;
    g.textBaseline = "middle";
    g.fillText("Green Cabinets NY", 32 * u, head / 2);
  }
  g.textAlign = "right";
  g.fillStyle = BRASS;
  g.font = `500 ${15 * u}px Outfit, Helvetica, Arial, sans-serif`;
  g.fillText((meta.sample ? "SAMPLE ROOM SCAN" : "ROOM SCAN").split("").join(String.fromCharCode(8202)), W - 32 * u, head / 2 - 11 * u);
  g.fillStyle = STONE;
  g.font = `400 ${15 * u}px Outfit, Helvetica, Arial, sans-serif`;
  g.fillText(meta.client ? `${meta.client} · ${meta.date}` : meta.date, W - 32 * u, head / 2 + 13 * u);
  g.textAlign = "left";

  // The room
  g.drawImage(shot, 0, head);

  // Diagonal confidential mark, faint, tiled over the room only
  g.save();
  g.beginPath();
  g.rect(0, head, W, shot.height);
  g.clip();
  g.translate(W / 2, head + shot.height / 2);
  g.rotate(-Math.PI / 7);
  g.font = `600 ${22 * u}px Outfit, Helvetica, Arial, sans-serif`;
  g.fillStyle = "rgba(14, 13, 12, 0.07)";
  g.textAlign = "center";
  const mark = meta.sample ? "SAMPLE · GREEN CABINETS NY" : "CONFIDENTIAL · GREEN CABINETS NY";
  const stepX = g.measureText(mark).width + 90 * u;
  const stepY = 120 * u;
  for (let y = -H; y < H; y += stepY) {
    const shift = (Math.round(y / stepY) % 2) * (stepX / 2);
    for (let x = -W * 1.5; x < W * 1.5; x += stepX) g.fillText(mark, x + shift, y);
  }
  g.restore();

  // Footer: the notice and the scan ID
  const fy = head + shot.height;
  g.fillStyle = BRASS;
  g.fillRect(32 * u, fy + 24 * u, 48 * u, Math.max(1, 2 * u));
  g.fillStyle = IVORY;
  g.font = `500 ${17 * u}px Outfit, Helvetica, Arial, sans-serif`;
  g.textBaseline = "top";
  g.fillText(NOTICE_SHORT, 32 * u, fy + 40 * u);
  g.fillStyle = STONE;
  g.font = `400 ${14 * u}px Outfit, Helvetica, Arial, sans-serif`;
  wrap(g, NOTICE_LONG, W - 64 * u).forEach((l, i) => g.fillText(l, 32 * u, fy + 68 * u + i * 20 * u));
  g.textAlign = "right";
  g.fillText(`Scan ${meta.scanId} · greencabinetsny.com · © Green Cabinets NY`, W - 32 * u, fy + foot - 30 * u);
  return c;
}

/** Short, readable ID that ties a picture back to the scan Green Cabinets received. */
export function newScanId(): string {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint8Array(6));
  return "GC-" + Array.from(r, (n) => a[n % a.length]).join("");
}
