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
        if (mode === "plan") return plan.current ? { canvas: plan.current, mode } : null;
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
      if (!alive || !planBox.current) return;
      const c = drawFloorPlan(room, unit, { selected: walls, tags: selecting });
      c.className = "block h-full w-full object-contain";
      c.setAttribute("role", "img");
      c.setAttribute("aria-label", "Floor plan of the scanned room");
      planBox.current.replaceChildren(c);
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
  };

  // A tap on the plan picks the nearest wall (the canvas is letterboxed in its box)
  const tapPlan = (e: React.PointerEvent<HTMLDivElement>) => {
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
      {mode === "plan" && <div ref={planBox} onPointerUp={tapPlan} className="absolute inset-x-0 bottom-10 top-11 px-2" />}
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
          <div className={`absolute bottom-12 right-3 z-10 flex gap-1 ${mode === "plan" ? "hidden" : ""} ${pill}`}>
            <button type="button" aria-label="Zoom out" onClick={() => api.current?.zoom(0.8)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ivory active:scale-95">
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Zoom in" onClick={() => api.current?.zoom(1.25)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ivory active:scale-95">
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
