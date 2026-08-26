import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles, Check, Layers, Gem, Ruler, Utensils } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import Contact from "@/components/home/Contact";
import Chatbot from "@/components/marketing/Chatbot";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/luxury-kitchen-design-nyc";
const TITLE = "Luxury Kitchen Design NYC — 2026 High-End Trends & Millwork";
const DESC =
  "Luxury kitchen design in NYC: marble waterfall islands, integrated wood dining, hidden appliances, and full-height millwork from a Bushwick high-end custom cabinet shop.";

const FAQS = [
  {
    q: "What defines a luxury kitchen in NYC in 2026?",
    a: "Three signals: full-height flush millwork (no reveals, no visible hardware), integrated Sub-Zero/Wolf/Miele behind matching cabinet panels, and a single dominant stone — usually a book-matched marble or exotic quartzite waterfalling on the island. Everything else (lighting, backsplash, hood) is quiet so the material choices lead.",
  },
  {
    q: "How much does a luxury kitchen cost in Manhattan or Brooklyn?",
    a: "$180,000–$450,000+ all-in for a true high-end kitchen in NYC. Custom cabinetry alone runs $45,000–$120,000; exotic stone $18,000–$60,000; Sub-Zero/Wolf/Miele/Gaggenau appliance package $45,000–$120,000; the balance is trades, integrated lighting, and specialty finishes. Bushwick loft or Tribeca townhouse projects with dual islands and butler's pantries land at the top of that range.",
  },
  {
    q: "What are the top luxury kitchen trends for 2026?",
    a: "Book-matched marble waterfall islands, integrated wood dining tables that cantilever off the island, hidden appliances (fridge and dishwasher behind matched veneer panels), fluted or reeded door fronts in walnut or rift-cut white oak, hand-troweled plaster range hoods, and warm brass or bronze hardware where hardware is visible at all.",
  },
  {
    q: "Which materials read as luxury for cabinetry?",
    a: "Rift-cut white oak, quarter-sawn walnut, Shinnoki real wood veneers, hand-painted MDF in deep saturated colors (charcoal, forest green, oxblood), and fluted or reeded fronts. Tafisa and Egger's PerfectSense matte finishes stand in as budget-luxury alternatives that still look bespoke.",
  },
  {
    q: "What countertops do luxury NYC kitchens use?",
    a: "Book-matched Calacatta or Statuario marble on the island (accepting the patina it develops), leathered granite or honed quartzite for perimeter runs where staining is a concern, and Neolith or Dekton for outdoor terrace kitchens. Waterfall edges on at least one end of the island are standard.",
  },
  {
    q: "How does an integrated appliance package work?",
    a: "Sub-Zero refrigerators, Miele or Bosch dishwashers, and Gaggenau warming drawers are designed to accept custom cabinet panels flush with the surrounding millwork. We build the panels in the same finish, grain-match veneer across the door, and use hidden hinges so the appliances disappear into the run. Only the range, hood, and cooktop remain visible.",
  },
  {
    q: "Do you build luxury kitchens outside Manhattan?",
    a: "Yes — Brooklyn Heights townhouses, Cobble Hill brownstones, Park Slope full-floor renovations, and Williamsburg penthouses are our home market. We also install throughout Manhattan (UES/UWS, Tribeca, Soho, West Village), Queens (LIC, Forest Hills, Astoria), and the Hamptons.",
  },
  {
    q: "How long does a luxury kitchen renovation take?",
    a: "14–24 weeks from design lock to final punch-list. Design and finish selection take 4–6 weeks; cabinets are milled by our suppliers to spec over 8–10 weeks; stone templating and fabrication add 3–4 weeks; integrated appliance install and final trim take another 3–4 weeks. Board approval in a Manhattan co-op adds 4–8 weeks in parallel.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-07-25",
  keywords:
    "luxury kitchen design nyc, high-end custom cabinetry brooklyn, luxury kitchen company nyc, marble waterfall island, integrated appliance kitchen, luxury kitchen trends 2026",
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
  serviceType: "Luxury Kitchen Design & Custom Cabinetry",
  provider: { "@id": "https://greencabinetsny.com/#localbusiness" },
  areaServed: { "@type": "Place", name: "New York City" },
  url: URL,
  description: DESC,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "180000",
    highPrice: "450000",
  },
};

const TRENDS = [
  { icon: Gem, title: "Book-matched marble waterfalls", body: "One dominant slab — Calacatta, Statuario, or Arabescato — book-matched across the island top and cascading down both ends. Patina accepted as part of the material." },
  { icon: Layers, title: "Fluted & reeded fronts", body: "Vertical reeding in rift-cut white oak or walnut on islands, tall pantries, and range walls. Adds texture without breaking the flush-front language." },
  { icon: Utensils, title: "Integrated wood dining", body: "A cantilevered walnut or oak table extending off the island, grain-matched to the island end panel. Seats 4–8 without a separate dining room." },
  { icon: Ruler, title: "Full-height flush millwork", body: "No fillers, no reveals, no visible hardware. Cabinets run floor to ceiling with push-to-open or finger-pull edge detail." },
  { icon: Sparkles, title: "Hidden appliances", body: "Sub-Zero, Miele, Bosch, and Gaggenau behind matched veneer panels. Only the range, hood, and cooktop remain visible in the room." },
  { icon: Gem, title: "Hand-troweled plaster hoods", body: "Custom plaster or limewash hoods over the range replace stainless — sculptural, warm, and quiet against the stone." },
];

const LuxuryKitchenDesignNyc = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="luxury kitchen design nyc, high-end custom cabinetry brooklyn, luxury kitchen company nyc, marble waterfall island, integrated appliance kitchen, fluted cabinet fronts, luxury kitchen trends 2026, bespoke millwork nyc"
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
        { name: "Luxury Kitchen Design NYC", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Luxury Kitchen Design NYC" },
        ]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            High-end custom millwork for NYC
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          Luxury Kitchen Design in NYC — 2026 Trends & Bespoke Millwork
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          Marble waterfalls, integrated wood dining, hidden appliances, and
          full-height flush millwork — what a Bushwick custom cabinet shop
          builds for Manhattan townhouses, Brooklyn brownstones, and Hamptons
          getaways in 2026.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthorByline author="golan" label="Written by" />
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Six luxury kitchen trends defining 2026
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRENDS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-background rounded-xl p-6 shadow-sm">
              <Icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-2">{title}</h3>
              <p className="text-sm text-[#555555]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl space-y-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Gem className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Materials that read as luxury
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Rift-cut white oak — tight vertical grain, minimal cathedraling. Reads bespoke in flat panel or reeded fronts.",
              "Quarter-sawn walnut — rich brown with ray-fleck figure. Signature material for cantilevered island dining.",
              "Shinnoki real wood veneers — grain-matched across full runs, book-matched on tall pantries.",
              "Hand-painted MDF in deep saturated colors — charcoal, forest green, oxblood, midnight blue.",
              "Tafisa and Egger PerfectSense matte — budget-luxury when a full walnut package isn't in scope.",
              "Fluted or reeded fronts machined by our suppliers — vertical texture without breaking the flush-front language.",
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
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Integrated appliance package
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Sub-Zero column refrigerator and freezer behind matched veneer panels with grain continuous across doors.",
              "Miele or Bosch dishwasher panels aligned to the surrounding drawer fronts, hidden hinges.",
              "Gaggenau warming drawer, steam oven, and coffee system stacked in a tall run with flush push-to-open.",
              "Wolf or Miele range and hood as the single visible mechanical element — anchors the material story.",
              "Only the range, hood, and cooktop remain visible; everything else disappears into the millwork.",
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
            <Utensils className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Where luxury kitchens live in NYC
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Tribeca and Soho cast-iron lofts with 12–14 ft ceilings — full-height pantries, oversized flat-panel islands.",
              "Brooklyn Heights, Cobble Hill, and Park Slope brownstones — parlor-floor kitchens opened to garden dining rooms.",
              "Upper East Side and Upper West Side pre-war classic sixes and sevens — bespoke slim-shaker in painted whites and warm woods.",
              "Williamsburg and DUMBO penthouses — flat-panel walnut with waterfall islands and terrace kitchens in Dekton.",
              "Long Island City and Hudson Yards high-rise condos — quiet flush millwork tuned to the view, not competing with it.",
              "Hamptons second homes — natural white oak, hand-troweled plaster hoods, and outdoor summer kitchens in Neolith.",
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
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-6">
          Related guides
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { to: "/kitchen-renovation-manhattan", label: "Manhattan co-op & loft renovation" },
            { to: "/kitchen-renovation-brooklyn", label: "Brooklyn kitchen renovation" },
            { to: "/natural-wood-kitchen-cabinets", label: "Natural wood cabinets" },
            { to: "/custom-vs-semi-custom-cabinets", label: "Custom vs semi-custom" },
            { to: "/finishes-colors", label: "Finishes & colors library" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 rounded-full bg-background text-[#1a1a1a] font-semibold text-sm shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <Link
            to="/designer"
            className="inline-block px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm"
          >
            Start your luxury kitchen design
          </Link>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Luxury kitchen design FAQs
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

export default LuxuryKitchenDesignNyc;
