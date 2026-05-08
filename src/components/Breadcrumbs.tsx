/**
 * Sticky visual breadcrumb bar used on Borough and Neighborhood pages.
 * Sits below the fixed Header so it stays visible while scrolling.
 * Swipe horizontally to follow the trail on mobile.
 */
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

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

  return (
    <nav
      aria-label="Breadcrumb"
      className="sticky top-[96px] sm:top-[128px] md:top-[160px] z-30 bg-background/95 backdrop-blur border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-2 sm:py-3">
        <ol
          ref={scrollerRef}
          className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-[#555555] overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth touch-pan-x overscroll-x-contain"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li
                key={`${item.label}-${i}`}
                ref={isLast ? currentRef : undefined}
                className="flex items-center gap-1 sm:gap-1.5 shrink-0"
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
      </div>
    </nav>
  );
};

export default Breadcrumbs;
