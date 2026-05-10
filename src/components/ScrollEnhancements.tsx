/**
 * ScrollEnhancements — vertical scroll progress bar pinned to the right
 * edge of the viewport. Shows how far you've read and lets you click or
 * drag along it to jump to any point on the page. Positioned on the side
 * so it's easy to grab with a finger or mouse without blocking content.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const ScrollEnhancements = () => {
  const [progress, setProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  // Debug overlay: enable with ?debug=scroll in the URL.
  const debug = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "scroll";
  const [stats, setStats] = useState({
    pageTop: 0, height: 0, scrollHeight: 0, max: 0, target: 0,
    source: "window" as "vv" | "window",
  });

  useEffect(() => {
    const vv = window.visualViewport;
    let target = 0;
    let current = 0;
    let ticking = false;

    const compute = () => {
      const doc = document.documentElement;
      // Use visualViewport height when available — on iOS this stays
      // stable as the URL bar shows/hides, preventing the `max` value
      // (and therefore the progress %) from jittering mid-scroll.
      const viewportH = vv?.height ?? doc.clientHeight;
      const scrollY = vv ? vv.pageTop : window.scrollY;
      const max = doc.scrollHeight - viewportH;
      target = max > 0 ? Math.max(0, Math.min(100, (scrollY / max) * 100)) : 0;
      if (debug) {
        setStats({
          pageTop: scrollY,
          height: viewportH,
          scrollHeight: doc.scrollHeight,
          max,
          target,
          source: vv ? "vv" : "window",
        });
      }
    };

    const tick = () => {
      // Smooth between sparse iOS scroll events: ease current toward target.
      const diff = target - current;
      if (Math.abs(diff) < 0.05) {
        current = target;
        setProgress(current);
        rafRef.current = null;
        ticking = false;
        return;
      }
      current += diff * 0.25;
      setProgress(current);
      rafRef.current = requestAnimationFrame(tick);
    };

    const schedule = () => {
      compute();
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    compute();
    current = target;
    setProgress(current);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    vv?.addEventListener("scroll", schedule);
    vv?.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      vv?.removeEventListener("resize", schedule);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scrubTo = useCallback((clientY: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    window.scrollTo({ top: ratio * max, behavior: "auto" });
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    scrubTo(e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    scrubTo(e.clientY);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch { /* ignore */ }
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Page scroll progress"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="fixed right-2 top-24 bottom-24 z-[200] w-[10px] rounded-full bg-black/15 cursor-pointer touch-none select-none backdrop-blur-sm"
    >
      <div
        className="absolute top-0 left-0 right-0 rounded-full bg-[#5C7650] shadow-[0_0_12px_rgba(92,118,80,0.9)] pointer-events-none"
        style={{ height: `${progress}%` }}
      />
    </div>
  );
};

export default ScrollEnhancements;
