/**
 * ScrollEnhancements — interactive scroll progress bar pinned to the very
 * top of the viewport. Shows how far you've read and lets you click or
 * drag along it to jump to any point on the page.
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

  const scrubTo = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    window.scrollTo({ top: ratio * max, behavior: "auto" });
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    scrubTo(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    scrubTo(e.clientX);
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
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="fixed top-0 left-0 right-0 z-[200] h-[8px] bg-black/20 cursor-pointer touch-none select-none"
    >
      <div
        className="h-full bg-[#5C7650] shadow-[0_0_12px_rgba(92,118,80,0.9)] transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
      {/* Draggable thumb at the leading edge */}
      <div
        className="absolute -top-[4px] h-4 w-4 rounded-full bg-[#5C7650] shadow-lg ring-2 ring-white transition-[left] duration-100 ease-out"
        style={{ left: `calc(${progress}% - 8px)` }}
      />
    </div>
  );
};

export default ScrollEnhancements;
