/**
 * ScrollEnhancements — thin green reading-progress bar pinned to the very
 * top of the viewport. Fills as the user scrolls down the page.
 */
import { useEffect, useRef, useState } from "react";

const ScrollEnhancements = () => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

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

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-[#5C7650] transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(92,118,80,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ScrollEnhancements;
