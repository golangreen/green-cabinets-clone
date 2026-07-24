import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Check, Clock, DollarSign, Hammer, Truck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import Contact from "@/components/home/Contact";
import Chatbot from "@/components/marketing/Chatbot";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/custom-kitchen-cabinets-queens";
const TITLE = "Custom Kitchen Cabinets Queens — Insider Buyer's Guide 2026";
const DESC =
  "Insider guide to custom kitchen cabinets in Queens: 2026 pricing, Astoria/LIC/Forest Hills logistics, co-op vs. single-family install notes, and lead times from our Bushwick shop.";

const FAQS = [
  {
    q: "How much do custom kitchen cabinets cost in Queens?",
    a: "Custom cabinets in Queens run $350/linear foot for a full kitchen, $225/lf for base-only, and $125/lf for wall cabinets in 2026. A typical Queens kitchen (16–22 linear feet) lands between $5,500 and $9,500 for cabinetry alone. Pre-war co-ops in Forest Hills, Jackson Heights, and Sunnyside almost always need custom widths — stock cabinets leave 2–4 inches of filler that ruin the look.",
  },
  {
    q: "Do you deliver and install in Queens?",
    a: "Yes. Every cabinet is built at our Bushwick shop and driven to Queens — a 15–35 minute run depending on neighborhood. Astoria and Long Island City installs route over the Kosciuszko or Pulaski Bridge, Forest Hills and Rego Park via the LIE, Flushing and Bayside via Northern Blvd or Grand Central. Same crew, same day.",
  },
  {
    q: "What's the lead time for Queens kitchens?",
    a: "Plan on 4–6 weeks from signed design to install day. Cabinets are milled, sprayed, and cured in Bushwick, then delivered and installed in 1–2 days. Countertop templating happens the day cabinets land; stone fabrication adds another 2–3 weeks.",
  },
  {
    q: "Do I need co-op board approval in Queens?",
    a: "Most Queens co-ops (Forest Hills Gardens, Jackson Heights garden co-ops, Rego Park high-rises) require an alteration agreement for kitchen work — plans stamped by an architect or engineer, insurance certificates from the contractor, and a work window. Swap-only jobs (cabinets, counters, appliances, no plumbing or gas moves) usually skip the DOB filing but still need building approval. We provide the sample layouts and finish specs boards need.",
  },
  {
    q: "What cabinet styles work best for Queens homes?",
    a: "Queens is the most varied borough — Astoria row houses, LIC glass towers, Forest Hills Tudors, Bayside colonials, Jackson Heights garden co-ops. Painted shaker and flat-panel wood veneers (Tafisa, Shinnoki, Egger) cover most of what we ship. LIC condos lean modern flat-panel with integrated pulls; Forest Hills and Bayside single-families favor shaker with visible hardware.",
  },
  {
    q: "Can you match cabinets in a pre-war Queens co-op?",
    a: "Yes. Pre-war co-ops in Jackson Heights, Sunnyside Gardens, and Forest Hills Gardens often have short ceilings, radiators to work around, and off-square walls. We measure on-site, build to the exact opening, and scribe fillers to the wall — no shim gaps, no filler strips wider than 1 inch.",
  },
  {
    q: "Do you serve all Queens neighborhoods?",
    a: "Yes — Western Queens (Astoria, Long Island City, Sunnyside, Woodside, Jackson Heights, Elmhurst), Central Queens (Forest Hills, Rego Park, Kew Gardens, Middle Village, Ridgewood, Maspeth), Northeast Queens (Flushing, Bayside, Whitestone, College Point, Little Neck, Douglaston), and South Queens (Ozone Park, Howard Beach, Richmond Hill, Jamaica). Delivery adds routing time; install scheduling is the same.",
  },
  {
    q: "Where can I see your cabinets before ordering?",
    a: "Visit our Bushwick shop at 10 Montieth St, Brooklyn — 10 minutes from the Queens border, 15–20 minutes from Astoria or LIC on the L or off the BQE. You'll see finish samples, door styles, hardware, and cabinets in raw wood on the production floor. Most Queens clients come once for finish selection and finalize the rest by email.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-07-24",
  keywords:
    "kitchen cabinets queens, custom kitchen cabinets queens, queens custom cabinets, queens kitchen remodel, astoria kitchen cabinets, forest hills kitchen cabinets, long island city cabinets",
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

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Custom Kitchen Cabinets",
  provider: { "@id": "https://greencabinetsny.com/#localbusiness" },
  areaServed: { "@type": "Place", name: "Queens, NY" },
  url: URL,
  description: DESC,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "5500",
    highPrice: "45000",
  },
};

const CustomKitchenCabinetsQueens = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="kitchen cabinets queens, custom kitchen cabinets queens, queens cabinet maker, astoria kitchen cabinets, long island city kitchen cabinets, forest hills kitchen cabinets, bayside kitchen cabinets"
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
    </Helmet>

    <BreadcrumbSchema
      items={[
        { name: "Home", url: "/" },
        { name: "Custom Kitchen Cabinets Queens", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Custom Kitchen Cabinets Queens" },
        ]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <MapPin className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            Delivering & installing across Queens
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          Custom Kitchen Cabinets in Queens — Insider Buyer's Guide
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          Real pricing. Neighborhood-specific logistics. What Queens
          homeowners and co-op buyers actually get for their cabinet
          budget in 2026.
        </p>
        <p className="text-lg text-[#555555]">
          Astoria walk-ups, LIC towers, Forest Hills Tudors, Bayside
          colonials — every Queens kitchen has a layout stock cabinets
          can't quite hit. Here's what a Bushwick cabinet shop that ships
          into Queens weekly wants you to know.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthorByline author="golan" label="Written by" />
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Queens cabinet pricing in 2026
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tier: "Small kitchen (10–14 lf)", range: "$3,800 – $6,500", note: "Co-op galley or studio. Painted shaker, soft-close, standard hardware." },
            { tier: "Standard kitchen (16–22 lf)", range: "$6,000 – $9,500", note: "L-shape or U-shape with peninsula. Two-tone or wood-and-paint combo." },
            { tier: "Large / gut (26–36 lf)", range: "$11,000 – $18,000+", note: "Full pantry walls, island seating, appliance garages, specialty finishes." },
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
          Cabinetry only. Countertops, appliances, tile, plumbing, and
          labor are separate. Delivery to Queens is included within our
          standard NYC radius.
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl space-y-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Delivery logistics from Bushwick to Queens
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Astoria, LIC, Sunnyside, Woodside route over the Kosciuszko or Pulaski Bridge — 15–25 minutes off-peak.",
              "Forest Hills, Rego Park, Kew Gardens via the LIE or Woodhaven Blvd — early-morning trucks avoid Queens Blvd traffic.",
              "Flushing, Bayside, Whitestone via Northern Blvd or the Grand Central — plan around Long Island commuter windows.",
              "LIC and Astoria high-rises need loading-dock reservations and Certificate of Insurance for freight elevator use — we handle both.",
              "One-day install is the norm for kitchens under 20 lf; co-op alteration agreements can extend the schedule window but not the on-site labor.",
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
              Realistic timeline (4–6 weeks)
            </h2>
          </div>
          <ul className="space-y-3 text-[#555555]">
            {[
              ["Week 0", "Design consult, measure, finish selection, deposit."],
              ["Weeks 1–4", "Cabinets in production at Bushwick — mill, sand, spray, cure."],
              ["Week 5", "Delivery to Queens. Install (1–2 days). Countertop template same day."],
              ["Weeks 6–8", "Countertops fabricated and installed. Backsplash, hardware, plumbing hookup."],
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
            <Hammer className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              What makes a Queens kitchen different
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Pre-war Jackson Heights and Forest Hills co-ops have short ceilings (8'–8'6\") — 42-inch wall cabinets fit; 48s usually don't.",
              "LIC glass towers want integrated pulls and slab fronts to match modern interior architecture — Tafisa, Shinnoki, and Egger flat panels dominate.",
              "Astoria and Sunnyside row houses often have narrow galley kitchens — every inch of custom width matters against stock.",
              "Bayside, Whitestone, and Douglaston single-families accept larger islands (7–9 ft) and full pantry walls.",
              "Ridgewood and Middle Village row houses share layouts with Bushwick — same brick-wall scribing challenges, same solutions.",
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
          Queens neighborhoods we install in
        </h2>
        <p className="text-center text-[#555555] mb-8 max-w-2xl mx-auto">
          Every Queens install routes from our Bushwick shop — same
          cabinets, same install crew, same finish samples you'd see in
          Brooklyn or Manhattan.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Astoria", "Long Island City", "Sunnyside", "Woodside",
            "Jackson Heights", "Elmhurst", "Corona", "Forest Hills",
            "Rego Park", "Kew Gardens", "Middle Village", "Ridgewood",
            "Maspeth", "Flushing", "Bayside", "Whitestone",
            "College Point", "Little Neck", "Douglaston", "Howard Beach",
          ].map((label) => (
            <span
              key={label}
              className="px-4 py-2 rounded-full bg-background text-[#1a1a1a] font-semibold text-sm shadow-sm"
            >
              {label}
            </span>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/designer"
            className="inline-block px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm"
          >
            Design your Queens kitchen
          </Link>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Queens kitchen cabinet FAQs
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

export default CustomKitchenCabinetsQueens;
