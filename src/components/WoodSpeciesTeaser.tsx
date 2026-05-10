/**
 * Compact homepage teaser linking to the /wood-species hub.
 * Uses the same swipeable preview pattern as FinishesColorsSection
 * for a cleaner, more cohesive feel.
 */
import { Link } from "react-router-dom";
import { WOOD_SPECIES } from "@/data/woodSpecies";

const WoodSpeciesTeaser = () => {
  return (
    <section className="py-16 sm:py-20 md:py-28 lg:py-32 bg-[#d5d5d5]/40">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            Material Library
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Choose Your Wood with Confidence
          </h2>
          <p className="text-base sm:text-lg text-[#444] max-w-2xl mx-auto">
            Hardness, grain, finish behavior, and price — all the trade-offs
            explained for the {WOOD_SPECIES.length} hardwoods we use. Swipe
            through the species below, then dive in for the full guide.
          </p>
        </div>

        {/* Horizontal swipeable rail — all species */}
        <div
          className="-mx-4 sm:-mx-6 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scroll-padding-inline:1rem] sm:[scroll-padding-inline:1.5rem] [scroll-snap-stop:always] [overscroll-behavior-x:contain]"
          aria-label="Wood species previews"
        >
          <ul className="flex flex-nowrap gap-4 px-4 sm:px-6 pb-2">
            {WOOD_SPECIES.map((w) => (
              <li
                key={w.slug}
                className="snap-start shrink-0 w-[70%] sm:w-[40%] md:w-[28%] lg:w-[22%]"
              >
                <Link
                  to={`/wood-species/${w.slug}`}
                  className="group block rounded-lg overflow-hidden border border-border bg-background hover:border-[#5C7650] hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={w.image}
                      alt={`${w.name} cabinet wood`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span
                      className="absolute top-2 left-2 inline-block w-6 h-6 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: w.swatch }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="p-2.5 space-y-1">
                    <h4 className="text-sm font-semibold text-[#1a1a1a] line-clamp-1">
                      {w.name}
                    </h4>
                    <p className="text-[11px] font-mono text-[#5C7650] line-clamp-1">
                      Janka {w.jankaHardness.toLocaleString()}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            className="border-[#5C7650] text-[#5C7650] hover:bg-[#5C7650] hover:text-white"
          >
            <Link to="/wood-species">
              Explore the wood species guide
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WoodSpeciesTeaser;
