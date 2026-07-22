const MODULE_RELOAD_FLAG = "__gc_module_reload_count__";
const MODULE_RELOAD_TS = "__gc_module_reload_ts__";
const MODULE_RELOAD_WINDOW_MS = 30_000;
const MODULE_RELOAD_MAX_ATTEMPTS = 2;

const MODULE_LOAD_ERROR_RE =
  /Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError|Loading chunk [\d]+ failed|Outdated Optimize Dep/i;

const STALE_MODULE_URL_RE = /\/node_modules\/\.vite\/deps\/|\/assets\/.*\.(?:js|css)(?:\?|$)/i;

function messageFromUnknown(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error ?? "");
  }
}

function readSessionNumber(key: string): number {
  try {
    return Number(sessionStorage.getItem(key) || "0") || 0;
  } catch {
    return 0;
  }
}

function writeSessionValue(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private browsing; recovery still proceeds.
  }
}

function removeSessionValue(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // noop
  }
}

async function clearStaleBrowserCaches() {
  const tasks: Promise<unknown>[] = [];

  if ("serviceWorker" in navigator) {
    tasks.push(
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.allSettled(registrations.map((registration) => registration.unregister()))),
    );
  }

  if ("caches" in window) {
    tasks.push(caches.keys().then((keys) => Promise.allSettled(keys.map((key) => caches.delete(key)))));
  }

  await Promise.allSettled(tasks);
}

export function isModuleLoadError(error: unknown): boolean {
  const message = messageFromUnknown(error);
  return MODULE_LOAD_ERROR_RE.test(message) || STALE_MODULE_URL_RE.test(message);
}

export function isModuleLoadEvent(event: Event): boolean {
  const errorEvent = event as ErrorEvent;
  const target = event.target as HTMLScriptElement | HTMLLinkElement | null;
  const targetUrl = target && "src" in target ? target.src : target && "href" in target ? target.href : "";
  const message = [errorEvent.message, errorEvent.filename, messageFromUnknown(errorEvent.error), targetUrl]
    .filter(Boolean)
    .join(" ");

  return isModuleLoadError(message);
}

export function recoverFromModuleLoadError(reason = "module load failed"): boolean {
  if (typeof window === "undefined") return false;

  const now = Date.now();
  const lastAttempt = readSessionNumber(MODULE_RELOAD_TS);
  const withinWindow = lastAttempt > 0 && now - lastAttempt < MODULE_RELOAD_WINDOW_MS;
  const attemptCount = withinWindow ? readSessionNumber(MODULE_RELOAD_FLAG) : 0;

  if (attemptCount >= MODULE_RELOAD_MAX_ATTEMPTS) return false;

  writeSessionValue(MODULE_RELOAD_FLAG, String(attemptCount + 1));
  writeSessionValue(MODULE_RELOAD_TS, String(now));

  const url = new URL(window.location.href);
  url.searchParams.set("_r", now.toString(36));

  let navigated = false;
  const navigate = () => {
    if (navigated) return;
    navigated = true;
    window.location.replace(url.toString());
  };

  // eslint-disable-next-line no-console
  console.info(`[moduleLoadRecovery] Reloading after ${reason}`);

  window.setTimeout(navigate, 600);
  void clearStaleBrowserCaches().finally(navigate);
  return true;
}

export function clearModuleLoadRecoveryFlag(delayMs = 6_000) {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    removeSessionValue(MODULE_RELOAD_FLAG);
    removeSessionValue(MODULE_RELOAD_TS);
  }, delayMs);
}