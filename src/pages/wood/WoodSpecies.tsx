/**
 * Wood Species index page — /wood-species
 * SEO-rich landing for the wood-knowledge hub:
 *  - hero intro
 *  - interactive comparison tool
 *  - static overview table (all species)
 *  - links to per-species deep pages
 */
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WoodCompare from "@/components/wood/WoodCompare";
import PageHero from "@/components/lux/PageHero";
import ContactCta from "@/components/home/lux/ContactCta";
import { useLuxPage } from "@/hooks/useLuxPage";
import { WOOD_SPECIES } from "@/data/woodSpecies";

const WoodSpecies = () => {
  useLuxPage();
  const navigate = useNavigate();
  const goToSpecies = (slug: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    // Route through react-router so HashScrollHandler runs and offsets the header.
    navigate(`/wood-species#${slug}`);
  };

  // Scrollspy: track which species card is currently in view and highlight its chip.
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  useEffect(() => {
    const headerOffset = 140; // fixed header + sticky species bar
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (visible.size === 0) return;
        // Pick the entry closest to the top of the viewport (below the header).
        let bestId: string | null = null;
        let bestTop = Infinity;
        visible.forEach((_ratio, id) => {
          const el = document.getElementById(id);
          if (!el) return;
          const top = el.getBoundingClientRect().top - headerOffset;
          const distance = top >= 0 ? top : Math.abs(top) * 1.2;
          if (distance < bestTop) {
            bestTop = distance;
            bestId = id;
          }
        });
        setActiveSlug(bestId);
      },
      {
        rootMargin: `-${headerOffset}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    const els = WOOD_SPECIES
      .map((w) => document.getElementById(w.slug))
      .filter((el): el is HTMLElement => !!el);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);


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

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Choose the Right Wood Species for Custom Kitchen Cabinets",
    description:
      "A 6-step framework for picking the right hardwood for custom kitchen or vanity cabinets — balancing grain, hardness, finish behavior, sustainability, and budget.",
    totalTime: "PT30M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Decide on a finish direction (paint, stain, or natural)",
        text: "If you want a painted finish, pick a tight, even-grained wood like maple or birch — open-grained woods like oak telegraph through paint. For stain or natural clear coats, white oak, walnut, cherry, and rift-cut white oak shine.",
        url: "https://greencabinetsny.com/finishes-colors",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Match grain pattern to your design style",
        text: "Modern and minimalist: rift-cut white oak or quartersawn oak for straight, uniform grain. Traditional or transitional: maple, cherry, or red oak. Rustic or farmhouse: rustic hickory, knotty alder, or reclaimed-look oak.",
        url: "https://greencabinetsny.com/wood-species",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Check Janka hardness for daily durability",
        text: "Hickory (1820) and hard maple (1450) are the most dent-resistant. Walnut (1010), cherry (950), and alder (590) are softer — beautiful but more prone to dings on cabinet edges. For a busy family kitchen, lean harder.",
        url: "https://greencabinetsny.com/wood-species",
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Confirm the budget tier",
        text: "Budget-friendly: maple, birch, red oak, alder. Mid-tier: white oak, hickory, ash, cherry. Premium: walnut, mahogany, rift-cut and quartersawn white oak. Species can shift a 20-linear-foot kitchen by $1,500–$5,000.",
        url: "https://greencabinetsny.com/wood-species",
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Verify sustainability and sourcing",
        text: "Ask for FSC-certified stock when sustainability matters. Domestic species (maple, oak, walnut, cherry, hickory, ash) have shorter supply chains than tropical hardwoods like mahogany. We can source FSC for any species on request.",
        url: "https://greencabinetsny.com/wood-species",
      },
      {
        "@type": "HowToStep",
        position: 6,
        name: "Order physical samples before committing",
        text: "Photos lie — grain, color, and how light hits a finish are wildly different in person. Request 3–5 sample doors in your top species and finishes, view them in your kitchen at different times of day, then commit.",
        url: "https://greencabinetsny.com/finishes-colors",
      },
    ],
  };

  return (
    <div className="min-h-dvh bg-ink text-ivory">
      <Helmet>
        <title>Cabinet Wood Species Guide | Green Cabinets NY</title>
        <meta
          name="description"
          content="Compare 11 cabinet hardwoods — maple, walnut, oak, birch, cherry, hickory, ash, mahogany, alder, beech. Grain, hardness, cost, and finishes."
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
        <script type="application/ld+json">{JSON.stringify(howToJsonLd)}</script>
      </Helmet>

      <Header />

      <main>
        <PageHero
          crumbs={[{ label: "Home", to: "/" }, { label: "Materials" }]}
          eyebrow="Materials · The wood library"
          title={
            <>
              Choose the wood <em className="italic text-brass">first</em>.
            </>
          }
          lede={
            <>
              <p>
                It decides how the kitchen looks, how it ages, how it takes a knock, and what it costs.
                Here is every species we build with, side by side, with the tradeoffs spelled out plainly.
              </p>
              <p className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <Link to="/best-wood-for-kitchen-cabinets" className="lux-link text-ivory">Best wood for kitchens</Link>
                <Link to="/cabinet-wood-types-and-costs" className="lux-link text-ivory">Costs per linear foot</Link>
                <Link to="/finishes-colors" className="lux-link text-ivory">Finishes &amp; colors</Link>
              </p>
            </>
          }
        />

        {/* Compare */}
        <section aria-labelledby="compare-title" className="border-t border-white/10 bg-ink-2">
          <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 md:py-28 lg:px-10">
            <div className="mb-12 max-w-3xl" data-reveal="up">
              <p className="lux-eyebrow mb-5">Side by side</p>
              <h2 id="compare-title" className="lux-display text-[clamp(2.3rem,4.6vw,4.25rem)] text-ivory">
                Put two to four woods next to each other.
              </h2>
              <p className="lux-body mt-5 text-base text-ivory/70 sm:text-lg">
                Hardness, grain, cost tier and how each one takes a finish, in one view.
              </p>
            </div>
            <div data-reveal="up" style={{ "--d": "100ms" } as React.CSSProperties}>
              <WoodCompare />
            </div>
          </div>
        </section>

        {/* Every species */}
        <section aria-labelledby="species-title" className="border-t border-white/10">
          <div className="mx-auto max-w-[1440px] px-4 pt-20 sm:px-6 md:pt-28 lg:px-10">
            <div className="max-w-3xl" data-reveal="up">
              <p className="lux-eyebrow mb-5">Every species</p>
              <h2 id="species-title" className="lux-display text-[clamp(2.3rem,4.6vw,4.25rem)] text-ivory">
                {WOOD_SPECIES.length} woods we build with.
              </h2>
            </div>
          </div>

          <nav
            aria-label="Jump to a species"
            className="lux-material sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-30 mt-10 border-y border-white/10 md:top-[calc(5rem+env(safe-area-inset-top,0px))]"
          >
            <div className="mx-auto flex max-w-[1440px] gap-6 overflow-x-auto px-4 scrollbar-none sm:px-6 lg:px-10">
              {WOOD_SPECIES.map((w) => {
                const on = activeSlug === w.slug;
                return (
                  <a
                    key={w.slug}
                    href={`#${w.slug}`}
                    onClick={goToSpecies(w.slug)}
                    aria-current={on ? "true" : undefined}
                    className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap py-4 font-display text-sm transition-colors duration-200 ${
                      on ? "text-ivory" : "text-stone hover:text-ivory"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: w.swatch }} aria-hidden="true" />
                    {w.name}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 bottom-0 h-px origin-left bg-brass transition-transform duration-300 [transition-timing-function:var(--ease-out)] ${
                        on ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </a>
                );
              })}
            </div>
          </nav>

          <ul className="mx-auto grid max-w-[1440px] grid-cols-1 gap-x-6 gap-y-14 px-4 py-14 sm:grid-cols-2 sm:px-6 md:py-20 lg:grid-cols-3 lg:px-10">
            {WOOD_SPECIES.map((w, i) => (
              <li key={w.slug} id={w.slug} className="scroll-mt-40" data-reveal="up" style={{ "--d": `${(i % 3) * 50}ms` } as React.CSSProperties}>
                <Link to={`/wood-species/${w.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink-3">
                    <img
                      src={w.image}
                      alt={`${w.name} cabinet wood, ${w.tagline}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="flex items-center gap-3 font-lux text-[1.9rem] leading-none text-ivory">
                      <span className="h-3 w-3 shrink-0 rounded-full ring-1 ring-white/20" style={{ backgroundColor: w.swatch }} aria-hidden="true" />
                      {w.name}
                    </h3>
                    <span className="font-display text-sm tabular-nums text-brass">{w.costTier}</span>
                  </div>
                  <p className="mt-2 font-lux text-lg italic text-ivory/70">{w.tagline}</p>
                  <p className="lux-body mt-2 line-clamp-3 text-sm text-ivory/60">{w.shortDescription}</p>
                  <div className="mt-4 flex items-center justify-between font-display text-xs text-stone">
                    <span className="tabular-nums">Janka {w.jankaHardness.toLocaleString()} lbf</span>
                    <span className="lux-link text-ivory">Read the guide</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Longer reads */}
        <section aria-labelledby="reads-title" className="border-t border-white/10 bg-ink-2">
          <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 md:py-28 lg:px-10">
            <div className="mb-12 max-w-3xl" data-reveal="up">
              <p className="lux-eyebrow mb-5">Go deeper</p>
              <h2 id="reads-title" className="lux-display text-[clamp(2.3rem,4.6vw,4.25rem)] text-ivory">
                Three longer reads.
              </h2>
            </div>
            <ul className="grid grid-cols-1 gap-px bg-white/10 md:grid-cols-3">
              {[
                { to: "/best-wood-for-kitchen-cabinets", k: "Picks by use case", t: "Best wood for kitchen cabinets", d: "Busy family kitchen, modern minimalist, paint-grade, luxury: what we would pick for each." },
                { to: "/cabinet-wood-types-and-costs", k: "Pricing", t: "Cabinet wood types and costs", d: "Every species we offer by budget, mid-tier and premium, with NYC prices per linear foot." },
                { to: "/natural-wood-kitchen-cabinets", k: "Natural finishes", t: "Natural wood kitchen cabinets", d: "Which woods look best under a clear coat or hardwax oil, and the cuts that make them." },
              ].map((r, i) => (
                <li key={r.to} className="bg-ink-2" data-reveal="up" style={{ "--d": `${i * 50}ms` } as React.CSSProperties}>
                  <Link to={r.to} className="group flex h-full flex-col p-8 transition-colors duration-300 hover:bg-ink-3">
                    <p className="lux-eyebrow mb-6">{r.k}</p>
                    <h3 className="font-lux text-[2rem] leading-tight text-ivory">{r.t}</h3>
                    <p className="lux-body mt-4 flex-1 text-sm text-ivory/65">{r.d}</p>
                    <span className="lux-link mt-8 self-start font-display text-sm text-ivory">Read</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ContactCta />
      </main>

      <Footer />
    </div>
  );
};

export default WoodSpecies;
