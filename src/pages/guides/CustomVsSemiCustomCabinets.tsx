import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, X, Ruler, DollarSign, Clock, Award } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import Contact from "@/components/home/Contact";
import Chatbot from "@/components/marketing/Chatbot";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/custom-vs-semi-custom-cabinets";
const TITLE = "Custom vs Semi-Custom Cabinets — NYC Buyer's Guide 2026";
const DESC =
  "Custom vs semi-custom kitchen cabinets in NYC: real cost differences, fit in pre-war and out-of-square walls, durability, lead times, and long-term ROI.";

const FAQS = [
  {
    q: "What's the actual difference between custom and semi-custom cabinets?",
    a: "Semi-custom cabinets come in fixed 3\" width increments (usually 9\"–48\") with a set catalog of doors, finishes, and interior options. Custom cabinets are built to the exact millimeter of your kitchen — any width, any height, any depth, any door profile, any finish — with no filler strips or dead space.",
  },
  {
    q: "How much more do custom cabinets cost than semi-custom in NYC?",
    a: "In 2026, semi-custom runs roughly $200–$280/linear foot installed in NYC; full custom from a local millwork shop runs $325–$400/lf. On a typical 20 lf kitchen that's a $2,000–$3,500 delta — usually less than the filler waste, modification upcharges, and scribe labor a semi-custom install adds in a pre-war apartment.",
  },
  {
    q: "Do semi-custom cabinets work in pre-war brownstones and co-ops?",
    a: "They can, but almost never cleanly. Pre-war Manhattan and Brooklyn kitchens are rarely square — walls bow, floors slope, ceilings vary an inch across a run. Semi-custom uses filler strips (typically 1.5–3\") to close gaps, which reads as builder-grade. Custom cabinets scribe directly to the wall for a flush, seamless finish.",
  },
  {
    q: "Is the build quality actually different?",
    a: "Yes, meaningfully. Most semi-custom lines use 1/2\" particleboard or MDF boxes with cam-lock assembly, veneer doors, and stapled drawer boxes. Custom shops (ours included) use 3/4\" plywood boxes, dovetailed solid-wood drawers, mortise-and-tenon or 5-piece solid-wood doors, and full-extension soft-close hardware standard. The custom box lasts 25+ years; the semi-custom box shows wear in 8–12.",
  },
  {
    q: "What about lead times?",
    a: "Stock cabinets: 1–2 weeks. Semi-custom: 6–10 weeks (built overseas or in the Midwest, then shipped). Full custom from our Bushwick shop: 4–6 weeks — faster than most semi-custom because we mill, spray, and cure in-house without a shipping leg.",
  },
  {
    q: "Does custom actually pay back at resale?",
    a: "In NYC yes, especially in $1M+ apartments and townhouses. Buyers and appraisers can tell scribed custom cabinetry from filler-strip semi-custom on walkthrough. NAR's 2024 remodeling report puts kitchen cabinetry ROI at 60–80% of cost at resale — the top of that band belongs to custom in urban markets where every inch counts.",
  },
  {
    q: "When does semi-custom make more sense?",
    a: "Rental units, flips, second homes, or perfectly square new-construction kitchens where filler strips don't show. If the layout is standard and the plan is to sell within 3 years, semi-custom is a reasonable choice. For a primary residence in a pre-war building you plan to keep, custom pays back.",
  },
  {
    q: "Can I mix — custom bases with a semi-custom pantry?",
    a: "We don't recommend it. Door profiles, finish batches, and hardware reveals never match perfectly across manufacturers. The eye picks up the seam even when everything else is right. Pick one lane.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-07-23",
  keywords:
    "custom vs semi-custom cabinets, custom kitchen cabinets nyc, semi-custom cabinets, cabinet buyer guide, custom millwork nyc, pre-war kitchen cabinets",
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

const compareRows: Array<{ label: string; custom: string; semi: string }> = [
  { label: "Width increments", custom: "Exact — any width", semi: '3" steps + filler strips' },
  { label: "Box material", custom: '3/4" plywood', semi: '1/2" particleboard or MDF' },
  { label: "Drawers", custom: "Dovetailed solid wood", semi: "Stapled MDF or metal" },
  { label: "Door construction", custom: "5-piece solid or slab", semi: "Veneer over MDF" },
  { label: "Finish", custom: "Any color, any brand (Tafisa, Shinnoki, Egger, custom paint)", semi: "Catalog only" },
  { label: "Lead time", custom: "4–6 weeks", semi: "6–10 weeks" },
  { label: "Installed cost (20 lf)", custom: "$6,500 – $8,000", semi: "$4,000 – $5,600" },
  { label: "Expected lifespan", custom: "25+ years", semi: "8–12 years" },
  { label: "Fits pre-war walls", custom: "Yes, scribed", semi: "With visible fillers" },
];

const CustomVsSemiCustomCabinets = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="custom vs semi-custom cabinets, custom kitchen cabinets nyc, semi-custom cabinets, cabinet buyer guide, custom millwork nyc, pre-war kitchen cabinets"
      />
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
        { name: "Custom vs Semi-Custom Cabinets", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Custom vs Semi-Custom Cabinets" },
        ]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <Award className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            NYC buyer's guide — 2026
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          Custom vs Semi-Custom Cabinets
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          What the price difference actually buys you in a pre-war
          Manhattan apartment, a Brooklyn brownstone, or a Queens co-op.
        </p>
        <p className="text-lg text-[#555555]">
          Semi-custom looks good in a showroom. Custom looks good in your
          kitchen. Here's the honest breakdown a Bushwick millwork shop
          gives clients before they sign anything.
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
            <div className="p-4 border-l border-primary-foreground/20">Custom</div>
            <div className="p-4 border-l border-primary-foreground/20">Semi-Custom</div>
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
                {row.custom}
              </div>
              <div className="p-4 border-l border-[#e5e5e5] text-[#555555]">
                {row.semi}
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
              Fit in pre-war and out-of-square walls
            </h2>
          </div>
          <p className="text-[#555555] mb-4">
            Every pre-war apartment in NYC has walls that bow, floors that
            slope, and ceilings that dip. Semi-custom lines close the gap
            with filler strips — usually 1.5" to 3" of blank painted wood
            between the last cabinet and the wall. It reads as builder-grade
            because it is.
          </p>
          <p className="text-[#555555]">
            Custom cabinets are built oversize on the scribe edge and cut on
            site so the case sits flush against a bowed wall. No filler, no
            visible seam. In a $2M UWS classic-six, that detail is what your
            appraiser and next buyer notice.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Long-term ROI
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Custom lasts 25+ years — most semi-custom shows door sag, hinge failure, and delaminated MDF in 8–12.",
              "NAR's 2024 report puts kitchen ROI at 60–80% of cost; NYC custom lands at the top of that range.",
              "Appraisers on $1M+ NYC properties itemize cabinetry — custom millwork adds $8k–$25k to appraised value on a full kitchen.",
              "Refinish, refit, or repaint custom boxes down the line — semi-custom particleboard rarely survives the process.",
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
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              When semi-custom is the right call
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Rental units and flips — the extra durability doesn't pay back within your hold period.",
              "New-construction kitchens with perfectly square walls where fillers don't show.",
              "Second homes with light use and short-term ownership plans.",
              "Tight budgets where the delta isn't recoverable — a well-installed semi-custom kitchen beats a rushed custom one.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <X className="w-5 h-5 text-[#555555] flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">
          Get a real custom quote before you decide
        </h2>
        <p className="text-[#555555] mb-8">
          Design your kitchen with our online configurator — real finishes,
          real hardware, real pricing — before you commit to either lane.
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
          Custom vs semi-custom FAQs
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

export default CustomVsSemiCustomCabinets;
