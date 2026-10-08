import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { Room3DApi } from "@/lib/scan/room3d";
import type { ScannedRoom, Unit } from "@/lib/scan/roomScan";
import { areaIn, lengthIn } from "@/lib/scan/roomScan";
import { drawFloorPlan, type PlanCanvas } from "@/lib/scan/floorPlan";
import { drawWallElevation } from "@/lib/scan/elevation";
import { NOTICE_SHORT } from "@/lib/scan/watermark";
import logoWhite from "@/assets/logos/logo-white.svg";

export type ViewMode = "3d" | "top" | "plan";

export const VIEW_TITLES: Record<ViewMode, string> = { "3d": "Room in 3D", top: "Top view", plan: "Floor plan" };

export interface RoomViewerHandle {
  /** Exactly what is framed right now (view, angle, zoom, units), as a picture. */
  snapshot: () => { canvas: HTMLCanvasElement; mode: ViewMode } | null;
  /** For each picked wall: its flat drawing and its 3D view. */
  wallShots: () => { canvas: HTMLCanvasElement; title: string }[];
}

interface Props {
  room: ScannedRoom;
  sample?: boolean;
  unit: Unit;
  /** The walls picked with Select (0-based), whenever they change. */
  onWallsChange?: (walls: number[]) => void;
}

/**
 * The scanned room in 3D (one finger turns it, two pinch and slide), always
 * framed by the Green Cabinets mark and the confidential line. Long-press and
 * right-click saving are off on the canvas; the only way out is the branded
 * export. Select lets a person tap the walls they want; the rest fades.
 */
const RoomViewer = forwardRef<RoomViewerHandle, Props>(({ room, sample, unit, onWallsChange }, ref) => {
  const box = useRef<HTMLDivElement>(null);
  const planBox = useRef<HTMLDivElement>(null);
  const planStage = useRef<HTMLDivElement>(null);
  // Plan pan and zoom: k is the zoom, x/y the offset in screen pixels
  const pv = useRef({ k: 1, x: 0, y: 0 });
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ moved: 0, dist: 0 });
  const plan = useRef<PlanCanvas | null>(null);
  const api = useRef<Room3DApi | null>(null);
  const unitRef = useRef(unit);
  const [mode, setMode] = useState<ViewMode>("3d");
  const [failed, setFailed] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [walls, setWalls] = useState<number[]>([]);

  const changeWalls = useCallback(
    (list: number[]) => {
      setWalls(list);
      api.current?.setSelected(list);
      onWallsChange?.(list);
    },
    [onWallsChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      snapshot: () => {
        if (mode === "plan") return plan.current ? { canvas: framedPlan(), mode } : null;
        const canvas = api.current?.snapshot();
        return canvas ? { canvas, mode } : null;
      },
      wallShots: () =>
        walls.flatMap((wi) => {
          const out = [{ canvas: drawWallElevation(room, wi, unitRef.current), title: `Wall ${wi + 1} drawing` }];
          const view = api.current?.snapshotWall(wi);
          if (view) out.push({ canvas: view, title: `Wall ${wi + 1} in 3D` });
          return out;
        }),
    }),
    [mode, walls, room],
  );

  // Sizes in the chosen unit, live on the 3D and redrawn on the plan
  useEffect(() => {
    unitRef.current = unit;
    api.current?.units(lengthIn(unit));
  }, [unit]);

  // The 3D follows select mode; a tap there toggles a wall
  useEffect(() => {
    api.current?.selectMode(selecting, (list: number[]) => changeWalls(list));
  }, [selecting, changeWalls]);

  useEffect(() => {
    if (mode !== "plan") return;
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!alive || !planStage.current) return;
      const c = drawFloorPlan(room, unit, { selected: walls, tags: selecting });
      c.className = "block h-full w-full object-contain";
      c.setAttribute("role", "img");
      c.setAttribute("aria-label", "Floor plan of the scanned room");
      planStage.current.replaceChildren(c);
      plan.current = c;
    });
    return () => {
      alive = false;
    };
  }, [mode, room, unit, walls, selecting]);

  useEffect(() => {
    let alive = true;
    // three.js loads only on this page, never with the rest of the site
    import("@/lib/scan/room3d")
      .then((mod) => {
        if (!alive || !box.current) return;
        try {
          api.current = mod.mountRoom3D(box.current, room, { fmt: lengthIn(unitRef.current), area: areaIn(unitRef.current) });
          api.current.units(lengthIn(unitRef.current));
          api.current.view("3d");
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      alive = false;
      api.current?.dispose();
      api.current = null;
    };
  }, [room]);

  // A new scan starts with nothing picked
  useEffect(() => {
    setSelecting(false);
    setWalls([]);
    onWallsChange?.([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const setView = (m: ViewMode) => {
    setMode(m);
    if (m !== "plan") api.current?.view(m);
    else setPlanView(1, 0, 0);
  };

  // --- Plan pan and zoom (drag to move, pinch or scroll to zoom, the +/- buttons too) ---
  const setPlanView = (k: number, x: number, y: number) => {
    const box = planBox.current;
    const stage = planStage.current;
    k = Math.min(6, Math.max(1, k));
    if (box) {
      // Keep the drawing on screen: never pan past its edges
      const w = box.clientWidth;
      const h = box.clientHeight;
      x = Math.min(0, Math.max(w - w * k, x));
      y = Math.min(0, Math.max(h - h * k, y));
    }
    pv.current = { k, x, y };
    if (stage) stage.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  };

  /** Zoom by f around a point given in the plan box's own pixels. */
  const zoomPlanAt = (f: number, px: number, py: number) => {
    const { k, x, y } = pv.current;
    const nk = Math.min(6, Math.max(1, k * f));
    const r = nk / k;
    setPlanView(nk, px - (px - x) * r, py - (py - y) * r);
  };

  const zoomBy = (f: number) => {
    if (mode !== "plan") return api.current?.zoom(f);
    const box = planBox.current;
    if (box) zoomPlanAt(f, box.clientWidth / 2, box.clientHeight / 2);
  };

  const local = (e: { clientX: number; clientY: number }) => {
    const r = planBox.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const planDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    touches.current.set(e.pointerId, local(e));
    if (touches.current.size === 1) gesture.current.moved = 0;
    if (touches.current.size === 2) {
      const [a, b] = [...touches.current.values()];
      gesture.current.dist = Math.hypot(a.x - b.x, a.y - b.y);
      gesture.current.moved = 99; // a pinch is never a tap
    }
  };

  const planMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = touches.current.get(e.pointerId);
    if (!prev) return;
    const now = local(e);
    if (touches.current.size === 1) {
      gesture.current.moved += Math.abs(now.x - prev.x) + Math.abs(now.y - prev.y);
      const { k, x, y } = pv.current;
      setPlanView(k, x + now.x - prev.x, y + now.y - prev.y);
    }
    touches.current.set(e.pointerId, now);
    if (touches.current.size === 2) {
      const [a, b] = [...touches.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (gesture.current.dist > 0) zoomPlanAt(d / gesture.current.dist, (a.x + b.x) / 2, (a.y + b.y) / 2);
      gesture.current.dist = d;
    }
  };

  const planUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const was = touches.current.size;
    touches.current.delete(e.pointerId);
    if (touches.current.size < 2) gesture.current.dist = 0;
    // A tap (not a drag or pinch) picks a wall while selecting
    if (was === 1 && gesture.current.moved < 8) tapPlan(e);
  };

  // Scroll wheel and trackpad pinch zoom at the pointer (non-passive, so the page doesn't scroll)
  useEffect(() => {
    const box = planBox.current;
    if (mode !== "plan" || !box) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = box.getBoundingClientRect();
      zoomPlanAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.002)), e.clientX - r.left, e.clientY - r.top);
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /** The plan exactly as framed: when zoomed in, only the part on screen. */
  const framedPlan = (): HTMLCanvasElement => {
    const c = plan.current!;
    const box = planBox.current;
    if (!box || pv.current.k <= 1.001) return c;
    const r = c.getBoundingClientRect();
    const k = Math.min(r.width / c.width, r.height / c.height);
    const left = r.left + (r.width - c.width * k) / 2;
    const top = r.top + (r.height - c.height * k) / 2;
    const b = box.getBoundingClientRect();
    const x0 = Math.max(b.left, left), y0 = Math.max(b.top, top);
    const x1 = Math.min(b.right, left + c.width * k), y1 = Math.min(b.bottom, top + c.height * k);
    const sx = (x0 - left) / k, sy = (y0 - top) / k, sw = (x1 - x0) / k, sh = (y1 - y0) / k;
    if (sw < 2 || sh < 2) return c;
    const out = document.createElement("canvas");
    out.width = 2000;
    out.height = Math.round((2000 * sh) / sw);
    const g = out.getContext("2d")!;
    g.imageSmoothingQuality = "high";
    g.drawImage(c, sx, sy, sw, sh, 0, 0, out.width, out.height);
    return out;
  };

  // A tap on the plan picks the nearest wall (the canvas is letterboxed in its box)
  const tapPlan = (e: { clientX: number; clientY: number }) => {
    const c = plan.current;
    if (!selecting || !c) return;
    const r = c.getBoundingClientRect();
    const k = Math.min(r.width / c.width, r.height / c.height);
    const px = (e.clientX - r.left - (r.width - c.width * k) / 2) / k;
    const py = (e.clientY - r.top - (r.height - c.height * k) / 2) / k;
    const wi = c.wallAt(px, py);
    if (wi < 0) return;
    changeWalls(walls.includes(wi) ? walls.filter((x) => x !== wi) : [...walls, wi].sort((a, b) => a - b));
  };

  const n = walls.length;
  const pill = "rounded-full bg-ink/80 p-1 backdrop-blur";

  return (
    <div
      className="relative overflow-hidden rounded-sm bg-[#F1EFEA] select-none [-webkit-touch-callout:none]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Brand band: on every view of the room */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 bg-ink/85 px-3 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <img src={logoWhite} alt="" className="h-7 w-auto" />
          <span className="font-lux text-lg leading-none text-ivory">Green Cabinets</span>
        </div>
        <span className="font-display text-[0.7rem] uppercase tracking-[0.16em] text-brass">
          {sample ? "Sample" : "Confidential"}
        </span>
      </div>

      {/* Select: one quiet control; once walls are picked it shows how many and clears them */}
      {!selecting && (
        <div className={`absolute right-3 top-14 z-10 flex items-center ${pill}`}>
          <button
            type="button"
            onClick={() => setSelecting(true)}
            className="min-h-[40px] rounded-full px-4 font-display text-sm text-ivory active:scale-[0.97]"
          >
            {n ? `${n} wall${n > 1 ? "s" : ""}` : "Select"}
          </button>
          {n > 0 && (
            <button
              type="button"
              aria-label="Clear the picked walls"
              onClick={() => changeWalls([])}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ivory/80 active:scale-95"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      <div ref={box} className={`relative h-[58svh] min-h-[320px] w-full md:h-[62svh] ${mode === "plan" ? "invisible" : ""}`} />
      {mode === "plan" && (
        <div
          ref={planBox}
          onPointerDown={planDown}
          onPointerMove={planMove}
          onPointerUp={planUp}
          onPointerCancel={planUp}
          onDoubleClick={() => setPlanView(1, 0, 0)}
          className="absolute inset-x-0 bottom-10 top-11 touch-none overflow-hidden px-2"
        >
          <div ref={planStage} className="h-full w-full origin-top-left" />
        </div>
      )}
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-8 text-center font-display text-sm text-ink">
          This device can't show the 3D view. Your scan is still saved and can be sent.
        </p>
      )}

      {selecting ? (
        // While picking: the views stay, the zoom gives way to one line that says what is picked
        <div className={`absolute inset-x-3 bottom-12 z-10 flex items-center justify-between gap-2 ${pill} pl-4`}>
          <span className="font-display text-sm text-ivory" aria-live="polite">
            {n ? `${n} wall${n > 1 ? "s" : ""} picked` : "Tap the walls you want"}
          </span>
          <span className="flex items-center gap-1">
            {n > 0 && (
              <button type="button" onClick={() => changeWalls([])} className="min-h-[40px] rounded-full px-3 font-display text-sm text-ivory/80 active:scale-[0.97]">
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelecting(false)}
              className="min-h-[40px] rounded-full bg-ivory px-4 font-display text-sm text-ink active:scale-[0.97]"
            >
              Done
            </button>
          </span>
        </div>
      ) : (
        <>
          <div className={`absolute bottom-12 left-3 z-10 flex ${pill}`}>
            {(["3d", "top", "plan"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setView(m)}
                aria-pressed={mode === m}
                className={`min-h-[40px] rounded-full px-4 font-display text-sm transition-colors active:scale-[0.97] ${
                  mode === m ? "bg-ivory text-ink" : "text-ivory/80"
                }`}
              >
                {m === "3d" ? "3D" : m === "top" ? "Top" : "Plan"}
              </button>
            ))}
          </div>
          <div className={`absolute bottom-12 right-3 z-10 flex gap-1 ${pill}`}>
            <button type="button" aria-label="Zoom out" onClick={() => zoomBy(0.8)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ivory active:scale-95">
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.25)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ivory active:scale-95">
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </>
      )}

      <p className="absolute inset-x-0 bottom-0 z-10 bg-ink/85 px-3 py-2 text-center font-display text-[0.72rem] text-ivory/80 backdrop-blur">
        {NOTICE_SHORT}
      </p>
    </div>
  );
});
RoomViewer.displayName = "RoomViewer";

export default RoomViewer;
