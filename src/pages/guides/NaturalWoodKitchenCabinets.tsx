/**
 * /natural-wood-kitchen-cabinets — long-form pillar targeting
 * "natural wood kitchen cabinets" (~2,400/mo). Heavy internal-linking
 * into /wood-species/* details to push authority through the cluster.
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Droplets, Sun, ShieldCheck } from "lucide-react";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema, buildFaqSchema } from "@/lib/articleSchema";
import { WOOD_SPECIES } from "@/data/woodSpecies";

const URL = "https://greencabinetsny.com/natural-wood-kitchen-cabinets";
const TITLE = "Natural Wood Kitchen Cabinets — Species & 2026 NYC Costs";
const DESC =
  "Cabinetmaker's deep-dive on natural wood kitchen cabinets: best unstained species, four protective finishes, grain that ages well, and NYC custom costs.";

const link = (slug: string) => `/wood-species/${slug}`;

const NATURAL_PICKS = [
  {
    slug: "white-oak",
    name: "White Oak",
    look: "Honey-amber to soft caramel",
    why: "The single most-requested natural wood for modern kitchens. Tight grain, dimensionally stable, takes a clear hardwax-oil finish without going orange the way red oak does.",
    janka: 1360,
    bestFor: "Modern, transitional, Scandinavian, Japandi",
  },
  {
    slug: "rift-cut-white-oak",
    name: "Rift-Cut White Oak",
    look: "Dead-straight, almost no figure",
    why: "Rift-sawing the log produces nearly parallel grain lines. Reads architectural and minimal. Same color and durability as plain white oak, ~25–35% pricier due to lumber yield.",
    janka: 1360,
    bestFor: "Modern, minimalist, design-forward",
  },
  {
    slug: "walnut",
    name: "American Walnut",
    look: "Deep chocolate with purple undertones",
    why: "No stain required and no domestic hardwood comes close to its natural color depth. Lightens slightly with UV over 12–18 months — the patina is part of the appeal.",
    janka: 1010,
    bestFor: "Premium, midcentury, library kitchens",
  },
  {
    slug: "cherry",
    name: "Cherry",
    look: "Pink-blonde out of the planer, deep reddish-brown after a year",
    why: "The most dramatic natural color shift of any cabinet wood. Goes from pale pink to rich amber-red over the first 6–12 months of UV exposure. Plan for the finished color, not the install color.",
    janka: 950,
    bestFor: "Traditional, transitional, warm-modern",
  },
  {
    slug: "maple",
    name: "Hard Maple",
    look: "Pale cream to soft blonde",
    why: "The lightest common natural cabinet wood. Reads clean and modern, especially against dark stone or deep-color walls. Tight closed-pore grain — not for clients who want visible figure.",
    janka: 1450,
    bestFor: "Scandinavian, modern, light-filled kitchens",
  },
  {
    slug: "ash",
    name: "White Ash",
    look: "Pale blonde with strong cathedral grain",
    why: "Looks like white oak's cheaper cousin but with bolder grain. Excellent natural option when oak is over budget. Slightly more open-grained than oak.",
    janka: 1320,
    bestFor: "Modern, transitional, budget-conscious",
  },
  {
    slug: "hickory",
    name: "Hickory",
    look: "Dramatic light-to-dark variation in the same door",
    why: "Maximum natural color contrast — sapwood near-white, heartwood deep brown, often on the same plank. Hardest commercial domestic hardwood (1,820 Janka). Pairs with rustic, farmhouse, or contrasting modern.",
    janka: 1820,
    bestFor: "Rustic, farmhouse, durable family kitchens",
  },
  {
    slug: "quartersawn-oak",
    name: "Quartersawn Oak",
    look: "Straight grain with visible medullary ray flecks",
    why: "The classic Mission / Stickley natural oak look. Quarter-sawing exposes the medullary rays as subtle silver flecks — instantly traditional even in a modern kitchen.",
    janka: 1360,
    bestFor: "Mission, Craftsman, traditional, reading room",
  },
];

const FINISHES = [
  {
    name: "Hardwax oil (Rubio Monocoat, Osmo)",
    icon: Leaf,
    body: "Soaks into the wood instead of forming a film. Looks and feels closest to raw wood, easy to spot-repair, low VOC. Trade-off: no real water resistance — needs a re-coat every 2–4 years on heavy-use cabinets. Our default for natural white oak and walnut.",
  },
  {
    name: "Water-based polyurethane",
    icon: Droplets,
    body: "Clear film finish, low VOC, doesn't yellow. Best protection of any natural finish — handles spills, splashes, kid drinks. Trade-off: feels slightly plasticky to the touch and obscures the deepest grain. Best for families and rentals.",
  },
  {
    name: "Conversion varnish",
    icon: ShieldCheck,
    body: "Two-part catalyzed clear coat used in high-end kitchens. Hardest, most durable clear film available. Trade-off: requires professional spray application, slight amber cast that can warm walnut or cherry too far.",
  },
  {
    name: "UV-cured clear",
    icon: Sun,
    body: "Factory finish cured under UV light in seconds. Used on premium European veneer doors. Effectively bulletproof but not field-applicable — door has to come back to a UV booth for repairs.",
  },
];

const FAQ = [
  {
    q: "Do natural wood kitchen cabinets stain easily?",
    a: "Less than people think — natural cabinets get the same clear protective topcoat as stained ones. The myth comes from raw wood floors, which are different. With hardwax oil or water-based poly, natural white oak handles wine, oil, and citrus the same as a stained cabinet.",
  },
  {
    q: "Will natural wood cabinets yellow over time?",
    a: "Some species do, on purpose. Cherry deepens from pink to red-brown. Walnut lightens slightly. White oak holds its color very well under modern water-based finishes. Old-school oil-based polyurethane (the yellowing kind) is rarely used anymore.",
  },
  {
    q: "Are natural wood cabinets more expensive than painted?",
    a: "Usually 10–25% more in solid hardwood, because the wood has to be visually clean — no defects to hide under paint. Walnut and rift-cut white oak run 30–60% premium over a painted maple cabinet of the same construction.",
  },
  {
    q: "What's the most popular natural wood for modern kitchens?",
    a: "White oak, by a large margin. Rift-cut for the most modern look, plain-sawn for warmth. We've built more natural white oak kitchens in the last three years than every other natural species combined.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-05-13",
  about: NATURAL_PICKS.map((p) => p.name).join(", "),
  keywords:
    "natural wood kitchen cabinets, natural wood cabinets, unstained kitchen cabinets, white oak kitchen cabinets, walnut kitchen cabinets, hardwax oil cabinets",
});

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Best species for natural wood kitchen cabinets",
  itemListElement: NATURAL_PICKS.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.name,
    url: `https://greencabinetsny.com${link(p.slug)}`,
  })),
};

const faqSchema = buildFaqSchema(FAQ);

const NaturalWoodKitchenCabinets = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="natural wood kitchen cabinets, natural wood cabinets, unstained cabinets, natural white oak cabinets, natural walnut cabinets, hardwax oil cabinets, clear coat cabinets"
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
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>

    <BreadcrumbSchema
      items={[
        { name: "Home", url: "/" },
        { name: "Wood Species", url: "/wood-species" },
        { name: "Natural Wood Kitchen Cabinets", url: URL },
      ]}
    />

    <Header />

    <main className="pt-32 sm:pt-36 md:pt-40">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Wood Species", to: "/wood-species" },
          { label: "Natural Wood Kitchen Cabinets" },
        ]}
      />

      <section className="bg-[#d5d5d5] py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-accent font-semibold mb-3">
            Updated 2026 · Species, finishes, costs
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">
            Natural Wood Kitchen Cabinets — A Cabinetmaker's Guide
          </h1>
          <p className="text-base sm:text-lg text-[#444] mb-6">
            Natural wood is back in NYC kitchens — but only some species look right unstained,
            and the finish you put on top decides how the cabinets look in five years. Here's how
            we pick, finish, and price natural wood at our Bushwick shop.
          </p>
          <div className="flex justify-center">
            <AuthorByline author="golan" label="Written by" />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">TL;DR</h2>
          <p className="text-base text-muted-foreground mb-12 leading-relaxed">
            For most natural wood kitchens, pick{" "}
            <Link to={link("white-oak")} className="text-accent font-semibold hover:underline">white oak</Link>{" "}
            in plain or{" "}
            <Link to={link("rift-cut-white-oak")} className="text-accent font-semibold hover:underline">rift-cut</Link>,
            finished in hardwax oil. Want premium?{" "}
            <Link to={link("walnut")} className="text-accent font-semibold hover:underline">walnut</Link>.
            Want cheap?{" "}
            <Link to={link("ash")} className="text-accent font-semibold hover:underline">white ash</Link>.
            Want maximum durability?{" "}
            <Link to={link("hickory")} className="text-accent font-semibold hover:underline">hickory</Link>.
            Skip red oak and birch — they don't read well unstained.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Eight species that actually look good unstained</h2>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            Not every hardwood looks intentional without stain. These eight do — each linked to
            our full species deep-dive with Janka, grain photos, and pricing.
          </p>

          <div className="space-y-5 mb-16">
            {NATURAL_PICKS.map((p) => (
              <article
                key={p.slug}
                className="border border-border rounded-lg p-6 hover:border-[#5C7650] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    <Link to={link(p.slug)} className="hover:text-accent transition-colors">
                      {p.name} <ArrowRight className="inline h-4 w-4" />
                    </Link>
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground whitespace-nowrap mt-1">
                    Janka {p.janka.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm italic text-accent mb-2">{p.look}</p>
                <p className="text-base text-muted-foreground leading-relaxed mb-3">{p.why}</p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Best for:</strong> {p.bestFor} ·{" "}
                  <Link to={link(p.slug)} className="text-accent hover:underline">Full {p.name} spec sheet →</Link>
                </p>
              </article>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Species we don't recommend natural</h2>
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
            Honest disclosure — these woods are great, just not unstained:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12 leading-relaxed">
            <li>
              <Link to={link("red-oak")} className="text-accent hover:underline">Red oak</Link> — pink-orange undertone reads dated unstained. Stain it and it's a budget hero.
            </li>
            <li>
              <Link to={link("birch")} className="text-accent hover:underline">Birch</Link> — color varies wildly door to door, looks restless without a unifying stain.
            </li>
            <li>
              <Link to={link("alder")} className="text-accent hover:underline">Knotty alder</Link> — too soft for natural; the knots crack and the surface dents. Great for distressed-rustic stained doors.
            </li>
            <li>
              <Link to={link("beech")} className="text-accent hover:underline">European beech</Link> — has a pinkish cast that fights with most stones and backsplashes when left clear.
            </li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">The finish decides the next 10 years</h2>
          <p className="text-base text-muted-foreground mb-6 leading-relaxed">
            "Natural" doesn't mean raw. Every natural wood cabinet needs a clear protective layer.
            The system you pick determines the look, the feel, and how the kitchen ages.
          </p>
          <div className="grid sm:grid-cols-2 gap-5 mb-16">
            {FINISHES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="border border-border rounded-lg p-5">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <Icon className="h-5 w-5 text-accent" /> {f.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              );
            })}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Cut matters as much as species</h2>
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
            How the log is sawn changes the visual entirely — same tree, three different looks:
          </p>
          <ul className="list-disc pl-5 space-y-3 text-base text-muted-foreground mb-12 leading-relaxed">
            <li>
              <strong>Plain-sawn:</strong> Cathedral arches and waves. Most affordable yield, most traditional read. Default for{" "}
              <Link to={link("white-oak")} className="text-accent hover:underline">plain white oak</Link>.
            </li>
            <li>
              <strong>Rift-sawn:</strong> Straight, parallel grain lines. ~25–35% pricier. The most modern read — see{" "}
              <Link to={link("rift-cut-white-oak")} className="text-accent hover:underline">rift-cut white oak</Link>.
            </li>
            <li>
              <strong>Quartersawn:</strong> Straight grain with visible medullary ray flecks. Mission/Craftsman classic — see{" "}
              <Link to={link("quartersawn-oak")} className="text-accent hover:underline">quartersawn oak</Link>.
            </li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">What natural wood kitchens cost in NYC</h2>
          <p className="text-base text-muted-foreground mb-3 leading-relaxed">
            Pricing at our Bushwick shop, blended baseline of $350 per linear foot for solid
            hardwood doors and dovetail boxes. Premiums apply on top of base:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>Plain white oak, hardwax-oil:</strong> +5–10%</li>
            <li><strong>Rift-cut white oak, hardwax-oil:</strong> +30–40%</li>
            <li><strong>Walnut, water-based clear:</strong> +35–55%</li>
            <li><strong>Cherry, conversion varnish:</strong> +15–25%</li>
            <li><strong>Hickory or rustic hickory:</strong> +10–20%</li>
            <li><strong>White ash (budget natural):</strong> ±0%</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">FAQ</h2>
          <div className="space-y-5 mb-12">
            {FAQ.map((f) => (
              <div key={f.q} className="border-l-2 border-[#5C7650] pl-4 py-1">
                <h3 className="font-bold text-foreground mb-1">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="p-6 border border-border rounded-lg bg-muted/30 mb-12">
            <p className="text-sm text-muted-foreground mb-3">
              Browse all {WOOD_SPECIES.length} species we mill — Janka, grain, cost, and finish notes per species.
            </p>
            <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] hover:scale-105 transition-all">
              <Link to="/wood-species">Open the full wood species guide <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Related reading</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
            <li><Link to="/best-wood-for-kitchen-cabinets" className="text-accent hover:underline">Best wood for kitchen cabinets — picks by use case</Link></li>
            <li><Link to="/cabinet-wood-types-and-costs" className="text-accent hover:underline">Cabinet wood types and costs — all 14 species compared</Link></li>
            <li><Link to="/finishes-colors" className="text-accent hover:underline">Finishes & colors — see natural-wood swatches in person</Link></li>
          </ul>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default NaturalWoodKitchenCabinets;
