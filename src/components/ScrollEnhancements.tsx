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

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
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
        className="absolute top-0 left-0 right-0 rounded-full bg-[#5C7650] shadow-[0_0_12px_rgba(92,118,80,0.9)] transition-[height] duration-100 ease-out"
        style={{ height: `${progress}%` }}
      />
      {/* Draggable thumb at the leading edge */}
      <div
        className="absolute -left-[5px] h-5 w-5 rounded-full bg-[#5C7650] shadow-lg ring-2 ring-white transition-[top] duration-100 ease-out"
        style={{ top: `calc(${progress}% - 10px)` }}
      />
    </div>
  );
};

export default ScrollEnhancements;
