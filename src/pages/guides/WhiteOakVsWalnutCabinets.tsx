import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, Ruler, Award, Hammer } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import Contact from "@/components/home/Contact";
import Chatbot from "@/components/marketing/Chatbot";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/white-oak-vs-walnut-cabinets";
const TITLE = "White Oak vs Walnut Cabinets — NYC Comparison Guide 2026";
const DESC =
  "White oak vs walnut kitchen cabinets: grain, hardness, color shift, grain matching, and 2026 NYC pricing from a Brooklyn custom cabinet shop.";
const KEYWORDS =
  "white oak vs walnut kitchen cabinets, white oak cabinets nyc, walnut cabinets nyc, rift sawn white oak cabinets, luxury wood cabinets brooklyn";

const FAQS = [
  {
    q: "Which is harder — white oak or walnut?",
    a: "White oak is harder: about 1,350 on the Janka scale versus roughly 1,010 for American black walnut. In a high-traffic family kitchen white oak resists dents better, especially on base drawer fronts and toe kicks.",
  },
  {
    q: "How do the grains differ visually?",
    a: 'White oak has a strong, linear grain with prominent rays — rift-sawn stock gives you a tight, near-uniform vertical stripe that reads modern. Walnut has a softer, more flowing grain with color variation from pale sapwood to deep chocolate heartwood.',
  },
  {
    q: "Does walnut fade over time?",
    a: "Yes. Walnut lightens and warms with UV exposure, mellowing from purple-brown toward a honeyed brown over a few years. White oak does the opposite — it ambers slightly and deepens. Plan for it on a south-facing Manhattan kitchen wall.",
  },
  {
    q: "What's the price difference in NYC?",
    a: "In our Bushwick shop walnut typically runs 20–35% above white oak for the same layout, driven by lumber cost and yield. For a 20 lf kitchen expect roughly $7,000–$9,000 in white oak versus $9,000–$12,000 in walnut, installed.",
  },
  {
    q: "Which species grain-matches better across a run?",
    a: "Walnut, when sequenced from the same flitch — the flowing figure carries across doors beautifully. Rift-sawn white oak is easier to match consistently because the grain is so uniform, so it's the safer choice for long runs and tall pantry doors.",
  },
  {
    q: "Can I mix white oak and walnut in one kitchen?",
    a: "Yes, and it works well when one species is clearly dominant. A common approach: rift-sawn white oak perimeter with a walnut island or walnut interiors and open shelving. Avoid a 50/50 split — it reads indecisive.",
  },
  {
    q: "Which holds a natural finish better?",
    a: "Both take a hardwax oil or conversion varnish well. White oak needs a UV-inhibiting topcoat to stay pale rather than yellowing; walnut needs one to slow fading. We spray and cure both in-house so the batch stays consistent.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-07-29",
  keywords: KEYWORDS,
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const compareRows: Array<{ label: string; oak: string; walnut: string }> = [
  { label: "Janka hardness", oak: "~1,350", walnut: "~1,010" },
  { label: "Grain character", oak: "Linear, ray fleck, uniform when rift-sawn", walnut: "Flowing, figured, high contrast" },
  { label: "Base color", oak: "Pale blond to light tan", walnut: "Mid to dark chocolate brown" },
  { label: "Aging", oak: "Ambers and deepens slightly", walnut: "Lightens toward honeyed brown" },
  { label: "Grain matching", oak: "Easy across long runs", walnut: "Stunning when flitch-sequenced" },
  { label: "Best fit", oak: "Modern, Scandinavian, family kitchens", walnut: "Luxury, warm-contemporary, feature islands" },
  { label: "Installed cost (20 lf)", oak: "$7,000 – $9,000", walnut: "$9,000 – $12,000" },
  { label: "Dent resistance", oak: "Excellent", walnut: "Good" },
];

const WhiteOakVsWalnutCabinets = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta name="keywords" content={KEYWORDS} />
      <link rel="canonical" href={URL} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={URL} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESC} />
      <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESC} />
      <meta name="twitter:image" content="https://greencabinetsny.com/og-image.jpg" />
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>

    <BreadcrumbSchema
      items={[
        { name: "Home", url: "/" },
        { name: "White Oak vs Walnut Cabinets", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "White Oak vs Walnut Cabinets" }]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <Award className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            NYC wood species guide — 2026
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          White Oak vs Walnut Cabinets
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          Two premium hardwoods, two very different kitchens — one pale and
          architectural, the other warm and dramatic.
        </p>
        <p className="text-lg text-[#555555]">
          Here's how we walk clients through the choice at our Bushwick
          workshop: hardness, grain behavior, how each species ages in a NYC
          apartment, and what each actually costs installed.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthorByline author="golan" label="Written by" />
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Side-by-side comparison
        </h2>
        <div className="bg-background rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-3 bg-primary text-primary-foreground font-semibold">
            <div className="p-4">Spec</div>
            <div className="p-4 border-l border-primary-foreground/20">White Oak</div>
            <div className="p-4 border-l border-primary-foreground/20">Walnut</div>
          </div>
          {compareRows.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-3 text-sm sm:text-base ${
                i % 2 ? "bg-[#f5f5f5]" : "bg-background"
              }`}
            >
              <div className="p-4 font-semibold text-[#1a1a1a]">{row.label}</div>
              <div className="p-4 border-l border-[#e5e5e5] text-[#1a1a1a]">
                <Check className="inline w-4 h-4 text-primary mr-2" />
                {row.oak}
              </div>
              <div className="p-4 border-l border-[#e5e5e5] text-[#1a1a1a]">
                <Check className="inline w-4 h-4 text-primary mr-2" />
                {row.walnut}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl space-y-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Ruler className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Grain matching across a long run
            </h2>
          </div>
          <p className="text-[#555555] mb-4">
            Rift-sawn white oak is the workhorse of modern NYC kitchens because
            the grain is close to identical door to door. On a 14-foot
            Williamsburg loft run with full-height pantry doors, that
            consistency is what makes the wall read as one piece of millwork
            instead of eight separate doors.
          </p>
          <p className="text-[#555555]">
            Walnut is the opposite proposition: you buy figure, not uniformity.
            When we sequence doors from a single flitch, the grain flows
            continuously across the run — spectacular on an island face or a
            single feature wall, harder to control on a full perimeter.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Hammer className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              How we build each species
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Solid-wood 5-piece doors with mortise-and-tenon joinery in both species — no veneered MDF frames.",
              "Rift-sawn white oak is specified for slab and slim-shaker fronts where grain uniformity matters most.",
              "Walnut doors are laid out and numbered off a single flitch so the figure sequences across the run.",
              "Both get a UV-inhibiting hardwax oil or conversion varnish, sprayed and cured in-house in Bushwick.",
              "Panel float is engineered per species — walnut moves less seasonally than white oak, and the joint tolerances reflect that.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Which one should you pick?
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Pick white oak for a bright, modern kitchen, a family with kids, or long uninterrupted cabinet runs.",
              "Pick walnut for a warm, high-contrast luxury kitchen, a feature island, or a dark-and-moody Manhattan apartment.",
              "Pick both when you want a white oak perimeter grounded by a walnut island — the most requested combination in our shop.",
              "Pick white oak if budget is the deciding factor; the same layout typically lands 20–35% lower than walnut.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-[#555555] mt-4">
            Want the full species breakdown? See our{" "}
            <Link to="/wood-species" className="text-primary underline">
              wood species library
            </Link>{" "}
            and the{" "}
            <Link to="/best-wood-for-kitchen-cabinets" className="text-primary underline">
              best wood for kitchen cabinets
            </Link>{" "}
            guide.
          </p>
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">
          Compare both species in the designer
        </h2>
        <p className="text-[#555555] mb-8">
          Configure a white oak or walnut kitchen with real finishes, real
          hardware, and real pricing before you commit.
        </p>
        <Link
          to="/designer"
          className="inline-block px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm"
        >
          Open the designer
        </Link>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          White oak vs walnut FAQs
        </h2>
        <div className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q} className="bg-[#d5d5d5] rounded-xl p-6">
              <h3 className="font-display text-lg font-bold text-[#1a1a1a] mb-2">
                {f.q}
              </h3>
              <p className="text-[#555555]">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <Contact />
    <CTA />
    <Footer />
    <Chatbot />
  </div>
);

export default WhiteOakVsWalnutCabinets;
