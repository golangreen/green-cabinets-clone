/**
 * Sticky visual breadcrumb bar used on Borough and Neighborhood pages.
 * Sits below the fixed Header so it stays visible while scrolling.
 */
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string; // omit for the current page
}

interface Props {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: Props) => (
  <nav
    aria-label="Breadcrumb"
    className="sticky top-[88px] sm:top-[112px] md:top-[140px] z-30 bg-background/95 backdrop-blur border-b border-border"
  >
    <div className="container mx-auto px-6 max-w-5xl py-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[#555555]">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-semibold text-[#1a1a1a]" : ""}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className="w-4 h-4 text-[#999999]"
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

export default Breadcrumbs;
