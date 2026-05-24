/**
 * FinishesColorsSection — homepage section that surfaces a 4-panel preview
 * of each partner brand inline, with a breadcrumb-style brand slider on top
 * (matching the Gallery / Luxury Millwork Gallery filter pattern). The
 * preview row scrolls horizontally so visitors can quickly skim the curated
 * picks; the full filterable browser lives on /finishes-colors.
 */
import { useState } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PANELS_BY_BRAND } from "@/data/finishes";
import type { MaterialBrand } from "@/types/materials";

const BRANDS: { key: MaterialBrand; label: string }[] = [
  { key: "Tafisa", label: "Tafisa" },
  { key: "Shinnoki", label: "Shinnoki" },
  { key: "Egger", label: "Egger" },
  { key: "Wilsonart", label: "Wilsonart" },
  { key: "AGT", label: "AGT" },
  { key: "Raphael Stone", label: "Raphael Stone" },
];

const PREVIEW_COUNT = 4;

const FinishesColorsSection = () => {
  const [active, setActive] = useState<MaterialBrand>("Tafisa");
  const panels = PANELS_BY_BRAND[active].slice(0, PREVIEW_COUNT);

  return (
    <section
      id="finishes-colors"
      className="py-16 sm:py-20 md:py-28 lg:py-32 bg-[#d5d5d5]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-accent font-semibold mb-3">
            Real Panels · Real Codes · Real Samples
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Finishes &amp; Colors
          </h2>
          <p className="text-base sm:text-lg text-[#444] max-w-2xl mx-auto">
            Browse the actual laminate, melamine, and veneer panels we order
            from our partner brands. Pick a brand, then swipe through a
            preview of our most-ordered decors.
          </p>
        </div>

        {/* Brand breadcrumb slider */}
        <div className="sticky top-24 sm:top-32 md:top-40 z-30 -mx-4 sm:-mx-6 mb-6 bg-[#d5d5d5]/85 backdrop-blur-md border-b border-border/40">
          <div className="relative">
            <div
              className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none px-6 py-2 md:justify-center [-webkit-overflow-scrolling:touch] [scroll-padding-inline:1.8rem]"
              role="tablist"
              aria-label="Filter by brand"
            >
              {BRANDS.map((b, idx) => {
                const isActive = active === b.key;
                return (
                  <div key={b.key} className="flex items-center gap-2 shrink-0">
                    {idx > 0 && (
                      <ChevronRight
                        className="h-4 w-4 text-[#888888] shrink-0"
                        aria-hidden
                      />
                    )}
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActive(b.key)}
                      className={`shrink-0 text-base md:text-lg transition-all active:scale-95 ${
                        isActive
                          ? "text-[#1a1a1a] font-semibold"
                          : "text-[#888888] font-normal hover:text-[#1a1a1a]"
                      }`}
                    >
                      {b.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Horizontal preview rail — 4 panels per brand */}
        {panels.length === 0 ? (
          <div className="text-center py-12 text-[#666] text-sm">
            {active} catalog coming soon.
          </div>
        ) : (
          <div
            className="-mx-4 sm:-mx-6 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scroll-padding-inline:1rem] sm:[scroll-padding-inline:1.5rem] [scroll-snap-stop:always] [overscroll-behavior-x:contain]"
            aria-label={`${active} panel previews`}
          >
            <ul className="flex flex-nowrap gap-4 px-4 sm:px-6 pb-2">
              {panels.map((panel) => (
                <li
                  key={panel.id}
                  className="snap-start shrink-0 w-[70%] sm:w-[40%] md:w-[28%] lg:w-[22%]"
                >
                  <Link
                    to="/finishes-colors"
                    className="group block rounded-lg overflow-hidden border border-border bg-background hover:border-[#5C7650] hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      {panel.thumb ? (
                        <img
                          src={panel.thumb}
                          alt={`${panel.brand} ${panel.name} panel sample`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                          style={{ background: panel.swatchHex ?? "#ddd" }}
                          aria-label={`${panel.name} approximate color swatch`}
                        />
                      )}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <h4 className="text-sm font-semibold text-[#1a1a1a] line-clamp-1">
                        {panel.name}
                      </h4>
                      <p className="text-[11px] font-mono text-accent line-clamp-1">
                        {panel.codes[0] ?? panel.brand}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            className="border-[#5C7650] text-accent hover:bg-[#5C7650] hover:text-white"
          >
            <Link to="/finishes-colors">
              See all {active} finishes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinishesColorsSection;
