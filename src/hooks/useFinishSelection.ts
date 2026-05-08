/**
 * useFinishSelection — global, localStorage-backed selection of MaterialPanel ids.
 * Uses a module-level subscriber set so any component (FAB count, drawer, card
 * "added" badge) stays in sync without a Provider.
 *
 * URL sync: `?picks=tafisa-xyz,shinnoki-abc` hydrates selection on first load
 * so shared links work for any visitor.
 */
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gcny:finish-picks:v1";
const MAX_PICKS = 12;

let current: string[] = [];
const listeners = new Set<(ids: string[]) => void>();

function emit() {
  listeners.forEach((cb) => cb(current));
}

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* quota — ignore */
  }
}

let hydrated = false;
function hydrateOnce() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;

  const fromStorage = readStorage();
  const url = new URL(window.location.href);
  const picksParam = url.searchParams.get("picks");
  if (picksParam) {
    const fromUrl = picksParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_PICKS);
    // Merge URL picks on top, dedupe
    const merged = Array.from(new Set([...fromUrl, ...fromStorage])).slice(
      0,
      MAX_PICKS
    );
    current = merged;
    writeStorage(current);
  } else {
    current = fromStorage;
  }
}

export function useFinishSelection() {
  hydrateOnce();
  const [ids, setIds] = useState<string[]>(current);

  useEffect(() => {
    const cb = (next: string[]) => setIds([...next]);
    listeners.add(cb);
    // Sync on mount in case hydrate happened after first render
    setIds([...current]);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    if (current.includes(id)) {
      current = current.filter((x) => x !== id);
    } else {
      if (current.length >= MAX_PICKS) return;
      current = [...current, id];
    }
    writeStorage(current);
    emit();
  }, []);

  const remove = useCallback((id: string) => {
    current = current.filter((x) => x !== id);
    writeStorage(current);
    emit();
  }, []);

  const clear = useCallback(() => {
    current = [];
    writeStorage(current);
    emit();
  }, []);

  return { ids, toggle, remove, clear, max: MAX_PICKS };
}

export function buildShareUrl(ids: string[]): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + "/finishes-colors");
  if (ids.length) url.searchParams.set("picks", ids.join(","));
  return url.toString();
}
