import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { BOROUGH_LIST } from "@/data/boroughSeo";
import NeighborhoodDialog from "@/components/NeighborhoodDialog";

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scrollToContact = () => scrollToId("contact");

const NeighborhoodsServed = () => {
  const [active, setActive] = useState<{ name: string; boroughSlug: string } | null>(null);
  return (
    <section
      id="neighborhoods"
      className="py-16 sm:py-20 md:py-28 lg:py-32 bg-background"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#1a1a1a] mb-4">
            Neighborhoods We Serve
          </h2>
          <p className="text-lg text-[#555555]">
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

          <nav
            aria-label="Jump to borough"
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {BOROUGH_LIST.map((b) => (
              <button
                key={`link-${b.slug}`}
                onClick={() => scrollToId(`borough-${b.slug}`)}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-[#d5d5d5] text-[#1a1a1a] hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {b.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {BOROUGH_LIST.map((borough) => {
            const boroughHref = `/custom-kitchen-cabinets-${borough.slug}`;
            return (
              <div
                key={borough.slug}
                id={`borough-${borough.slug}`}
                className="scroll-mt-24 bg-[#d5d5d5] rounded-xl p-6 sm:p-8 flex flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl"
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

                <ul className="space-y-2 mb-6 flex-1">
                  {borough.neighborhoods.slice(0, 6).map((n) => (
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
      </div>
    </section>
  );
};

export default NeighborhoodsServed;
