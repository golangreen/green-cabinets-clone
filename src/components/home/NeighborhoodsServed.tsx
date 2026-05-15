import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { BOROUGH_LIST } from "@/data/boroughSeo";
import NeighborhoodDialog from "@/components/home/NeighborhoodDialog";

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollToContact = () => scrollToId("contact");

const DEFAULT_VISIBLE = 8;

const NeighborhoodsServed = () => {
  const [active, setActive] = useState<{ name: string; boroughSlug: string } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <section
      id="neighborhoods"
      className="py-16 sm:py-20 md:py-24 bg-background"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#1a1a1a] mb-4">
            Neighborhoods We Serve
          </h2>
          <p className="text-base sm:text-lg text-[#555555]">
            Designed in Bushwick, installed across NYC. Explore our dedicated
            service areas for{" "}
            {BOROUGH_LIST.map((b, i) => (
              <span key={b.slug}>
                <Link
                  to={`/custom-kitchen-cabinets-${b.slug}`}
                  className="text-primary font-semibold hover:underline"
                >
                  custom kitchen cabinets in {b.name}
                </Link>
                {i < BOROUGH_LIST.length - 2
                  ? ", "
                  : i === BOROUGH_LIST.length - 2
                  ? ", and "
                  : "."}
              </span>
            ))}
          </p>
          <p className="md:hidden text-xs text-[#666] mt-3">Swipe through {BOROUGH_LIST.length} boroughs →</p>
        </div>
      </div>

      <div
        role="region"
        aria-label="Boroughs carousel"
        className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-6 pb-4 scrollbar-none [-webkit-overflow-scrolling:touch] [scroll-padding-inline:1.5rem]"
      >
        {BOROUGH_LIST.map((borough) => {
          const boroughHref = `/custom-kitchen-cabinets-${borough.slug}`;
          return (
            <div
              key={borough.slug}
              id={`borough-${borough.slug}`}
              className="snap-start shrink-0 w-[82vw] sm:w-[55vw] md:w-[42vw] lg:w-[32vw] max-w-[440px] scroll-mt-24 bg-[#d5d5d5] rounded-xl p-6 sm:p-7 flex flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-6 h-6 text-primary" />
                <h3 className="font-display text-2xl font-bold text-[#1a1a1a]">
                  <Link
                    to={boroughHref}
                    className="hover:text-primary transition-colors"
                  >
                    {borough.name}
                  </Link>
                </h3>
              </div>
              <p className="text-sm text-[#555555] mb-5">
                Custom kitchen cabinets in {borough.name}
              </p>

              <ul className="space-y-2 mb-4 flex-1">
                {(expanded[borough.slug]
                  ? borough.neighborhoods
                  : borough.neighborhoods.slice(0, DEFAULT_VISIBLE)
                ).map((n) => (
                  <li
                    key={n}
                    className="border-b border-background/60 pb-1"
                  >
                    <button
                      type="button"
                      onClick={() => setActive({ name: n, boroughSlug: borough.slug })}
                      className="w-full text-left text-[#1a1a1a] text-sm hover:text-primary transition-colors"
                    >
                      {n}
                    </button>
                  </li>
                ))}
              </ul>

              {borough.neighborhoods.length > DEFAULT_VISIBLE && (
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [borough.slug]: !prev[borough.slug],
                    }))
                  }
                  className="self-start mb-4 text-xs font-semibold text-primary hover:text-[#445339] transition-colors"
                >
                  {expanded[borough.slug]
                    ? "Show fewer"
                    : `+ ${borough.neighborhoods.length - DEFAULT_VISIBLE} more neighborhoods`}
                </button>
              )}

              <div className="mt-auto flex flex-col gap-2">
                <Link
                  to={boroughHref}
                  className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:text-[#445339] transition-colors"
                >
                  Explore {borough.name} cabinetry
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={scrollToContact}
                  className="inline-flex items-center justify-center text-sm font-semibold text-[#1a1a1a] hover:text-primary transition-colors"
                >
                  Get a free quote
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <NeighborhoodDialog
        neighborhood={active?.name ?? null}
        boroughSlug={active?.boroughSlug}
        onClose={() => setActive(null)}
      />
    </section>
  );
};

export default NeighborhoodsServed;
