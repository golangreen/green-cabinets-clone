/**
 * /cabinet-wood-types-and-costs — long-form pillar targeting
 * "cabinet wood types and costs" (480/mo) + "types of wood cabinets" (880/mo).
 * Cost-per-linear-foot table per species + Article schema + Table schema.
 * Pricing is published rate ($350/lf blended for full custom kitchen);
 * per-species premiums below are informational only (not point-of-sale prices).
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { authorRef, ORG_ID } from "@/data/authors";

const URL = "https://greencabinetsny.com/cabinet-wood-types-and-costs";
const TITLE = "Cabinet Wood Types and Costs — Per-Linear-Foot Guide (2026)";
const DESC =
  "All 14 cabinet wood types we mill, with Janka hardness, grain pattern, and real per-linear-foot cost premiums. Maple, oak, walnut, hickory, cherry, ash, mahogany, alder, beech, rift-cut and quartersawn oak.";

interface Row {
  slug: string;
  name: string;
  janka: number;
  grain: "Closed, tight" | "Closed, fine" | "Open, cathedral" | "Straight, ribbon" | "Knotty, wild" | "Open, ribboned";
  tier: "Budget" | "Mid" | "Premium" | "Luxury";
  /** Premium over our $350/lf blended baseline. Negative = cheaper. */
  premiumLf: string;
  bestFor: string;
}

const ROWS: Row[] = [
  { slug: "red-oak", name: "Red Oak", janka: 1290, grain: "Open, cathedral", tier: "Budget", premiumLf: "−$25 to −$15", bestFor: "Stained traditional kitchens on a budget" },
  { slug: "alder", name: "Knotty Alder", janka: 590, grain: "Closed, fine", tier: "Budget", premiumLf: "−$20 to −$10", bestFor: "Rustic, distressed, low-impact use" },
  { slug: "birch", name: "Birch", janka: 1260, grain: "Closed, fine", tier: "Budget", premiumLf: "−$15 to $0", bestFor: "Paint-grade alternative to maple" },
  { slug: "maple", name: "Hard Maple", janka: 1450, grain: "Closed, tight", tier: "Mid", premiumLf: "Baseline ($350/lf)", bestFor: "The default for painted shaker cabinets" },
  { slug: "ash", name: "White Ash", janka: 1320, grain: "Open, cathedral", tier: "Mid", premiumLf: "+$10 to +$25", bestFor: "Oak look with lighter, blonder color" },
  { slug: "white-oak", name: "White Oak", janka: 1360, grain: "Open, cathedral", tier: "Mid", premiumLf: "+$25 to +$50", bestFor: "Stained or natural, modern or traditional" },
  { slug: "hickory", name: "Hickory", janka: 1820, grain: "Open, ribboned", tier: "Mid", premiumLf: "+$25 to +$50", bestFor: "Maximum durability — kids, dogs, rentals" },
  { slug: "cherry", name: "Cherry", janka: 950, grain: "Closed, fine", tier: "Mid", premiumLf: "+$30 to +$60", bestFor: "Warm traditional, develops patina with UV" },
  { slug: "beech", name: "European Beech", janka: 1300, grain: "Closed, tight", tier: "Mid", premiumLf: "+$30 to +$60", bestFor: "European-style frameless construction" },
  { slug: "rustic-hickory", name: "Rustic Hickory", janka: 1820, grain: "Knotty, wild", tier: "Mid", premiumLf: "+$25 to +$50", bestFor: "Farmhouse, character-rich, plank-style fronts" },
  { slug: "quartersawn-oak", name: "Quartersawn White Oak", janka: 1360, grain: "Straight, ribbon", tier: "Premium", premiumLf: "+$60 to +$100", bestFor: "Mission, Stickley, Arts & Crafts" },
  { slug: "rift-cut-white-oak", name: "Rift-Cut White Oak", janka: 1360, grain: "Straight, ribbon", tier: "Premium", premiumLf: "+$75 to +$125", bestFor: "Modern minimalist, architectural slab fronts" },
  { slug: "walnut", name: "American Walnut", janka: 1010, grain: "Open, cathedral", tier: "Luxury", premiumLf: "+$100 to +$200", bestFor: "Premium contemporary kitchens, islands, uppers" },
  { slug: "mahogany", name: "Mahogany (Khaya)", janka: 1070, grain: "Open, ribboned", tier: "Luxury", premiumLf: "+$125 to +$250", bestFor: "High-gloss French polish, traditional libraries" },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${URL}#article`,
  headline: TITLE,
  description: DESC,
  author: authorRef("golan"),
  publisher: { "@id": ORG_ID },
  datePublished: "2026-05-13",
  dateModified: new Date().toISOString().slice(0, 10),
  image: ["https://greencabinetsny.com/og-image.jpg"],
  mainEntityOfPage: { "@type": "WebPage", "@id": URL },
  keywords:
    "cabinet wood types and costs, types of wood cabinets, cabinet wood, hardwood cabinet costs, kitchen cabinet wood prices, wood cabinet comparison",
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Cabinet wood types with Janka hardness and per-linear-foot cost premium",
  numberOfItems: ROWS.length,
  itemListElement: ROWS.map((r, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `${r.name} — Janka ${r.janka}, ${r.tier}, ${r.premiumLf}`,
    url: `https://greencabinetsny.com/wood-species/${r.slug}`,
  })),
};

const tierBadge: Record<Row["tier"], string> = {
  Budget: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  Mid: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  Premium: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  Luxury: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
};

const CabinetWoodTypesAndCosts = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="cabinet wood types and costs, types of wood cabinets, cabinet wood prices, kitchen cabinet wood, hardwood cabinet costs, cabinet wood comparison"
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
    </Helmet>

    <BreadcrumbSchema
      items={[
        { name: "Home", url: "/" },
        { name: "Wood Species", url: "/wood-species" },
        { name: "Cabinet Wood Types and Costs", url: URL },
      ]}
    />

    <Header />

    <main className="pt-32 sm:pt-36 md:pt-40">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Wood Species", to: "/wood-species" },
          { label: "Cabinet Wood Types and Costs" },
        ]}
      />

      <section className="bg-[#d5d5d5] py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            14 species · Janka hardness · Per-lf premiums · 2026
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">
            Cabinet Wood Types and Costs
          </h1>
          <p className="text-base sm:text-lg text-[#444]">
            Every hardwood we mill at our Bushwick shop, with real cost premiums over our $350 per
            linear foot blended baseline. Use this to triage species before reading the
            individual deep-dives.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="border border-border rounded-lg overflow-hidden mb-10">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-3 py-3 font-semibold">Species</th>
                  <th className="text-left px-3 py-3 font-semibold">Janka</th>
                  <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">Grain</th>
                  <th className="text-left px-3 py-3 font-semibold">Tier</th>
                  <th className="text-left px-3 py-3 font-semibold">Premium / lf</th>
                  <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">Best for</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ROWS.map((r) => (
                  <tr key={r.slug} className="hover:bg-muted/40">
                    <td className="px-3 py-3 font-medium">
                      <Link to={`/wood-species/${r.slug}`} className="text-[#5C7650] hover:underline">
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{r.janka}</td>
                    <td className="px-3 py-3 text-muted-foreground hidden sm:table-cell">{r.grain}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${tierBadge[r.tier]}`}>
                        {r.tier}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{r.premiumLf}</td>
                    <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{r.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">How to read this table</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground leading-relaxed mb-10">
            <li>
              <strong>Baseline:</strong> $350/lf is our published rate for full-custom kitchen
              cabinets in hard maple. That covers shop-sprayed paint or stain, soft-close
              hardware, and 3/4-inch plywood boxes.
            </li>
            <li>
              <strong>Premium / lf</strong> is the additional cost (or savings) over baseline when
              the same kitchen is built in that species. A 22-linear-foot kitchen in walnut runs
              roughly $2,200–$4,400 more than the same kitchen in maple.
            </li>
            <li>
              <strong>Janka hardness</strong> is the standard side-hardness measure (lbf, USDA
              Forest Products Lab). Higher = harder to dent.
            </li>
            <li>
              <strong>Tier</strong> reflects lumber cost <em>and</em> waste / yield. Rift-cut and
              quartersawn oak are pricey not because the lumber is rare, but because cutting straight
              grain throws away half the log.
            </li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Cost factors beyond the wood</h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-3">
            Wood is roughly 25–35% of total cabinet cost. The rest:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground leading-relaxed mb-10">
            <li><strong>Door style</strong> — slab fronts are cheapest, shaker is mid, raised-panel and inset adds 15–30%.</li>
            <li><strong>Finish</strong> — single-stage paint vs catalyzed conversion varnish vs hand-rubbed oil all swing $20–$60/lf.</li>
            <li><strong>Hardware</strong> — Blum vs Hettich vs Salice tandem boxes, soft-close, push-to-open. Easily $40–$100/lf delta.</li>
            <li><strong>Box construction</strong> — 3/4" plywood baseline; melamine interior or pre-finished maple ply add cost.</li>
            <li><strong>Install</strong> — Brooklyn brownstone parlor floor is cheap; 5th-floor walk-up is not.</li>
          </ul>

          <div className="p-6 border border-border rounded-lg bg-muted/30 mb-10">
            <h2 className="text-xl font-bold mb-2">Want a real number for your kitchen?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Send us your linear footage, preferred species, and door style — we quote in 24 hours.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] hover:scale-105 transition-all">
                <Link to="/#contact">Get a quote <ArrowRight className="h-4 w-4 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="hover:scale-105 transition-all">
                <Link to="/best-wood-for-kitchen-cabinets">Best wood by use case</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default CabinetWoodTypesAndCosts;
