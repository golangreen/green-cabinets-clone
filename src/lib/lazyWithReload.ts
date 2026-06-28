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
          window.location.reload();
          // Return a never-resolving promise so Suspense stays mounted during reload.
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw err;
    }
  });
}
