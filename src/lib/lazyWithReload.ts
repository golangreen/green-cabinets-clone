import { lazy, type ComponentType } from "react";
import {
  clearModuleLoadRecoveryFlag,
  isModuleLoadError,
  recoverFromModuleLoadError,
} from "@/lib/moduleLoadRecovery";

/**
 * React.lazy wrapper that triggers a one-time hard reload when a chunk fails
 * to load — typically caused by stale hashed asset URLs after a deploy. The
 * rejected import inside Suspense never reaches window.onunhandledrejection,
 * so we catch it here.
 */
if (typeof window !== "undefined") {
  // Clear the one-shot reload flag once the app successfully mounts, so a
  // future stale-chunk error after the next deploy can trigger another reload.
  window.addEventListener("load", () => clearModuleLoadRecoveryFlag(4_000));
}

export function lazyWithReload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      if (isModuleLoadError(err) && typeof window !== "undefined") {
        if (recoverFromModuleLoadError("lazy route chunk failed")) {
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
