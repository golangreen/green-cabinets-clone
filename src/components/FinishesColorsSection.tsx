/**
 * FinishesColorsSection — homepage section that surfaces the partner-brand
 * panel catalog directly inline, with a breadcrumb-style brand slider on
 * top (matching the Gallery / Luxury Millwork Gallery filter pattern).
 * Replaces the floating "Finishes & Colors" CTA.
 */
import { useState } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandPanel } from "@/components/wood/MaterialsBrowser";
import { PANELS_BY_BRAND } from "@/data/finishes";
import type { MaterialBrand } from "@/types/materials";
import SelectionDrawer from "@/components/wood/SelectionDrawer";

const BRANDS: { key: MaterialBrand; label: string }[] = [
  { key: "Tafisa", label: "Tafisa" },
  { key: "Shinnoki", label: "Shinnoki" },
  { key: "Egger", label: "Egger" },
  { key: "Wilsonart", label: "Wilsonart" },
  { key: "AGT", label: "AGT" },
];

const FinishesColorsSection = () => {
  const [active, setActive] = useState<MaterialBrand>("Tafisa");

  return (
    <section
      id="finishes-colors"
      className="py-16 sm:py-20 md:py-28 lg:py-32 bg-[#d5d5d5]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            Real Panels · Real Codes · Real Samples
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Finishes &amp; Colors
          </h2>
          <p className="text-base sm:text-lg text-[#444] max-w-2xl mx-auto">
            Browse the actual laminate, melamine, and veneer panels we order
            from our partner brands. Tap a swatch to save favorites.
          </p>
        </div>

        {/* Brand breadcrumb slider */}
        <div className="sticky top-16 md:top-20 z-30 -mx-4 sm:-mx-6 mb-6 bg-[#d5d5d5]/85 backdrop-blur-md border-b border-border/40">
          <div className="relative">
            <div
              className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none px-6 py-2 md:justify-center [-webkit-overflow-scrolling:touch] [scroll-padding-inline:1.8rem]"
              role="tablist"
              aria-label="Filter by brand"
            >
              {BRANDS.map((b, idx) => {
                const count = PANELS_BY_BRAND[b.key].length;
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
                      {count > 0 && (
                        <span className="ml-1 text-[11px] font-mono text-[#888]">
                          ({count})
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <BrandPanel brand={active} />

        <div className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            className="border-[#5C7650] text-[#5C7650] hover:bg-[#5C7650] hover:text-white"
          >
            <Link to="/finishes-colors">
              Open full Finishes &amp; Colors page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <SelectionDrawer />
    </section>
  );
};

export default FinishesColorsSection;
