/**
 * /floating-bathroom-vanity — long-form pillar targeting
 * "floating bathroom vanity" (~12,100/mo, KDI 31).
 */
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X } from "lucide-react";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/floating-bathroom-vanity";
const TITLE = "Floating Bathroom Vanity — NYC Install Guide & Cost (2026)";
const DESC =
  "What NYC clients should know before building a wall-hung floating vanity: wall requirements, weight limits, hardware, heights, and real custom costs.";

const PROS = [
  "Visually expands small NYC bathrooms — exposed floor reads larger",
  "Easier floor cleaning, no toe-kick collecting hair and dust",
  "Mounting height is fully tunable to the user (33\"–36\" rim is typical)",
  "Modern, architectural look that pairs with wall-mount faucets",
  "Hides plumbing inside the cabinet body, not behind a kick",
];

const CONS = [
  "Wall must be solid — pre-war plaster on lath needs blocking added",
  "Less storage than a 34½\" floor vanity (you lose ~6\"–10\" of vertical)",
  "Drain rough-in must move up — usually 14\"–16\" off floor instead of 18\"–20\"",
  "Heavy stone tops require a French cleat or steel brackets, not just screws",
  "Co-op buildings sometimes require structural sign-off for wall-mount loads",
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-05-13",
  keywords: "floating bathroom vanity, wall mounted vanity, floating vanity nyc, custom floating vanity, wall hung vanity",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much weight can a floating vanity hold?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Properly mounted into 2x6 or 2x8 wall blocking with lag bolts, a floating vanity easily supports 400–600 lbs — far more than a stone top, two basins, and full drawers ever weigh. The wall is the limiting factor, not the cabinet.",
      },
    },
    {
      "@type": "Question",
      name: "What height should a floating vanity be?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Counter rim 33\"–36\" off finished floor. 34½\" matches standard kitchen height and works for most adults. Tall users go 36\"; couples with a height gap should split the difference at 35\".",
      },
    },
    {
      "@type": "Question",
      name: "Do floating vanities work in pre-war NYC apartments?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, but the contractor must open the wall and add solid wood blocking between studs (or a continuous 2x10 backer) before mounting. Plaster-and-lath alone will not hold a wet vanity reliably.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a custom floating vanity cost in NYC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At Green Cabinets NY, custom floating vanities start around $2,800 for a painted 30\" single and run $5,500–$9,000 for 60\"–72\" doubles in white oak or walnut. Mounting hardware and wall blocking are typically included; stone and install are separate.",
      },
    },
  ],
};

const FloatingBathroomVanity = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="description" content={DESC} />
      <meta name="keywords" content="floating bathroom vanity, floating vanity, wall mounted vanity, wall hung vanity, custom floating vanity nyc" />
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
        { name: "Floating Bathroom Vanity", url: URL },
      ]}
    />

    <Header />

    <main className="pt-32 sm:pt-36 md:pt-40">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Vanities", to: "/vanity-designer" },
          { label: "Floating Bathroom Vanity" },
        ]}
      />

      <section className="bg-[#d5d5d5] py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-accent-foreground font-semibold mb-3">
            Updated 2026 · NYC install notes
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">
            Floating Bathroom Vanity — The NYC Install Guide
          </h1>
          <p className="text-base sm:text-lg text-[#444] mb-6">
            Wall-hung vanities make small bathrooms look bigger and modern bathrooms look better.
            They also fail spectacularly when the wall isn't ready. Here's everything we tell
            clients before we build one.
          </p>
          <div className="flex justify-center">
            <AuthorByline author="golan" label="Written by" />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">When to choose floating</h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <div className="border border-border rounded-lg p-5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><Check className="h-5 w-5 text-accent-foreground" /> Pros</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {PROS.map((p) => <li key={p} className="flex gap-2"><span className="text-accent-foreground">·</span>{p}</li>)}
              </ul>
            </div>
            <div className="border border-border rounded-lg p-5">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2"><X className="h-5 w-5 text-destructive" /> Cons</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {CONS.map((c) => <li key={c} className="flex gap-2"><span className="text-destructive">·</span>{c}</li>)}
              </ul>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">The wall is the project</h2>
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
            We've removed more failed floating vanities than we like to admit. Every single one
            failed at the wall, never at the cabinet. Three rules:
          </p>
          <ol className="list-decimal pl-5 space-y-3 text-base text-muted-foreground mb-12 leading-relaxed">
            <li><strong>Solid blocking, full width.</strong> Two horizontal 2x6s (or one 2x10) screwed into every stud the cabinet crosses. Plaster-on-lath alone is not enough — open it.</li>
            <li><strong>Lag bolts, not screws.</strong> 5/16" × 3" lag bolts, minimum four, into the blocking. Drywall anchors of any kind are not acceptable for a wet wall-hung load.</li>
            <li><strong>French cleat for stone.</strong> Anything over 60" or with a 1¼"+ stone slab gets a continuous steel French cleat behind the cabinet. Belt and suspenders.</li>
          </ol>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Heights and rough-in</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>Counter rim:</strong> 33"–36" off finished floor. 34½" is our default.</li>
            <li><strong>Floor clearance under cabinet:</strong> 8"–14" looks intentional. Less than 6" defeats the purpose.</li>
            <li><strong>Drain centerline:</strong> 14"–16" off finished floor (vs. 18"–20" for a floor vanity).</li>
            <li><strong>Supply lines:</strong> 18"–20" off finished floor, 4" outboard of drain.</li>
            <li><strong>Outlet:</strong> Inside the cabinet body, on a GFCI, for electric toothbrush docks and night lights.</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">What it costs</h2>
          <p className="text-base text-muted-foreground mb-3 leading-relaxed">
            Custom floating vanities at our Bushwick shop, painted MDF or hardwood veneer,
            soft-close Blum slides, U-cut around the P-trap, mounting hardware included:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground mb-12">
            <li><strong>30" painted single, 1 drawer + door:</strong> ~$2,800–$3,400</li>
            <li><strong>36"–48" painted single, 2 drawers:</strong> ~$3,400–$4,800</li>
            <li><strong>60" double, painted:</strong> ~$5,500–$6,800</li>
            <li><strong>72" double, white oak or walnut:</strong> ~$7,500–$9,500</li>
            <li><strong>French cleat + structural mounting kit:</strong> +$250–$450</li>
          </ul>

          <div className="p-6 border border-border rounded-lg bg-muted/30 mb-8">
            <p className="text-sm text-muted-foreground mb-3">
              Spec a floating vanity in your size and finish — instant price.
            </p>
            <Button asChild size="lg" className="bg-[#5C7650] hover:bg-[#445339] hover:scale-105 transition-all">
              <Link to="/vanity-designer">Open the vanity designer <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Related reading</h2>
          <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
            <li><Link to="/double-sink-vanity-guide" className="text-accent-foreground hover:underline">Double sink vanity sizing & layouts</Link></li>
            <li><Link to="/small-bathroom-vanity-ideas" className="text-accent-foreground hover:underline">Small bathroom vanity ideas under 36"</Link></li>
          </ul>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default FloatingBathroomVanity;
