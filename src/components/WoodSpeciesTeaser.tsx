/**
 * Compact homepage teaser linking to the /wood-species hub.
 */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WOOD_SPECIES } from "@/data/woodSpecies";

const FEATURED = ["maple", "white-oak", "walnut", "cherry"];

const WoodSpeciesTeaser = () => {
  const featured = WOOD_SPECIES.filter((w) => FEATURED.includes(w.slug));
  return (
    <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-[#d5d5d5]/40">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center mb-10 space-y-3">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold">
            Material Library
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a]">
            Choose Your Wood with Confidence
          </h2>
          <p className="text-[#555555] max-w-2xl mx-auto">
            Hardness, grain, finish behavior, and price — all the trade-offs explained for the
            11 hardwoods we use, with a side-by-side comparison tool.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {featured.map((w) => (
            <Link
              key={w.slug}
              to={`/wood-species/${w.slug}`}
              className="group block rounded-lg overflow-hidden border border-border bg-background hover:border-[#5C7650] hover:shadow-lg transition-all"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={w.image}
                  alt={`${w.name} cabinet wood`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span
                  className="absolute top-2 left-2 inline-block w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: w.swatch }}
                  aria-hidden="true"
                />
              </div>
              <div className="p-3 text-center">
                <p className="font-semibold text-[#1a1a1a] text-sm">{w.name}</p>
                <p className="text-xs text-[#999999]">Janka {w.jankaHardness.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] text-white hover:scale-105 transition-all">
            <Link to="/wood-species">
              Explore the wood species guide <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WoodSpeciesTeaser;
