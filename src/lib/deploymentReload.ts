/**
 * Detects new deployments and reloads the page to avoid stale hashed asset errors.
 *
 * Two strategies:
 *  1. Poll index.html and compare the set of hashed asset URLs. If they change,
 *     a new deployment is live — reload.
 *  2. Listen for module/chunk load errors caused by missing old hashed files
 *     and force a one-time hard reload.
 */

const POLL_INTERVAL_MS = 60_000; // 1 minute
const RELOAD_FLAG = "__lovable_reloaded_for_new_deploy__";

function extractAssetFingerprint(html: string): string {
  // Match script/link hrefs to /assets/<hash>.{js,css}
  const matches = html.match(/\/assets\/[A-Za-z0-9_-]+\.(?:js|css)/g) ?? [];
  return matches.sort().join("|");
}

async function fetchCurrentFingerprint(): Promise<string | null> {
  try {
    const res = await fetch(`/index.html?_=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractAssetFingerprint(html);
  } catch {
    return null;
  }
}

function reloadOnce(reason: string) {
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, "1");
  // eslint-disable-next-line no-console
  console.info(`[deploymentReload] Reloading: ${reason}`);
  window.location.reload();
}

export function initDeploymentReload() {
  if (typeof window === "undefined") return;



  // Clear the reload flag after a successful load so future deploys can trigger again.
  window.addEventListener("load", () => {
    setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 5_000);
  });

  if (!import.meta.env.DEV) {
    let baseline: string | null = null;
    fetchCurrentFingerprint().then((fp) => {
      baseline = fp;
    });

    const check = async () => {
      if (document.visibilityState !== "visible") return;
      const current = await fetchCurrentFingerprint();
      if (!current) return;
      if (!baseline) {
        baseline = current;
        return;
      }
      if (current !== baseline) {
        reloadOnce("new deployment detected");
      }
    };

    setInterval(check, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
  }


  // Catch failed dynamic imports / missing chunks from old hashed assets.
  const isChunkError = (msg: string) =>
    /Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError|Loading chunk [\d]+ failed/i.test(
      msg,
    );

  window.addEventListener("error", (e) => {
    const msg = e?.message || (e as any)?.error?.message || "";
    if (isChunkError(msg)) reloadOnce("module script load failed");
  });

  window.addEventListener("unhandledrejection", (e) => {
    const msg = (e?.reason && (e.reason.message || String(e.reason))) || "";
    if (isChunkError(msg)) reloadOnce("module script load failed (promise)");
  });
}
