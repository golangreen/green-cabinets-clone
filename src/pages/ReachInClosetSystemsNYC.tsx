/**
 * /reach-in-closet-systems-nyc — long-form pillar targeting
 * "reach in closet" (~2,900/mo, KDI 20) and "custom closet nyc".
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ruler } from "lucide-react";
import AuthorByline from "@/components/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/reach-in-closet-systems-nyc";
const TITLE = "Reach-In Closet Systems for NYC Apartments — Build Guide";
const DESC =
  "How a Brooklyn cabinet shop builds reach-in closet systems for NYC apartments: standard depths, the four-zone layout, and what it costs.";

const ZONES = [
  { name: "Long-hang (dresses, coats, robes)", depth: "Full hanging, ~70\" tall", width: "12\"–24\" of rod", note: "Allocate only what you actually own — most clients overestimate by 2x." },
  { name: "Double-hang (shirts, pants folded)", depth: "Two rods, 42\" + 42\" stack", width: "Most of the closet", note: "Doubles capacity over a single rod. The default for any closet 6 ft or wider." },
  { name: "Drawer bank", depth: "16\"–18\" deep, 4–6 drawers", width: "18\"–24\" wide", note: "Replaces a dresser. Top two drawers shallow for socks/underwear, bottom deeper for sweaters." },
  { name: "Adjustable shelves", depth: "12\"–14\" deep", width: "Above drawer bank or along ends", note: "Folded items, shoe stacks, bins. Always adjustable — never fixed." },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-05-13",
  keywords: "reach in closet, reach in closet systems, custom closet nyc, custom reach in closet, closet system brooklyn, closet organizer nyc",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What's a standard reach-in closet depth in NYC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "24 inches, wall to wall. Pre-war buildings often run 22\"–26\". Anything under 22\" can't fit a hanger straight — you'll have to angle the rod or remove the back wall.",
      },
    },
    {
      "@type": "Question",
      name: "Double-hang vs single-hang — which holds more?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Double-hang (two rods at 42\" each) holds roughly twice as much as a single 70\" rod, in the same closet width. Use single-hang only for the section reserved for dresses, coats, and robes.",
      },
    },
    {
      "@type": "Question",
      name: "What does a custom reach-in closet cost in NYC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At Green Cabinets NY, a custom reach-in system in melamine starts around $1,800 for a 6 ft closet and $2,800 for an 8 ft closet with a drawer bank. Hardwood-front drawers run 30–50% more. Install is included for NYC five-borough projects.",
      },
    },
    {
      "@type": "Question",
      name: "Do you remove the existing wire shelves?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We demo the old wire shelving, patch the wall, and prime before installing the new system. Most reach-in installs finish in one day per closet.",
      },
    },
  ],
};

const ReachInClosetSystemsNYC = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="description" content={DESC} />
      <meta name="keywords" content="reach in closet, reach in closet systems, custom closet nyc, custom reach in closet, closet brooklyn, closet system manhattan, closet organizers nyc" />
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
        { name: "Custom Cabinets", url: "/" },
        { name: "Reach-In Closet Systems NYC", url: URL },
      ]}
    />

    <Header />

    <main className="pt-32 sm:pt-36 md:pt-40">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Reach-In Closet Systems NYC" },
        ]}
      />

      <section className="bg-[#d5d5d5] py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-[#5C7650] font-semibold mb-3">
            Updated 2026 · NYC apartment closets
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">
            Reach-In Closet Systems for NYC Apartments
          </h1>
          <p className="text-base sm:text-lg text-[#444] mb-6">
            Most NYC closets are wire-shelf disasters with one rod and a hat shelf. A custom
            reach-in system, built right, doubles the capacity in the same square footage. Here's
            how we design, build, and install them.
          </p>
          <div className="flex justify-center">
            <AuthorByline author="golan" label="Written by" />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 flex items-center gap-2">
            <Ruler className="h-6 w-6 text-[#5C7650]" /> Standard NYC reach-in dimensions
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>Depth:</strong> 24" wall-to-wall (pre-war: 22"–26")</li>
            <li><strong>Width:</strong> 4 ft, 6 ft, or 8 ft are the common sizes</li>
            <li><strong>Height:</strong> 96" finished ceiling — use every inch above 84"</li>
            <li><strong>Door opening:</strong> Often only 60% of the actual width — measure both</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">The four-zone layout</h2>
          <p className="text-base text-muted-foreground mb-6 leading-relaxed">
            Every well-designed reach-in is some combination of these four zones. The closet's
            width tells you the ratio.
          </p>
          <div className="space-y-4 mb-12">
            {ZONES.map((z) => (
              <article key={z.name} className="border border-border rounded-lg p-5 hover:border-[#5C7650] transition-colors">
                <h3 className="text-lg font-bold text-foreground mb-1">{z.name}</h3>
                <p className="text-xs text-muted-foreground mb-2"><strong className="text-foreground">{z.depth}</strong> · {z.width}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{z.note}</p>
              </article>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Recommended layouts by width</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>4 ft closet:</strong> All double-hang. No drawers — too narrow. One top shelf for bins.</li>
            <li><strong>6 ft closet:</strong> 24" drawer tower in the center, 24" double-hang on one side, 24" long-hang on the other.</li>
            <li><strong>8 ft closet:</strong> 30" drawer tower with shoe shelves above, 36" double-hang, 30" long-hang. Adjustable shelves above everything.</li>
            <li><strong>10 ft+ closet:</strong> Treat it as a small walk-in — add a shoe wall and full-length mirror.</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Material choices</h2>
          <p className="text-base text-muted-foreground mb-3 leading-relaxed">
            Reach-ins live behind a closed door. Spend the budget where you'll see it.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>Carcass:</strong> ¾" thermally-fused melamine in white or warm grey. Cleans easily, never warps, takes a knock.</li>
            <li><strong>Drawer fronts:</strong> Painted MDF for melamine systems, or solid hardwood (white oak, walnut) if the closet doors stay open.</li>
            <li><strong>Hardware:</strong> Blum soft-close slides on every drawer. Skip cheap ball-bearing slides — they fail in 3 years.</li>
            <li><strong>Rod:</strong> Solid steel oval, never round chrome (round rods spin hangers).</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">What it costs</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>4 ft melamine reach-in:</strong> ~$1,200–$1,600</li>
            <li><strong>6 ft melamine with drawer tower:</strong> ~$1,800–$2,400</li>
            <li><strong>8 ft melamine with drawers + shoe shelves:</strong> ~$2,800–$3,600</li>
            <li><strong>Hardwood-front upgrade (white oak / walnut):</strong> +30–50%</li>
            <li><strong>Five-borough install:</strong> typically included</li>
          </ul>

          <div className="p-6 border border-border rounded-lg bg-muted/30 mb-8">
            <p className="text-sm text-muted-foreground mb-3">
              Want a custom reach-in quote for your apartment? Send dimensions and a photo and
              we'll come back with a layout and a number.
            </p>
            <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] hover:scale-105 transition-all">
              <Link to="/#contact">Get a closet quote <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Related reading</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
            <li><Link to="/double-sink-vanity-guide" className="text-[#5C7650] hover:underline">Double sink vanity guide</Link></li>
            <li><Link to="/floating-bathroom-vanity" className="text-[#5C7650] hover:underline">Floating bathroom vanity install guide</Link></li>
          </ul>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default ReachInClosetSystemsNYC;
