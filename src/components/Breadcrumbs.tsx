/**
 * Sticky visual breadcrumb bar used on Borough and Neighborhood pages.
 * Sits below the fixed Header so it stays visible while scrolling.
 * Horizontally scrollable with smooth snap behavior on overflow.
 */
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string; // omit for the current page
}

interface Props {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: Props) => {
  const scrollerRef = useRef<HTMLOListElement>(null);
  const currentRef = useRef<HTMLLIElement>(null);

  // Auto-scroll to the current (last) item on mount so users see where they are.
  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "end",
    });
  }, [items]);

  const nudge = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(120, el.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="sticky top-[96px] sm:top-[128px] md:top-[160px] z-30 bg-background/95 backdrop-blur border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-2 sm:py-3 relative">
        {/* Left nudge button */}
        <button
          type="button"
          aria-label="Scroll breadcrumbs left"
          onClick={() => nudge(-1)}
          className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-background/90 backdrop-blur rounded-full border border-border active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-4 h-4 text-[#555555]" />
        </button>

        {/* Edge fades to hint at scrollable content */}
        <div className="sm:hidden pointer-events-none absolute left-8 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-[1]" />
        <div className="sm:hidden pointer-events-none absolute right-8 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-[1]" />

        <ol
          ref={scrollerRef}
          className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#555555] overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth snap-x snap-mandatory px-10 sm:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li
                key={`${item.label}-${i}`}
                ref={isLast ? currentRef : undefined}
                className="flex items-center gap-1 sm:gap-1.5 shrink-0 snap-start"
              >
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="hover:text-primary transition-colors inline-flex items-center min-h-[40px] px-1 -mx-1"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={`inline-flex items-center min-h-[40px] px-1 -mx-1 ${
                      isLast ? "font-semibold text-[#1a1a1a]" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#999999] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Right nudge button */}
        <button
          type="button"
          aria-label="Scroll breadcrumbs right"
          onClick={() => nudge(1)}
          className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-background/90 backdrop-blur rounded-full border border-border active:scale-95 transition-transform"
        >
          <ChevronRight className="w-4 h-4 text-[#555555]" />
        </button>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
