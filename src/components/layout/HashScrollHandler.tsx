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

    const id = decodeURIComponent(hash.replace("#", ""));
    const start = performance.now();
    // Wait up to 8s for the target to appear (lazy routes + late images),
    // then keep correcting for another ~2s of layout shifts after first hit.
    const findDeadline = 8000;
    const settleAfterFoundMs = 2500;
    const extraGap = 16;
    let firstFoundAt = 0;
    let lastTarget = -1;
    let stableCount = 0;
    let timer = 0;
    let mo: MutationObserver | null = null;

    const getHeaderOffset = () => {
      const header = document.querySelector("header") as HTMLElement | null;
      return (header?.getBoundingClientRect().height ?? 0) + extraGap;
    };

    const tick = () => {
      const el = document.getElementById(id);
      const now = performance.now();

      if (el) {
        if (!firstFoundAt) firstFoundAt = now;
        const offset = getHeaderOffset();
        const target = el.getBoundingClientRect().top + window.scrollY - offset;

        if (Math.abs(target - lastTarget) < 1) {
          stableCount++;
        } else {
          stableCount = 0;
          lastTarget = target;
          window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        }

        if (stableCount >= 4 || now - firstFoundAt > settleAfterFoundMs) {
          mo?.disconnect();
          return;
        }
      } else if (now - start > findDeadline) {
        mo?.disconnect();
        return;
      }

      timer = window.setTimeout(tick, 100);
    };

    // If the element is not in the DOM yet (lazy route), watch for it.
    if (!document.getElementById(id)) {
      mo = new MutationObserver(() => {
        if (document.getElementById(id)) {
          window.clearTimeout(timer);
          tick();
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    window.requestAnimationFrame(tick);
    return () => {
      window.clearTimeout(timer);
      mo?.disconnect();
    };
  }, [pathname, hash, key]);

  return null;
};

export default HashScrollHandler;
