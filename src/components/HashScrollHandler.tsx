import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Smooth-scrolls to the element matching location.hash whenever it changes.
 * Retries briefly to handle lazy-loaded sections (Suspense) that mount after
 * the initial render.
 */
const HashScrollHandler = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      // On non-hash navigation, scroll to top for a clean page load.
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const id = hash.replace("#", "");
    let attempts = 0;
    const maxAttempts = 40; // ~2s at 50ms intervals

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (++attempts < maxAttempts) {
        window.setTimeout(tryScroll, 50);
      }
    };

    // Defer to next frame so the route's content has time to mount.
    window.requestAnimationFrame(tryScroll);
  }, [pathname, hash, key]);

  return null;
};

export default HashScrollHandler;
