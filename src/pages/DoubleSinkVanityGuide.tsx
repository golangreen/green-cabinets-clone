/**
 * /double-sink-vanity-guide — long-form pillar targeting
 * "double sink vanity" (~18,100/mo, KDI 30).
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler, Droplets, DollarSign } from "lucide-react";
import AuthorByline from "@/components/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/double-sink-vanity-guide";
const TITLE = "Double Sink Vanity — Sizes, Layouts & NYC Cost Guide (2026)";
const DESC =
  "What size double sink vanity you actually need, the four working layouts, plumbing rough-in dimensions, and what a custom double vanity costs in NYC. From a Bushwick cabinetmaker.";

const SIZES = [
  { width: '60"', verdict: "Absolute minimum", note: "Two 18\" basins centered 36\" apart, 12\" of usable counter between. Tight but workable." },
  { width: '66"', verdict: "Comfortable couple", note: "Adds 6\" of shared counter. The size we recommend most often for primary baths." },
  { width: '72"', verdict: "Standard luxury", note: "Two 21\" basins, generous shared landing zone, drawers under each sink." },
  { width: '84"', verdict: "Pre-war / brownstone", note: "Center tower of drawers between sinks. Best layout if you have the wall." },
  { width: '96"+', verdict: "Custom millwork", note: "Furniture-style legs, mitered ends, built-in laundry hampers — fully bespoke." },
];

const LAYOUTS = [
  { name: "Symmetric basins, doors under each", best: "Couples who don't fight over storage" },
  { name: "Symmetric basins, drawer banks under each", best: "Most requested layout — drawers beat doors for cosmetics & toiletries" },
  { name: "Symmetric basins, center tower of drawers", best: "72\"+ vanities; tower hides outlets and a built-in toothbrush dock" },
  { name: "Offset basins toward outside walls", best: "Galley baths where you need a shared makeup landing in the middle" },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-05-13",
  keywords: "double sink vanity, double vanity, 60 inch double vanity, 72 inch double vanity, custom double vanity nyc",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the minimum width for a double sink vanity?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "60 inches is the practical minimum. Below that, the basins crowd each other and there is no usable counter between them. 66\"–72\" is far more comfortable.",
      },
    },
    {
      "@type": "Question",
      name: "How far apart should the two sinks be?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Center-to-center, 30\" minimum, 36\"+ preferred. That gives roughly 12\"–18\" of usable counter between basins for shared landing space.",
      },
    },
    {
      "@type": "Question",
      name: "What does a custom double vanity cost in NYC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At Green Cabinets NY, custom double vanities start around $4,500 for a painted 60\" unit and run $7,500–$12,000 for 72\"–84\" with hardwood drawer fronts, soft-close hardware, and a center tower. Stone, faucets, and install are separate.",
      },
    },
    {
      "@type": "Question",
      name: "Single deep drawer or two stacked drawers under each sink?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Two stacked drawers (a shallow top and a U-cut deep bottom around the P-trap) almost always wins — the top drawer holds daily items at counter height while the bottom holds bulk storage.",
      },
    },
  ],
};

const DoubleSinkVanityGuide = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="description" content={DESC} />
      <meta name="keywords" content="double sink vanity, double vanity, 60 double vanity, 72 double vanity, custom double vanity, double vanity nyc, double bathroom vanity" />
      <link rel="canonical" href={URL} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={URL} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESC} />
      <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
      <meta property="article:author" content="Golan Achdary" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>

    <BreadcrumbSchema
      items={[
        { name: "Home", url: "/" },
        { name: "Vanities", url: "/vanity-designer" },
        { name: "Double Sink Vanity Guide", url: URL },
      ]}
    />

    <Header />

    <main className="pt-32 sm:pt-36 md:pt-40">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Vanities", to: "/vanity-designer" },
          { label: "Double Sink Vanity Guide" },
        ]}
      />

      <section className="bg-[#d5d5d5] py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            Updated 2026 · NYC sizing & cost
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">
            Double Sink Vanity — Sizes, Layouts & NYC Cost
          </h1>
          <p className="text-base sm:text-lg text-[#444] mb-6">
            Two-sink vanities solve more arguments than any other piece of cabinetry we build.
            Here's how to size one for your bathroom, the four layouts that actually work, and
            what custom double vanities cost in New York City.
          </p>
          <div className="flex justify-center">
            <AuthorByline author="golan" label="Written by" />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
            <Ruler className="h-6 w-6 text-[#5C7650]" /> What size do you actually need?
          </h2>
          <p className="text-base text-muted-foreground mb-6 leading-relaxed">
            The honest answer: 60 inches is the bare minimum and 66–72 is where it actually feels
            like two people can use it at the same time. Anything under 60" is two faucets in one
            sink — it doesn't earn the title.
          </p>

          <div className="border border-border rounded-lg overflow-hidden mb-12">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Width</th>
                  <th className="text-left px-4 py-3 font-semibold">Verdict</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Why</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map((s) => (
                  <tr key={s.width} className="border-t border-border">
                    <td className="px-4 py-3 font-mono font-semibold text-foreground">{s.width}</td>
                    <td className="px-4 py-3 text-foreground">{s.verdict}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Four layouts that work</h2>
          <p className="text-base text-muted-foreground mb-6 leading-relaxed">
            Every double vanity we've built in the last five years is one of these four. Pick by
            how you actually live, not how it photographs.
          </p>
          <div className="space-y-4 mb-12">
            {LAYOUTS.map((l, i) => (
              <article key={i} className="border border-border rounded-lg p-5 hover:border-[#5C7650] transition-colors">
                <h3 className="text-lg font-bold text-foreground mb-1">{i + 1}. {l.name}</h3>
                <p className="text-sm text-muted-foreground"><strong className="text-foreground">Best for:</strong> {l.best}</p>
              </article>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
            <Droplets className="h-6 w-6 text-[#5C7650]" /> Plumbing rough-in
          </h2>
          <p className="text-base text-muted-foreground mb-3 leading-relaxed">
            If you're roughing in plumbing for a future double vanity, give the plumber these
            numbers and walk away:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>Center-to-center between drains:</strong> 30" minimum, 36" preferred.</li>
            <li><strong>Drain height:</strong> 18"–20" off finished floor for adult-height vanities (34½" finished).</li>
            <li><strong>Hot/cold supply height:</strong> 22"–24" off finished floor, 4" outboard of drain.</li>
            <li><strong>Distance from sidewall:</strong> drain centerline 12" minimum from any return wall.</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[#5C7650]" /> What it costs in NYC
          </h2>
          <p className="text-base text-muted-foreground mb-3 leading-relaxed">
            Custom double vanities at our Bushwick shop, painted MDF doors with hardwood drawer
            boxes, soft-close Blum hardware, U-cut around P-trap. Stone, faucets, and install
            quoted separately by your contractor or our partner trades.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>60" painted, doors under both:</strong> ~$4,500–$5,500</li>
            <li><strong>66"–72" painted, drawer banks under both:</strong> ~$6,500–$8,500</li>
            <li><strong>72"–84" with center tower of drawers:</strong> ~$8,500–$11,500</li>
            <li><strong>White-oak or walnut, furniture-style:</strong> add 25–40%</li>
          </ul>

          <div className="p-6 border border-border rounded-lg bg-muted/30 mb-8">
            <p className="text-sm text-muted-foreground mb-3">
              Configure your double vanity, pick a finish, and get a price in under two minutes.
            </p>
            <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] hover:scale-105 transition-all">
              <Link to="/vanity-designer">Open the vanity designer <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Related reading</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
            <li><Link to="/floating-bathroom-vanity" className="text-[#5C7650] hover:underline">Floating vs. legs vs. furniture-style vanities</Link></li>
            <li><Link to="/small-bathroom-vanity-ideas" className="text-[#5C7650] hover:underline">Small bathroom vanity ideas under 36"</Link></li>
            <li><Link to="/best-wood-for-kitchen-cabinets" className="text-[#5C7650] hover:underline">Best wood for cabinetry — also applies to vanities</Link></li>
            <li><Link to="/reach-in-closet-systems-nyc" className="text-[#5C7650] hover:underline">Reach-in closet systems for NYC apartments</Link></li>
          </ul>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default DoubleSinkVanityGuide;
