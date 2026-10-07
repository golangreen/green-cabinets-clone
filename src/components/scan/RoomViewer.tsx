import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Room3DApi } from "@/lib/scan/room3d";
import type { ScannedRoom } from "@/lib/scan/roomScan";
import { feet, sqft } from "@/lib/scan/roomScan";
import { NOTICE_SHORT } from "@/lib/scan/watermark";
import logoWhite from "@/assets/logos/logo-white.svg";

export interface RoomViewerHandle {
  snapshot: () => HTMLCanvasElement | null;
}

/**
 * The scanned room in 3D (one finger turns it, two pinch and slide), always
 * framed by the Green Cabinets mark and the confidential line. Long-press and
 * right-click saving are off on the canvas; the only way out is the branded
 * export.
 */
const RoomViewer = forwardRef<RoomViewerHandle, { room: ScannedRoom; sample?: boolean }>(({ room, sample }, ref) => {
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<Room3DApi | null>(null);
  const [mode, setMode] = useState<"3d" | "top">("3d");
  const [failed, setFailed] = useState(false);

  useImperativeHandle(ref, () => ({ snapshot: () => api.current?.snapshot() ?? null }), []);

  useEffect(() => {
    let alive = true;
    // three.js loads only on this page, never with the rest of the site
    import("@/lib/scan/room3d")
      .then((mod) => {
        if (!alive || !box.current) return;
        try {
          api.current = mod.mountRoom3D(box.current, room, { fmt: feet, area: sqft });
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

  const setView = (m: "3d" | "top") => {
    setMode(m);
    api.current?.view(m);
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

      <div ref={box} className="relative h-[58svh] min-h-[320px] w-full md:h-[62svh]" />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-8 text-center font-display text-sm text-ink">
          This device can't show the 3D view. Your scan is still saved and can be sent.
        </p>
      )}

      <div className="absolute bottom-12 left-3 z-10 flex rounded-full bg-ink/80 p-1 backdrop-blur">
        {(["3d", "top"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setView(m)}
            aria-pressed={mode === m}
            className={`min-h-[40px] rounded-full px-4 font-display text-sm transition-colors active:scale-[0.97] ${
              mode === m ? "bg-ivory text-ink" : "text-ivory/80"
            }`}
          >
            {m === "3d" ? "3D" : "Top"}
          </button>
        ))}
      </div>
      <div className="absolute bottom-12 right-3 z-10 flex gap-1 rounded-full bg-ink/80 p-1 backdrop-blur">
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
