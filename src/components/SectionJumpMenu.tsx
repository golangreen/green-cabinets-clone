/**
 * SectionJumpMenu — small floating button (bottom-left) that opens a
 * labeled list of the current page's sections. Tap a section to smooth
 * scroll there. Uses IntersectionObserver to mark the active one.
 *
 * Replaces the previous "dots rail" — keeps the page visually clean and
 * lets users jump anywhere with one tap. No scroll listener / rAF loop,
 * so it doesn't compete with the hero video on iOS.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { List } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SectionEntry = {
  el: HTMLElement;
  label: string;
};

const SectionJumpMenu = () => {
  const [sections, setSections] = useState<SectionEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { pathname } = useLocation();

  // Detect top-level sections on the current page.
  useEffect(() => {
    const detect = () => {
      const all = Array.from(
        document.querySelectorAll<HTMLElement>("section")
      ).filter((el) => {
        if (el.closest("section") !== el) return false;
        if (el.offsetHeight < 200) return false;
        return true;
      });

      const entries: SectionEntry[] = all.map((el, i) => {
        const labelAttr =
          el.getAttribute("data-nav-label") ||
          el.getAttribute("aria-label") ||
          el.id;
        const heading = el.querySelector("h1, h2, h3")?.textContent?.trim();
        const label = labelAttr || heading || `Section ${i + 1}`;
        return { el, label: label.replace(/\s+/g, " ").slice(0, 60) };
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
    const t1 = setTimeout(detect, 600);
    const t2 = setTimeout(detect, 2000);
    const mo = new MutationObserver(() => detect());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      mo.disconnect();
    };
  }, [pathname]);

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
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0, 0.01, 0.5, 1],
      }
    );
    sections.forEach((s) => io.observe(s.el));
    observerRef.current = io;
    return () => io.disconnect();
  }, [sections]);

  const jumpTo = useCallback(
    (idx: number) => {
      const s = sections[idx];
      if (!s) return;
      setOpen(false);
      // Wait for sheet close animation, then scroll with header offset.
      setTimeout(() => {
        const header = document.querySelector("header") as HTMLElement | null;
        const headerH = header?.offsetHeight ?? 0;
        const top =
          s.el.getBoundingClientRect().top + window.scrollY - headerH - 8;
        window.scrollTo({ top, behavior: "smooth" });
      }, 250);
    },
    [sections]
  );

  if (sections.length < 2) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Jump to section"
          className="fixed bottom-6 left-6 z-50 h-11 w-11 rounded-full bg-[#5C7650] text-white shadow-elegant flex items-center justify-center transition-all duration-300 hover:bg-[#445339] hover:shadow-xl active:scale-95"
        >
          <List className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[80vw] max-w-sm p-0 flex flex-col"
      >
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="text-left text-base font-semibold">
            Jump to section
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto py-2">
          {sections.map((s, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                type="button"
                onClick={() => jumpTo(i)}
                className={`w-full text-left px-5 py-3 text-sm border-l-4 transition-colors flex items-center gap-3 ${
                  isActive
                    ? "border-[#5C7650] bg-[#5C7650]/10 text-foreground font-semibold"
                    : "border-transparent text-foreground/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-[11px] tabular-nums opacity-60 w-5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default SectionJumpMenu;
