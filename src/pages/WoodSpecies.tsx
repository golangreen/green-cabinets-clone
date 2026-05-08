/**
 * Wood Species index page — /wood-species
 * SEO-rich landing for the wood-knowledge hub:
 *  - hero intro
 *  - interactive comparison tool
 *  - static overview table (all species)
 *  - links to per-species deep pages
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import WoodCompare from "@/components/wood/WoodCompare";
import WoodOverviewTable from "@/components/wood/WoodOverviewTable";

import { WOOD_SPECIES } from "@/data/woodSpecies";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const WoodSpecies = () => {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cabinet Wood Species Guide",
    itemListElement: WOOD_SPECIES.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://greencabinetsny.com/wood-species/${w.slug}`,
      name: w.name,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Cabinet Wood Species Guide: Maple, Oak, Walnut & More | Green Cabinets NY</title>
        <meta
          name="description"
          content="In-depth guide to the 11 hardwoods we use for custom kitchen cabinets — maple, walnut, white oak, red oak, birch, cherry, hickory, ash, mahogany, alder, beech. Compare grain, hardness, cost, and finish behavior side-by-side."
        />
        <meta
          name="keywords"
          content="cabinet wood species, kitchen cabinet wood comparison, maple vs oak cabinets, walnut cabinets NYC, hardwood guide, wood for kitchen cabinets"
        />
        <link rel="canonical" href="https://greencabinetsny.com/wood-species" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://greencabinetsny.com/wood-species" />
        <meta property="og:title" content="Cabinet Wood Species Guide | Green Cabinets NY" />
        <meta
          property="og:description"
          content="Compare 11 cabinet hardwoods side-by-side: maple, walnut, oak, birch, cherry, hickory, ash, mahogany, alder, beech. Grain, hardness, cost, finishes."
        />
        <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>

      <Header />

      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Wood Species Guide" },
        ]}
      />

      <main className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
        {/* Hero */}
        <section className="bg-[#d5d5d5]/40 py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center space-y-4">
            <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold">
              The Material Library
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a]">
              Cabinet Wood Species — A Complete Guide
            </h1>
            <p className="text-base sm:text-lg text-[#555555] max-w-3xl mx-auto leading-relaxed">
              Choosing a wood is the single biggest decision in a custom cabinet project. It
              determines how your kitchen looks, how it ages, how it stands up to daily life, and
              what it costs. Below is everything we have learned in 15 years of building custom
              cabinets in Brooklyn — every species we work with, head-to-head, with the tradeoffs
              spelled out plainly.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {WOOD_SPECIES.map((w) => (
                <a
                  key={w.slug}
                  href={`#${w.slug}`}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-[#5C7650]/40 text-[#5C7650] hover:bg-[#5C7650] hover:text-white transition-colors"
                >
                  {w.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive compare */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3">
                Side-by-Side Comparison Tool
              </h2>
              <p className="text-[#555555] max-w-2xl mx-auto">
                Pick two to four species and we will lay out their hardness, grain, cost tier, and
                finishing behavior in a single view.
              </p>
            </div>
            <WoodCompare />
          </div>
        </section>

        {/* Overview table */}
        <section className="py-12 sm:py-16 md:py-20 bg-muted/40">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3">
                All Species at a Glance
              </h2>
              <p className="text-[#555555] max-w-2xl mx-auto">
                The headline numbers for every wood we work with. Tap any row for the deep dive.
              </p>
            </div>
            <WoodOverviewTable />
          </div>
        </section>

        {/* Materials browser teaser — full browser lives at /finishes-colors */}
        <section id="materials" className="py-12 sm:py-16 md:py-20 bg-[#f5f5f5]">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="text-center">
              <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-2">
                Beyond Solid Wood
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3">
                Browse Every Finish &amp; Color
              </h2>
              <p className="text-[#555555] max-w-2xl mx-auto mb-6">
                Explore real laminate, melamine, and veneer panels from Tafisa, Shinnoki, and
                more. Save favorites, share with friends, and send your picks to us for pricing.
              </p>
              <Link
                to="/finishes-colors"
                className="inline-flex items-center gap-2 bg-[#5C7650] hover:bg-[#445339] text-white font-semibold px-6 py-3 rounded-md transition-all hover:scale-105 hover:shadow-2xl"
              >
                Browse Finishes &amp; Colors
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Species cards */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-8 text-center">
              Browse Every Species
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {WOOD_SPECIES.map((w) => (
                <Link
                  key={w.slug}
                  to={`/wood-species/${w.slug}`}
                  id={w.slug}
                  className="group block rounded-xl overflow-hidden border border-border bg-background hover:border-[#5C7650] hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={w.image}
                      alt={`${w.name} cabinet wood — ${w.tagline}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span
                      className="absolute top-3 left-3 inline-block w-8 h-8 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: w.swatch }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold text-[#1a1a1a]">{w.name}</h3>
                      <span className="font-mono text-sm text-[#5C7650]">{w.costTier}</span>
                    </div>
                    <p className="text-sm text-[#5C7650] italic">{w.tagline}</p>
                    <p className="text-sm text-[#555555] line-clamp-3">{w.shortDescription}</p>
                    <div className="flex items-center justify-between pt-2 text-xs text-[#999999]">
                      <span>Janka {w.jankaHardness.toLocaleString()} lbf</span>
                      <span className="inline-flex items-center gap-1 text-[#5C7650] font-medium group-hover:gap-2 transition-all">
                        Read guide <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 md:py-20 bg-[#5C7650] text-white">
          <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center space-y-5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Still not sure which wood is right for your kitchen?
            </h2>
            <p className="text-base sm:text-lg text-white/90">
              Bring your inspiration photos and we will hand you actual wood samples in our
              Bushwick showroom. Most clients find their wood within 15 minutes of touching them.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-white text-[#5C7650] hover:bg-white/90 hover:scale-105 transition-all">
                <Link to="/#contact">Book a free consultation</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#5C7650] hover:scale-105 transition-all">
                <Link to="/designer">Launch the designer</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WoodSpecies;
