/**
 * /best-wood-for-kitchen-cabinets — long-form pillar targeting
 * "best wood for kitchen cabinets" (~1,180/mo combined, KDI ~12).
 * Opinionated picks per use-case, internal links to /wood-species/* details.
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";
import AuthorByline from "@/components/AuthorByline";
import { buildArticleSchema, buildFaqSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/best-wood-for-kitchen-cabinets";
const TITLE = "Best Wood for Kitchen Cabinets 2026 — Honest Picks";
const DESC =
  "Cabinetmaker's opinionated guide to the best wood for kitchen cabinets — paint, stain, durability, modern, traditional. Janka, costs, finish notes.";

const PICKS = [
  {
    title: "Best overall for painted cabinets",
    winner: "Hard maple",
    slug: "maple",
    why: "Tight, even closed-pore grain stays smooth under multiple paint coats and resists telegraphing. Janka 1,450 — hard enough to take edge dings without denting like poplar. The single best paint-grade hardwood we mill.",
    runnerUp: "Birch (cheaper, similar grain, slightly softer at 1,260)",
  },
  {
    title: "Best overall for stained or natural cabinets",
    winner: "White oak",
    slug: "white-oak",
    why: "Cathedral grain that takes everything from clear hardwax oil to Belgian smoked stains. Most dimensionally stable common hardwood — doors stay flat in NYC humidity. Janka 1,360.",
    runnerUp: "Rift-cut or quartersawn oak (straighter, more modern, ~25% pricier)",
  },
  {
    title: "Best for absolute durability",
    winner: "Hickory",
    slug: "hickory",
    why: "Janka 1,820 — the hardest commercial North American hardwood. Roughly 25% harder than hard maple, 40% harder than red oak. For families with kids, dogs, or heavy cooks, nothing else comes close.",
    runnerUp: "Hard maple (1,450, easier to source in clear grades)",
  },
  {
    title: "Best on a budget",
    winner: "Red oak",
    slug: "red-oak",
    why: "30–40% cheaper than white oak with the same hardness (1,290). Open grain reads more traditional but takes a wide range of stains. Avoid for paint-grade work — open pores telegraph through.",
    runnerUp: "Birch (cleaner grain, similar price, lower hardness 1,260)",
  },
  {
    title: "Best for modern minimalist kitchens",
    winner: "Rift-cut white oak",
    slug: "rift-cut-white-oak",
    why: "Dead-straight, nearly flake-free grain. Reads architectural and modern. Same hardness and stability as plain white oak (1,360) but ~25–35% pricier due to lumber yield.",
    runnerUp: "Quartersawn oak (visible medullary ray flecks, more traditional)",
  },
  {
    title: "Best for traditional or transitional kitchens",
    winner: "Cherry",
    slug: "cherry",
    why: "Warm reddish-brown that deepens beautifully with UV exposure over the first 6–12 months. Janka 950 — softer than oak so edges need care. The classic American traditional kitchen wood.",
    runnerUp: "Knotty alder (rustic-traditional, much softer at 590, much cheaper)",
  },
  {
    title: "Best for premium luxury work",
    winner: "American walnut",
    slug: "walnut",
    why: "Deep chocolate tones with no stain required. Most expensive common domestic hardwood. Janka 1,010 — soft enough that we recommend it for low-impact zones (uppers, islands) over base cabinets that take constant wear.",
    runnerUp: "Mahogany (similar prestige, gorgeous on French-polished libraries)",
  },
  {
    title: "Best for rustic or farmhouse kitchens",
    winner: "Rustic hickory",
    slug: "rustic-hickory",
    why: "Maximum knot and color variation in the same Janka 1,820 hardwood. Each door is unique. Pairs with shaker, beaded, or plank-style fronts.",
    runnerUp: "Knotty alder (softer, cheaper, easier to distress)",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-05-13",
  about: PICKS.map((p) => `${p.title}: ${p.winner}`).join(" | "),
  keywords:
    "best wood for kitchen cabinets, best wood for cabinets, cabinet wood, paint-grade cabinets, stain-grade cabinets, hardwood kitchen cabinets",
});

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Best wood for kitchen cabinets — picks by use case",
  itemListElement: PICKS.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `${p.title}: ${p.winner}`,
    url: `https://greencabinetsny.com/wood-species/${p.slug}`,
  })),
};

const FAQ = [
  { q: "What is the best wood for kitchen cabinets overall?", a: "There is no single best wood — there is a best wood per use case. For paint-grade work, hard maple. For stained or natural, white oak. For maximum durability, hickory. For premium, walnut. For modern minimalist, rift-cut white oak. For tight budget, red oak." },
  { q: "What is the best wood for painted kitchen cabinets?", a: "Hard maple. Tight closed-pore grain stays smooth under multiple paint coats and Janka 1,450 means edges resist denting. Birch is a 15–20% cheaper alternative with similar grain at slightly lower hardness (1,260)." },
  { q: "What is the best wood for stained or natural kitchen cabinets?", a: "White oak. Cathedral grain takes everything from clear hardwax oil to Belgian smoked stains, and it is the most dimensionally stable common hardwood — doors stay flat in NYC humidity. Walnut is the premium upgrade if budget allows." },
  { q: "What is the most durable wood for kitchen cabinets?", a: "Hickory at Janka 1,820 — the hardest commercial North American hardwood. Roughly 25% harder than hard maple, 40% harder than red oak. The right pick for households with kids, dogs, or heavy daily cooking." },
  { q: "What is the cheapest good wood for kitchen cabinets?", a: "Red oak for stained work, knotty alder for rustic, birch for paint-grade. All three run $15–$25 per linear foot below our $350/lf blended baseline. Red oak is hardest of the three (1,290 Janka) and the most versatile." },
  { q: "What is the best wood for modern kitchen cabinets?", a: "Rift-cut white oak. Dead-straight, flake-free grain reads architectural and minimalist. Same hardness and stability as plain white oak (1,360 Janka) but ~25–35% pricier due to lumber yield." },
  { q: "What wood looks the most luxurious for kitchen cabinets?", a: "American walnut, by consensus. Deep chocolate tones with no stain required. Cost premium of $100–$200 per linear foot over the baseline. Janka 1,010 means it dents easier than oak — best on islands and uppers, less ideal for hard-use base cabinets." },
  { q: "Should I choose solid wood or wood veneer for cabinet doors?", a: "Solid wood for shaker, raised-panel, and inset doors — the construction depends on it. Veneer over MDF or ply for slab doors (especially modern, large-format slabs), because solid wood that wide will warp and split with seasonal humidity. A flat-panel center on a shaker door is also typically veneered ply for the same reason." },
];

const faqSchema = buildFaqSchema(FAQ);

const BestWoodForKitchenCabinets = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="best wood for kitchen cabinets, best wood for cabinets, cabinet wood, paint grade wood, stain grade wood, hardwood cabinets, durable cabinet wood"
      />
      <link rel="canonical" href={URL} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={URL} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESC} />
      <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
      <meta property="article:author" content="Golan Achdary" />
      <meta property="article:section" content="Cabinet Materials" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESC} />
      <meta name="twitter:image" content="https://greencabinetsny.com/og-image.jpg" />
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>

    <BreadcrumbSchema
      items={[
        { name: "Home", url: "/" },
        { name: "Wood Species", url: "/wood-species" },
        { name: "Best Wood for Kitchen Cabinets", url: URL },
      ]}
    />

    <Header />

    <main className="pt-32 sm:pt-36 md:pt-40">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Wood Species", to: "/wood-species" },
          { label: "Best Wood for Kitchen Cabinets" },
        ]}
      />

      <section className="bg-[#d5d5d5] py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            Updated 2026
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">
            Best Wood for Kitchen Cabinets — Honest Picks by Use Case
          </h1>
          <p className="text-base sm:text-lg text-[#444] mb-6">
            There is no single best wood for kitchen cabinets. There is a best wood for{" "}
            <em>your</em> kitchen — once you know whether you're painting or staining, how hard the
            cabinets will get hit, and where you sit on cost. Here's how a Bushwick cabinet shop
            actually picks.
          </p>
          <div className="flex justify-center">
            <AuthorByline author="golan" label="Written by" />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">TL;DR</h2>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            Painting? <strong>Hard maple.</strong> Staining or natural? <strong>White oak.</strong>{" "}
            Maximum durability? <strong>Hickory.</strong> Tight budget? <strong>Red oak.</strong>{" "}
            Modern minimalist? <strong>Rift-cut white oak.</strong> Premium luxury?{" "}
            <strong>Walnut.</strong> Everything else is nuance — read on for the why.
          </p>

          <div className="space-y-6">
            {PICKS.map((p) => (
              <article
                key={p.slug}
                className="border border-border rounded-lg p-6 hover:border-[#5C7650] transition-colors"
              >
                <div className="flex items-start gap-3 mb-2">
                  <Trophy className="h-5 w-5 text-[#5C7650] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.title}</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      <Link to={`/wood-species/${p.slug}`} className="hover:text-[#5C7650] transition-colors">
                        {p.winner} <ArrowRight className="inline h-4 w-4" />
                      </Link>
                    </h3>
                  </div>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-2">{p.why}</p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Runner-up:</strong> {p.runnerUp}
                </p>
              </article>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mt-16 mb-3">How we actually decide</h2>
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
            Five questions, in order. The first one usually eliminates two-thirds of the species
            on the table.
          </p>
          <ol className="list-decimal pl-5 space-y-3 text-base text-muted-foreground leading-relaxed">
            <li>
              <strong>Paint or stain?</strong> Paint demands tight closed-pore grain (maple,
              birch, alder, cherry). Stain rewards open figure (oak, walnut, ash). Mixing them is
              expensive — pick a lane.
            </li>
            <li>
              <strong>How hard will the kitchen get hit?</strong> Janka under 1,000 (alder,
              walnut, cherry) wants a careful household. 1,200–1,500 (red oak, birch, maple, beech)
              is the sweet spot. 1,800+ (hickory) is for dogs, kids, and rentals.
            </li>
            <li>
              <strong>What's the budget?</strong> Per linear foot in solid hardwood: red oak and
              alder are the cheapest, then maple and birch, then white oak / hickory / cherry,
              then rift-cut oak / walnut / mahogany at the top.
            </li>
            <li>
              <strong>Modern or traditional?</strong> Modern wants straight, uniform grain
              (rift-cut oak, quartersawn oak, walnut). Traditional wants character (cherry, red
              oak, hickory, alder).
            </li>
            <li>
              <strong>Sustainability?</strong> All of our domestic species can be sourced
              FSC-certified on request. Tropical hardwoods (mahogany) take more sourcing care.
            </li>
          </ol>

          <h2 className="text-2xl sm:text-3xl font-bold mt-16 mb-3">Frequently asked questions</h2>
          <div className="space-y-5">
            {FAQ.map((f) => (
              <div key={f.q} className="border-l-2 border-[#5C7650] pl-4 py-1">
                <h3 className="font-bold text-foreground mb-1">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 border border-border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground mb-3">
              Want the full spec on any species above — Janka, grain, cost tier, finish behavior,
              pros and cons?
            </p>
            <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] hover:scale-105 transition-all">
              <Link to="/wood-species">Open the full wood species guide <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default BestWoodForKitchenCabinets;
