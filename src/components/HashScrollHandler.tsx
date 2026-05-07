import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Smooth-scrolls to the element matching location.hash.
 * Re-scrolls while content above the target keeps shifting (e.g. lazy
 * Suspense sections, late-loaded images), until the position stabilizes
 * or a max duration elapses.
 */
const HashScrollHandler = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const id = hash.replace("#", "");
    const start = performance.now();
    const totalMs = 2500; // keep correcting for ~2.5s after navigation
    let lastTop = -1;
    let stableCount = 0;
    let frame = 0;

    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (Math.abs(top - lastTop) < 1) {
          stableCount++;
        } else {
          stableCount = 0;
          lastTop = top;
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      if (performance.now() - start < totalMs && stableCount < 4) {
        frame = window.setTimeout(tick, 100);
      }
    };

    window.requestAnimationFrame(tick);
    return () => window.clearTimeout(frame);
  }, [pathname, hash, key]);

  return null;
};

export default HashScrollHandler;
