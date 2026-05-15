import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Check, Clock, DollarSign, Hammer, FileCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import Contact from "@/components/home/Contact";
import Chatbot from "@/components/marketing/Chatbot";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { authorRef } from "@/data/authors";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/kitchen-renovation-brooklyn";
const TITLE = "Kitchen Renovation Brooklyn — Costs, Permits, Timeline 2026";
const DESC =
  "Brooklyn kitchen renovation guide from a local Bushwick cabinet shop: 2026 costs, NYC permit rules, timelines, and what makes Brooklyn different.";

const FAQS = [
  {
    q: "How much does a kitchen renovation cost in Brooklyn?",
    a: "A full Brooklyn kitchen renovation typically runs $25,000–$75,000 in 2026. Cabinets are usually 30–40% of the budget — expect $7,500–$25,000 for custom cabinetry on a 15–25 linear foot kitchen. Mid-range gut renos in brownstones average $45,000–$60,000; loft conversions and high-end Park Slope or Cobble Hill kitchens regularly land in the $80,000–$150,000 range.",
  },
  {
    q: "Do I need a permit to renovate my kitchen in Brooklyn?",
    a: "If you're only swapping cabinets, countertops, appliances, and finishes without moving plumbing, gas, electrical, or walls, no DOB permit is required. The moment you relocate gas lines, change waste/vent stacks, take down a wall, or alter the building envelope, you need a licensed contractor to file with NYC DOB. Co-op and condo boards almost always require board approval and an alteration agreement regardless of permit status.",
  },
  {
    q: "How long does a Brooklyn kitchen remodel take?",
    a: "From signed contract to functional kitchen, plan on 8–14 weeks. Custom cabinet build is 4–6 weeks (we mill in Bushwick), demo and rough-in is 1–2 weeks, install is 1 week, countertop template + fab + install adds 2–3 weeks, and punch list is the final week. Co-op approval can add 4–8 weeks before any work begins.",
  },
  {
    q: "Can you renovate a railroad apartment kitchen?",
    a: "Yes — railroad galleys are one of the most common Brooklyn layouts we work in. The trick is custom cabinetry sized to the actual wall (no wasted fillers), full-extension hardware, toe-kick storage, and floor-to-ceiling pantries. A typical 12 ft galley fits roughly 9 base + 9 wall linear feet of cabinets and runs $7,500–$12,000 for cabinetry alone.",
  },
  {
    q: "Do I need to move out during the renovation?",
    a: "Most clients stay in the apartment. We set up a temp kitchen (microwave, kettle, mini-fridge) in another room, contain dust with zip walls, and protect floors. Expect 2–3 weeks without a working sink and stove during the demo + rough-in phase. Brownstone parlor-floor renos are easier; tight 4th-floor walk-ups in Bushwick or Bed-Stuy sometimes warrant a short Airbnb.",
  },
  {
    q: "What's the cheapest way to renovate a Brooklyn kitchen?",
    a: "Keep the layout. Plumbing and gas relocations are the single biggest line item that pushes a $30K kitchen to $60K. Reface or replace cabinets in place, keep sink and range where they are, choose stock-depth appliances, and pick a quartz countertop over marble. A cosmetic refresh with new custom cabinets, counters, and backsplash can come in under $20,000 in many Brooklyn apartments.",
  },
  {
    q: "Do you handle the full renovation or just the cabinets?",
    a: "We design and build the cabinetry in-house and partner with vetted Brooklyn GCs, plumbers, electricians, and countertop fabricators we've worked with for years. You can hire us for cabinetry only and bring your own GC, or we'll quarterback the whole project. Either way, the cabinet design starts the conversation.",
  },
  {
    q: "Are you actually based in Brooklyn?",
    a: "Yes. Our shop has been in Bushwick (10 Montieth St) since 2009. Every cabinet we ship is milled, sanded, sprayed, and crated in Brooklyn before installation. You're welcome to visit while your cabinets are in raw wood.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-01-15",
  keywords:
    "kitchen renovation brooklyn, brooklyn kitchen remodel, brownstone kitchen renovation, brooklyn kitchen cost, nyc kitchen renovation",
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

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Plan a Kitchen Renovation in Brooklyn",
  description:
    "Step-by-step guide to planning a Brooklyn kitchen renovation: budget, board approval, design, custom cabinet build, demo, install, and punch list.",
  author: authorRef("golan"),
  publisher: { "@id": "https://greencabinetsny.com/#organization" },
  totalTime: "P10W",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "45000" },
  supply: [
    { "@type": "HowToSupply", name: "Custom cabinetry (15–25 linear feet)" },
    { "@type": "HowToSupply", name: "Quartz or stone countertop" },
    { "@type": "HowToSupply", name: "Appliances (range, fridge, dishwasher, hood)" },
    { "@type": "HowToSupply", name: "Backsplash tile and grout" },
    { "@type": "HowToSupply", name: "Plumbing fixtures and cabinet hardware" },
  ],
  tool: [
    { "@type": "HowToTool", name: "Licensed NYC general contractor" },
    { "@type": "HowToTool", name: "Cabinet shop (millwork)" },
    { "@type": "HowToTool", name: "Countertop fabricator" },
    { "@type": "HowToTool", name: "Licensed plumber and electrician" },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Set a realistic Brooklyn budget",
      text: "Plan $25,000–$75,000 for a typical Brooklyn kitchen in 2026. Cabinets are 30–40% of the budget. Brownstone gut renos average $45K–$60K; high-end Park Slope or Cobble Hill kitchens run $80K–$150K.",
      url: "https://greencabinetsny.com/kitchen-renovation-brooklyn#budget",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Confirm permits and board approval",
      text: "If plumbing, gas, electrical, or walls move, file with NYC DOB through a licensed contractor. Co-ops and condos almost always require board approval and an alteration agreement — start this 4–8 weeks before any work.",
      url: "https://greencabinetsny.com/kitchen-renovation-brooklyn#permits",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Design the layout and cabinetry",
      text: "Measure the existing space, decide whether to keep plumbing and gas in place (the single biggest cost lever), and design custom cabinets sized to the actual walls — no wasted fillers, full-extension hardware, floor-to-ceiling pantries.",
      url: "https://greencabinetsny.com/designer",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Build the cabinets (4–6 weeks)",
      text: "Custom cabinets are milled, sanded, and sprayed at our Bushwick shop in 4–6 weeks. While cabinets build, demo and rough-in plumbing/electrical happen on site (1–2 weeks).",
      url: "https://greencabinetsny.com/wood-species",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Install cabinets and template countertops",
      text: "Cabinet install takes about a week. Countertops are templated after install, then fabricated and installed (adds 2–3 weeks). Backsplash tile follows.",
      url: "https://greencabinetsny.com/finishes-colors",
    },
    {
      "@type": "HowToStep",
      position: 6,
      name: "Punch list and final walkthrough",
      text: "Final week: hardware, trim, touch-ups, appliance hookup, and a punch-list walkthrough. Total project from contract to functional kitchen: 8–14 weeks (plus board approval).",
      url: "https://greencabinetsny.com/kitchen-renovation-brooklyn",
    },
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Kitchen Renovation",
  provider: { "@id": "https://greencabinetsny.com/#localbusiness" },
  areaServed: { "@type": "Place", name: "Brooklyn, NY" },
  url: URL,
  description: DESC,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "25000",
    highPrice: "150000",
  },
};

const KitchenRenovationBrooklyn = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="kitchen renovation brooklyn, brooklyn kitchen remodel, kitchen renovation cost brooklyn, brownstone kitchen renovation, brooklyn kitchen contractor, custom kitchen brooklyn"
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
      <script type="application/ld+json">{JSON.stringify(serviceJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(howToJsonLd)}</script>
    </Helmet>

    <BreadcrumbSchema
      items={[
        { name: "Home", url: "/" },
        { name: "Brooklyn", url: "/custom-kitchen-cabinets-brooklyn" },
        { name: "Kitchen Renovation Brooklyn", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Brooklyn", to: "/custom-kitchen-cabinets-brooklyn" },
          { label: "Kitchen Renovation" },
        ]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <MapPin className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            Bushwick · Serving all of Brooklyn
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          Kitchen Renovation in Brooklyn — The 2026 Local Guide
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          Real costs. Real timelines. Honest answers from a Brooklyn cabinet
          shop that's been doing this since 2009.
        </p>
        <p className="text-lg text-[#555555]">
          Brownstones, lofts, walk-ups, co-ops, condos — every Brooklyn
          kitchen has its own quirks. This page is what we wish every client
          knew before signing a renovation contract.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthorByline author="golan" label="Written by" />
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          What a Brooklyn kitchen renovation actually costs in 2026
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tier: "Cosmetic refresh", range: "$15K – $30K", note: "New cabinets, counters, backsplash, paint. Layout stays. No permits." },
            { tier: "Mid-range gut", range: "$40K – $75K", note: "Full demo, custom cabinets, new appliances, lighting. Some plumbing moves." },
            { tier: "High-end gut", range: "$80K – $150K+", note: "Walls down, gas/plumbing relocated, premium stone, integrated appliances, paneled fridge." },
          ].map((t) => (
            <div key={t.tier} className="bg-background rounded-xl p-6 shadow-sm">
              <DollarSign className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-2">{t.tier}</h3>
              <p className="text-2xl font-bold text-primary mb-3">{t.range}</p>
              <p className="text-sm text-[#555555]">{t.note}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-[#555555] text-center mt-6 max-w-2xl mx-auto">
          Cabinetry is typically 30–40% of the total. Our custom cabinets run
          $350/lf for full kitchens, $225/lf for base, $125/lf for wall.
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl space-y-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Realistic timeline (8–14 weeks)
            </h2>
          </div>
          <ul className="space-y-3 text-[#555555]">
            {[
              ["Weeks 0–2", "Design, measure, sign-off, deposit. Co-op board package if needed."],
              ["Weeks 2–6", "Cabinets in production at our Bushwick shop. Stone slab selected."],
              ["Weeks 6–7", "Demo + rough-in (plumbing, electrical, gas if applicable). DOB inspections if permitted work."],
              ["Weeks 7–8", "Cabinet install. Countertop template the day cabinets land."],
              ["Weeks 9–11", "Counters fabricated and installed. Backsplash, plumbing fixtures, appliance hookup."],
              ["Weeks 11–12", "Punch list, final clean, walk-through."],
            ].map(([when, what]) => (
              <li key={when} className="flex gap-4">
                <span className="font-bold text-primary min-w-[88px]">{when}</span>
                <span>{what}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <FileCheck className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              NYC permits, DOB, and co-op boards
            </h2>
          </div>
          <p className="text-[#555555] mb-3">
            Brooklyn kitchen renovations sit under NYC Department of
            Buildings rules. Cosmetic work (cabinets, counters, fixtures
            in the same location) doesn't require a permit. Anything that
            touches gas, waste/vent, structural walls, or window
            openings does — and needs a licensed contractor with a
            DOB-filed alteration.
          </p>
          <p className="text-[#555555]">
            Co-ops and condos add another layer: most boards require an
            alteration agreement, contractor insurance certificates, and
            a 30–60 day review. Start the board package in parallel
            with cabinet design, not after.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Hammer className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              What makes a Brooklyn kitchen different
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Out-of-square walls in pre-war buildings — every cabinet needs custom scribing.",
              "8 ft 6 in or 9 ft brownstone ceilings reward floor-to-ceiling uppers (free pantry storage).",
              "Loft kitchens with 10–12 ft ceilings — double-stacked uppers, oversized islands.",
              "Co-op gas line restrictions in some Park Slope and Brooklyn Heights buildings — induction is often the answer.",
              "Walk-up logistics — cabinet sizes capped by stairwell turn radius. Knock-down boxes help.",
              "Landmarked districts (Brooklyn Heights, Park Slope, Cobble Hill, Carroll Gardens) — interior kitchen work is generally fine, but window changes need LPC.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-6 text-center">
          We work in every Brooklyn neighborhood
        </h2>
        <p className="text-center text-[#555555] mb-8 max-w-2xl mx-auto">
          Local install pages with real project photos and pricing for your
          area:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            ["Bushwick", "/custom-kitchen-cabinets-bushwick"],
            ["Williamsburg", "/custom-kitchen-cabinets-williamsburg"],
            ["Park Slope", "/custom-kitchen-cabinets-park-slope"],
            ["DUMBO", "/custom-kitchen-cabinets-dumbo"],
            ["Brooklyn Heights", "/custom-kitchen-cabinets-brooklyn-heights"],
            ["All of Brooklyn", "/custom-kitchen-cabinets-brooklyn"],
          ].map(([label, href]) => (
            <Link
              key={href}
              to={href}
              className="px-4 py-2 rounded-full bg-background text-[#1a1a1a] hover:bg-primary hover:text-white transition-colors font-semibold text-sm shadow-sm"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Brooklyn kitchen renovation FAQs
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

export default KitchenRenovationBrooklyn;
