import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Smooth-scrolls to the element matching location.hash, offsetting for the
 * fixed/sticky site header so the section title isn't hidden underneath.
 * Re-corrects while content above keeps shifting (lazy Suspense, late images).
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
    const totalMs = 2500;
    const extraGap = 16; // breathing room below the header
    let lastTarget = -1;
    let stableCount = 0;
    let timer = 0;

    const getHeaderOffset = () => {
      const header =
        document.querySelector("header") as HTMLElement | null;
      return (header?.getBoundingClientRect().height ?? 0) + extraGap;
    };

    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        const offset = getHeaderOffset();
        const target =
          el.getBoundingClientRect().top + window.scrollY - offset;

        if (Math.abs(target - lastTarget) < 1) {
          stableCount++;
        } else {
          stableCount = 0;
          lastTarget = target;
          window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        }
      }
      if (performance.now() - start < totalMs && stableCount < 4) {
        timer = window.setTimeout(tick, 100);
      }
    };

    window.requestAnimationFrame(tick);
    return () => window.clearTimeout(timer);
  }, [pathname, hash, key]);

  return null;
};

export default HashScrollHandler;
