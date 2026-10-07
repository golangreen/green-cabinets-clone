import { useLayoutEffect } from "react";
import { useReveal } from "@/hooks/useReveal";

/** The redesigned look for a page: dark lux tokens (already on <html> site-wide) plus the scroll reveals. */
export function useLuxPage(revealKey?: unknown) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-lux");
  }, []);
  useReveal(revealKey);
}
