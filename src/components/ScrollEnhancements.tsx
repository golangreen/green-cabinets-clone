/**
 * ScrollEnhancements — vertical "section dots" navigator pinned to the
 * right edge of the viewport. Auto-detects top-level <section> elements
 * on the page and renders a small dot per section. Tap a dot to smooth
 * scroll to that section. The dot for the section currently in view is
 * highlighted via IntersectionObserver (passive — no scroll listener,
 * no rAF loop), which keeps the main thread free for things like the
 * hero video on iOS.
 */
import { useCallback, useEffect, useRef, useState } from "react";

type SectionEntry = {
  el: HTMLElement;
  label: string;
};

const ScrollEnhancements = () => {
  const [sections, setSections] = useState<SectionEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Re-detect sections whenever the URL changes or the DOM grows
  // (lazy-loaded components mount in after the initial render).
  useEffect(() => {
    const detect = () => {
      const all = Array.from(
        document.querySelectorAll<HTMLElement>("section")
      ).filter((el) => {
        // Skip nested sections — only top-level page sections become dots.
        if (el.closest("section") !== el) return false;
        // Skip tiny sections (sliders, embedded widgets, etc.).
        if (el.offsetHeight < 200) return false;
        return true;
      });

      // Cap at 8 dots — evenly sample across the page so each dot covers
      // a meaningful chunk of scroll distance instead of crowding the rail.
      const MAX_DOTS = 8;
      let picked = all;
      if (all.length > MAX_DOTS) {
        picked = [];
        for (let i = 0; i < MAX_DOTS; i++) {
          const idx = Math.round((i * (all.length - 1)) / (MAX_DOTS - 1));
          if (!picked.includes(all[idx])) picked.push(all[idx]);
        }
      }

      const entries: SectionEntry[] = picked.map((el, i) => {
        const labelAttr =
          el.getAttribute("data-nav-label") ||
          el.getAttribute("aria-label") ||
          el.id;
        const heading = el.querySelector("h1, h2, h3")?.textContent?.trim();
        const label = labelAttr || heading || `Section ${i + 1}`;
        return { el, label: label.slice(0, 40) };
      });

      setSections((prev) => {
        if (
          prev.length === entries.length &&
          prev.every((p, i) => p.el === entries[i].el)
        ) {
          return prev;
        }
        return entries;
      });
    };

    detect();
    // Re-run after lazy chunks likely mounted.
    const t1 = setTimeout(detect, 600);
    const t2 = setTimeout(detect, 2000);

    const mo = new MutationObserver(() => detect());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      mo.disconnect();
    };
  }, []);

  // Track which section is currently in view.
  useEffect(() => {
    if (!sections.length) return;
    observerRef.current?.disconnect();

    const visibility = new Map<HTMLElement, number>();
    const io = new IntersectionObserver(
      (records) => {
        records.forEach((r) => {
          visibility.set(r.target as HTMLElement, r.intersectionRatio);
        });
        let bestIdx = 0;
        let bestRatio = -1;
        sections.forEach((s, i) => {
          const r = visibility.get(s.el) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestIdx = i;
          }
        });
        setActiveIdx(bestIdx);
      },
      {
        // Watch for the section that occupies the middle band of the viewport.
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0, 0.01, 0.25, 0.5, 0.75, 1],
      }
    );
    sections.forEach((s) => io.observe(s.el));
    observerRef.current = io;
    return () => io.disconnect();
  }, [sections]);

  const jumpTo = useCallback((idx: number) => {
    const s = sections[idx];
    if (!s) return;
    s.el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Page sections"
      className="fixed right-2 sm:right-3 top-24 bottom-24 z-[200] flex flex-col items-center justify-between py-2"
    >
      {sections.map((s, i) => {
        const isActive = i === activeIdx;
        return (
          <button
            key={i}
            type="button"
            onClick={() => jumpTo(i)}
            aria-label={`Jump to ${s.label}`}
            aria-current={isActive ? "true" : undefined}
            title={s.label}
            className={`group relative block rounded-full transition-all duration-300 touch-manipulation ${
              isActive
                ? "h-2.5 w-2.5 bg-[#5C7650] shadow-[0_0_10px_rgba(92,118,80,0.8)]"
                : "h-2 w-2 bg-foreground/30 hover:bg-foreground/60"
            }`}
          >
            <span className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden sm:group-hover:block whitespace-nowrap text-[11px] font-medium bg-foreground text-background px-2 py-1 rounded-md shadow-md">
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default ScrollEnhancements;
