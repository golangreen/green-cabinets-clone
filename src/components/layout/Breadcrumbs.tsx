/**
 * Sticky visual breadcrumb bar used on Borough and Neighborhood pages.
 * Sits below the fixed Header so it stays visible while scrolling.
 * Swipe horizontally to follow the trail on mobile.
 */
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

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

  // Auto-scroll the current (last) crumb into view whenever the route changes.
  const last = items[items.length - 1];
  const currentKey = `${last?.label ?? ""}|${last?.to ?? ""}|${items.length}`;
  useEffect(() => {
    currentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "end",
    });
  }, [currentKey]);

  return (
    <nav
      aria-label="Breadcrumb"
      className="lux-material sticky top-[calc(4rem+env(safe-area-inset-top,0px))] md:top-[calc(5rem+env(safe-area-inset-top,0px))] z-30 border-b border-white/10"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl py-2 sm:py-3">
        <ol
          ref={scrollerRef}
          className="flex items-center gap-1 sm:gap-1.5 font-display text-xs text-stone overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth touch-pan-x overscroll-x-contain"
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
                    className="hover:text-ivory transition-colors inline-flex items-center min-h-[40px] px-1 -mx-1"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={`inline-flex items-center min-h-[40px] px-1 -mx-1 ${
                      isLast ? "text-ivory/85" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                )}
                {!isLast && (
                  <span className="text-stone/60" aria-hidden="true">
                    /
                  </span>
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
