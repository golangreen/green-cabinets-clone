import type { ScannedRoom } from "./roomScan";

export interface Room3DOptions {
  names?: string[];
  parts?: unknown[];
  fmt?: (m: number) => string;
  area?: (m2: number) => string;
  onPick?: (info: unknown) => void;
  onLost?: () => void;
  light?: boolean;
  onPerf?: (msPerFrame: number) => void;
  transparent?: boolean;
  /** Colour of picked walls (hex number). */
  accent?: number;
}

export interface Room3DApi {
  view: (name: string) => void;
  zoom: (factor: number) => void;
  sizes: (on: boolean) => void;
  units: (fmt: (m: number) => string) => void;
  selectMode: (on: boolean, onSelect?: ((walls: number[]) => void) | null) => void;
  setSelected: (walls: number[]) => void;
  snapshotWall: (wall: number) => HTMLCanvasElement | null;
  snapshot: () => HTMLCanvasElement;
  still: () => void;
  pause: (on: boolean) => void;
  dispose: () => void;
}

export function mountRoom3D(el: HTMLElement, room: ScannedRoom, opts?: Room3DOptions): Room3DApi;
