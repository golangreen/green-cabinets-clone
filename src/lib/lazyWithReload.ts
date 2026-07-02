import { lazy, type ComponentType } from "react";

const RELOAD_FLAG = "__lovable_lazy_reload__";

const isChunkError = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError|Loading chunk [\d]+ failed/i.test(
    msg,
  );
};

/**
 * React.lazy wrapper that triggers a one-time hard reload when a chunk fails
 * to load — typically caused by stale hashed asset URLs after a deploy. The
 * rejected import inside Suspense never reaches window.onunhandledrejection,
 * so we catch it here.
 */
if (typeof window !== "undefined") {
  // Clear the one-shot reload flag once the app successfully mounts, so a
  // future stale-chunk error after the next deploy can trigger another reload.
  window.addEventListener("load", () => {
    setTimeout(() => {
      try { sessionStorage.removeItem(RELOAD_FLAG); } catch {}
    }, 4_000);
  });
}

export function lazyWithReload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (isChunkError(err) && typeof window !== "undefined") {
        const already = sessionStorage.getItem(RELOAD_FLAG);
        if (!already) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          // Cache-bust: append a query so the browser bypasses any stale SW/CDN copy.
          const url = new URL(window.location.href);
          url.searchParams.set("_r", Date.now().toString(36));
          window.location.replace(url.toString());
          // Return a never-resolving promise so Suspense stays mounted during reload.
          return new Promise<{ default: T }>(() => {});
        }
        // Already tried once — try one more direct retry before surfacing the error,
        // in case Vite's dep optimizer just finished re-bundling.
        try {
          await new Promise((r) => setTimeout(r, 250));
          return await factory();
        } catch {
          /* fall through to throw */
        }
      }
      throw err;
    }
  });
}
