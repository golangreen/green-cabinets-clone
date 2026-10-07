import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Room3DApi } from "@/lib/scan/room3d";
import type { ScannedRoom, Unit } from "@/lib/scan/roomScan";
import { areaIn, lengthIn } from "@/lib/scan/roomScan";
import { drawFloorPlan } from "@/lib/scan/floorPlan";
import { NOTICE_SHORT } from "@/lib/scan/watermark";
import logoWhite from "@/assets/logos/logo-white.svg";

export type ViewMode = "3d" | "top" | "plan";

export const VIEW_TITLES: Record<ViewMode, string> = { "3d": "Room in 3D", top: "Top view", plan: "Floor plan" };

export interface RoomViewerHandle {
  /** Exactly what is framed right now (view, angle, zoom, units), as a picture. */
  snapshot: () => { canvas: HTMLCanvasElement; mode: ViewMode } | null;
}

/**
 * The scanned room in 3D (one finger turns it, two pinch and slide), always
 * framed by the Green Cabinets mark and the confidential line. Long-press and
 * right-click saving are off on the canvas; the only way out is the branded
 * export.
 */
interface Props {
  room: ScannedRoom;
  sample?: boolean;
  unit: Unit;
}

const RoomViewer = forwardRef<RoomViewerHandle, Props>(({ room, sample, unit }, ref) => {
  const box = useRef<HTMLDivElement>(null);
  const planBox = useRef<HTMLDivElement>(null);
  const plan = useRef<HTMLCanvasElement | null>(null);
  const api = useRef<Room3DApi | null>(null);
  const unitRef = useRef(unit);
  const [mode, setMode] = useState<ViewMode>("3d");
  const [failed, setFailed] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      snapshot: () => {
        if (mode === "plan") return plan.current ? { canvas: plan.current, mode } : null;
        const canvas = api.current?.snapshot();
        return canvas ? { canvas, mode } : null;
      },
    }),
    [mode],
  );

  // Sizes in the chosen unit, live on the 3D and redrawn on the plan
  useEffect(() => {
    unitRef.current = unit;
    api.current?.units(lengthIn(unit));
  }, [unit]);

  useEffect(() => {
    if (mode !== "plan") return;
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (!alive || !planBox.current) return;
      const c = drawFloorPlan(room, unit);
      c.className = "block h-full w-full object-contain";
      c.setAttribute("role", "img");
      c.setAttribute("aria-label", "Floor plan of the scanned room");
      planBox.current.replaceChildren(c);
      plan.current = c;
    });
    return () => {
      alive = false;
    };
  }, [mode, room, unit]);

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

  const setView = (m: ViewMode) => {
    setMode(m);
    if (m !== "plan") api.current?.view(m);
  };

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

      <div ref={box} className={`relative h-[58svh] min-h-[320px] w-full md:h-[62svh] ${mode === "plan" ? "invisible" : ""}`} />
      {mode === "plan" && <div ref={planBox} className="absolute inset-x-0 bottom-10 top-11 px-2" />}
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-8 text-center font-display text-sm text-ink">
          This device can't show the 3D view. Your scan is still saved and can be sent.
        </p>
      )}

      <div className="absolute bottom-12 left-3 z-10 flex rounded-full bg-ink/80 p-1 backdrop-blur">
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
      <div className={`absolute bottom-12 right-3 z-10 flex gap-1 ${mode === "plan" ? "hidden" : ""} rounded-full bg-ink/80 p-1 backdrop-blur`}>
        <button type="button" aria-label="Zoom out" onClick={() => api.current?.zoom(0.8)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ivory active:scale-95">
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => api.current?.zoom(1.25)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ivory active:scale-95">
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="absolute inset-x-0 bottom-0 z-10 bg-ink/85 px-3 py-2 text-center font-display text-[0.72rem] text-ivory/80 backdrop-blur">
        {NOTICE_SHORT}
      </p>
    </div>
  );
});
RoomViewer.displayName = "RoomViewer";

export default RoomViewer;
