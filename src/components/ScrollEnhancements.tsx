/**
 * ScrollEnhancements — three intuitive scroll affordances for the home page:
 *  1. Top progress bar (thin green line filling as you scroll).
 *  2. Section dots rail (desktop only, right edge) — jump between sections,
 *     active section glows, hover reveals label.
 *  3. Hero scroll hint — soft bouncing chevron at bottom of viewport on
 *     first load. Disappears on first scroll.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type SectionInfo = { id: string; label: string; el: HTMLElement };

const SECTION_LABELS: Record<string, string> = {
  hero: "Home",
  services: "Services",
  "luxury-millwork": "Millwork",
  "finishes-colors": "Finishes",
  gallery: "Gallery",
  about: "About",
  suppliers: "Suppliers",
  testimonials: "Reviews",
  shop: "Shop",
  faq: "FAQ",
  contact: "Contact",
};

const ScrollEnhancements = () => {
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [showHint, setShowHint] = useState(true);
  const rafRef = useRef<number | null>(null);

  // Discover sections with an id that we know how to label.
  useEffect(() => {
    const found: SectionInfo[] = [];
    document.querySelectorAll<HTMLElement>("section[id], div[id]").forEach((el) => {
      const id = el.id;
      if (id && SECTION_LABELS[id]) {
        found.push({ id, label: SECTION_LABELS[id], el });
      }
    });
    setSections(found);
  }, []);

  // Track scroll progress + active section.
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
        if (window.scrollY > 30) setShowHint(false);

        // Active section = whichever's top is closest to 1/3 viewport.
        const anchor = window.innerHeight / 3;
        let bestId = "";
        let bestDist = Infinity;
        for (const s of sections) {
          const top = s.el.getBoundingClientRect().top;
          const dist = Math.abs(top - anchor);
          if (top < window.innerHeight && dist < bestDist) {
            bestDist = dist;
            bestId = s.id;
          }
        }
        if (bestId) setActiveId(bestId);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sections]);

  const scrollTo = (el: HTMLElement) => {
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      {/* 1. Reading progress bar */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
      >
        <div
          className="h-full bg-[#5C7650] transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(92,118,80,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 2. Section dots — desktop only */}
      {sections.length > 1 && (
        <nav
          aria-label="Page sections"
          className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 group"
        >
          {sections.map((s) => {
            const isActive = activeId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.el)}
                aria-label={`Jump to ${s.label}`}
                aria-current={isActive ? "true" : undefined}
                className="relative flex items-center justify-end h-3"
              >
                <span
                  className={`absolute right-6 whitespace-nowrap text-xs font-medium px-2 py-1 rounded-md bg-[#1a1a1a] text-white opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none ${
                    isActive ? "opacity-100 translate-x-0" : ""
                  }`}
                >
                  {s.label}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "h-3 w-3 bg-[#5C7650] shadow-[0_0_10px_rgba(92,118,80,0.8)]"
                      : "h-2 w-2 bg-[#5C7650]/30 hover:bg-[#5C7650]/70"
                  }`}
                />
              </button>
            );
          })}
        </nav>
      )}

      {/* 3. Hero scroll hint */}
      {showHint && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: "smooth" })}
          aria-label="Scroll down"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 text-[#5C7650] animate-fade-in pointer-events-auto"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80">
            Scroll
          </span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </button>
      )}
    </>
  );
};

export default ScrollEnhancements;
