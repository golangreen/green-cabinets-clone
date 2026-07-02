import { lazy, type ComponentType } from "react";

const RELOAD_KEY = "__lovable_lazy_reload_count__";
const MAX_RELOADS = 2;

const isChunkError = (err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError|Loading chunk [\d]+ failed|error loading dynamically imported module/i.test(
    msg,
  );
};

const getCount = () => {
  try { return parseInt(sessionStorage.getItem(RELOAD_KEY) || "0", 10) || 0; } catch { return 0; }
};
const setCount = (n: number) => { try { sessionStorage.setItem(RELOAD_KEY, String(n)); } catch {} };
const clearCount = () => { try { sessionStorage.removeItem(RELOAD_KEY); } catch {} };

if (typeof window !== "undefined") {
  // Once the app fully loads, reset so future deploys can trigger a fresh reload cycle.
  window.addEventListener("load", () => setTimeout(clearCount, 2_000));
}

const hardReload = () => {
  const url = new URL(window.location.href);
  url.searchParams.set("_r", Date.now().toString(36));
  window.location.replace(url.toString());
};

export function lazyWithReload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  const tryLoad = async (): Promise<{ default: T }> => {
    try {
      const mod = await factory();
      clearCount();
      return mod;
    } catch (err) {
      if (!isChunkError(err) || typeof window === "undefined") throw err;
      // brief backoff then retry once in-place (covers Vite dep re-optimize)
      await new Promise((r) => setTimeout(r, 300));
      try {
        const mod = await factory();
        clearCount();
        return mod;
      } catch (err2) {
        const n = getCount();
        if (n < MAX_RELOADS) {
          setCount(n + 1);
          hardReload();
          return new Promise<{ default: T }>(() => {}); // hang until reload
        }
        throw err2;
      }
    }
  };
  return lazy(tryLoad);
}
