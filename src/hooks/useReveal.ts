import { useEffect } from "react";

/**
 * Arms the one-time scroll reveals ([data-reveal]) for the current page.
 * Elements get data-in when they first enter the viewport and stay put.
 */
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.querySelectorAll("[data-reveal]:not([data-in])").forEach((el) => io.observe(el));
    root.classList.add("reveal-armed");
    return () => {
      io.disconnect();
      root.classList.remove("reveal-armed");
    };
  }, []);
}
