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
import { authorRef } from "@/data/authors";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/kitchen-cabinets-staten-island";
const TITLE = "Kitchen Cabinets Staten Island — Insider Buyer's Guide 2026";
const DESC =
  "Insider guide to buying custom kitchen cabinets in Staten Island: 2026 pricing, delivery from our Bushwick shop, borough-specific layouts, and install logistics.";

const FAQS = [
  {
    q: "How much do custom kitchen cabinets cost in Staten Island?",
    a: "Custom cabinets in Staten Island run $350/linear foot for a full kitchen, $225/lf for base-only, and $125/lf for wall cabinets in 2026. A typical Staten Island kitchen (18–24 linear feet) lands between $6,500 and $10,000 for cabinetry alone. Semi-custom and stock cabinets sell for less but rarely fit the out-of-square walls in older Stapleton, St. George, and West Brighton homes without expensive fillers.",
  },
  {
    q: "Do you deliver and install in Staten Island?",
    a: "Yes. We build every cabinet at our Bushwick shop and truck them to Staten Island — Verrazzano-Narrows Bridge for South Shore installs (Tottenville, Great Kills, Eltingville), Goethals or Bayonne Bridge for North Shore (St. George, New Brighton, Port Richmond). Delivery adds a bridge-toll line item; install crews stage from the shop the morning of the drop.",
  },
  {
    q: "What's the lead time for Staten Island kitchens?",
    a: "Plan on 4–6 weeks from signed design to install day. Cabinets are milled, sprayed, and cured in Bushwick, then delivered and installed in 1–2 days depending on kitchen size. Countertop templating happens the day cabinets land; stone fabrication adds another 2–3 weeks.",
  },
  {
    q: "Do I need permits for a kitchen remodel in Staten Island?",
    a: "Same NYC DOB rules apply borough-wide. Swapping cabinets, counters, and appliances without moving plumbing, gas, or walls needs no permit. Relocating gas or waste lines, taking down walls, or altering the building envelope requires a licensed contractor to file with DOB. Most Staten Island single-family homes skip the co-op approval headache that Brooklyn and Manhattan clients face.",
  },
  {
    q: "What cabinet styles work best for Staten Island homes?",
    a: "Staten Island housing stock skews toward single-family colonials, split-levels, and semi-attached row houses — usually with more square footage than a Brooklyn brownstone. Shaker and flat-panel doors in painted whites, warm woods, and two-tone island combos dominate what we ship there. Larger kitchens make room for full-height pantries, oversized islands with seating, and appliance garages that don't fit in a Manhattan galley.",
  },
  {
    q: "Can you match cabinets to an existing kitchen extension or addition?",
    a: "Yes. We commonly get called for Staten Island additions — new mudroom off the kitchen, expanded eat-in area, or a rear extension into the backyard. We match door style, finish, and hardware to your existing run so the extension looks original, not tacked on. Bring a door sample or clear photos and we'll match to your Tafisa, Shinnoki, Egger, or painted finish.",
  },
  {
    q: "Do you serve all Staten Island neighborhoods?",
    a: "Yes — North Shore (St. George, Stapleton, New Brighton, West Brighton, Port Richmond), Mid-Island (Todt Hill, New Dorp, Grasmere, Grant City), and South Shore (Great Kills, Eltingville, Annadale, Huguenot, Tottenville, Prince's Bay). Delivery logistics are the same borough-wide; install scheduling depends on truck routing from Bushwick.",
  },
  {
    q: "Where can I see your cabinets before ordering?",
    a: "Visit our Bushwick shop at 10 Montieth St, Brooklyn — about 45 minutes from the Staten Island Ferry terminal or 30 minutes from the Verrazzano off-hours. You'll see finish samples, door styles, hardware, and cabinets in raw wood on the production floor. Most Staten Island clients come once for finish selection and skip the second trip.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-07-23",
  keywords:
    "kitchen cabinets staten island, staten island custom cabinets, staten island kitchen remodel, custom kitchen cabinets nyc, staten island cabinet maker",
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
  areaServed: { "@type": "Place", name: "Staten Island, NY" },
  url: URL,
  description: DESC,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "6500",
    highPrice: "45000",
  },
};

const KitchenCabinetsStatenIsland = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="kitchen cabinets staten island, staten island kitchen cabinets, custom cabinets staten island, staten island kitchen remodel, staten island cabinet maker, nyc custom kitchens"
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
        { name: "Kitchen Cabinets Staten Island", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Kitchen Cabinets Staten Island" },
        ]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <MapPin className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            Delivering & installing across Staten Island
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          Kitchen Cabinets in Staten Island — Insider Buyer's Guide
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          Real pricing. Borough-specific logistics. What Staten Island
          homeowners actually get for their cabinet budget in 2026.
        </p>
        <p className="text-lg text-[#555555]">
          North Shore colonials, Mid-Island splits, South Shore
          semi-attached rows — every Staten Island kitchen has a layout
          that stock cabinets can't quite hit. Here's what a Bushwick
          cabinet shop that ships across the bridges wants you to know.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthorByline author="golan" label="Written by" />
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Staten Island cabinet pricing in 2026
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tier: "Small kitchen (12–15 lf)", range: "$4,500 – $7,000", note: "Galley or single-wall. Painted shaker, soft-close, standard hardware." },
            { tier: "Standard kitchen (18–24 lf)", range: "$7,000 – $10,000", note: "L-shape or U-shape with island. Two-tone or wood-and-paint combo." },
            { tier: "Large / gut (28–40 lf)", range: "$12,000 – $20,000+", note: "Full pantry walls, oversized island seating, appliance garages, specialty finishes." },
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
          Cabinetry only. Countertops, appliances, tile, plumbing, and labor
          are separate. Delivery to Staten Island adds bridge tolls to the line
          item.
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl space-y-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Delivery logistics from Bushwick to Staten Island
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "South Shore installs (Tottenville, Great Kills, Eltingville, Annadale) route over the Verrazzano-Narrows — early-morning trucks avoid weekday BQE traffic.",
              "North Shore (St. George, Stapleton, Port Richmond, West Brighton) can route via the Goethals or Bayonne Bridge from NJ if delivery windows are tight.",
              "Single-family driveways and garages make Staten Island the easiest borough to unload — no walk-ups, no elevator scheduling, no doorman.",
              "Cabinets ship fully assembled when driveway access allows, saving on-site labor vs. flat-pack knock-down.",
              "One-day install is the norm for kitchens under 20 lf; larger jobs finish day two.",
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
              ["Week 5", "Delivery over the bridge. Install (1–2 days). Countertop template same day."],
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
              What makes a Staten Island kitchen different
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "More linear footage than Manhattan or Brooklyn — full pantry walls, double islands, breakfast nooks all fit.",
              "Older North Shore Victorians (St. George, New Brighton) have out-of-square walls that stock cabinets can't scribe cleanly.",
              "Post-war Mid-Island splits (Grasmere, Todt Hill) often want to open a wall between kitchen and dining room — worth confirming load-bearing before finalizing cabinet layout.",
              "South Shore new-construction homes can accept oversized islands (10 ft+) that would never survive a Brooklyn stairwell.",
              "Basement or attached-garage staging space makes finish selection deliveries easy — bring the sample home, live with it a week.",
              "Post-Sandy elevation work in Midland Beach, New Dorp Beach, and South Beach means some kitchens sit at raised first-floor heights — cabinet toe-kicks and appliance heights should be verified against the finished floor.",
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
          Staten Island neighborhoods we install in
        </h2>
        <p className="text-center text-[#555555] mb-8 max-w-2xl mx-auto">
          Every Staten Island install routes from our Bushwick shop — same
          cabinets, same install crew, same finish samples you'd see in
          Brooklyn or Manhattan.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "St. George", "Stapleton", "New Brighton", "West Brighton",
            "Port Richmond", "Todt Hill", "New Dorp", "Grasmere",
            "Grant City", "Great Kills", "Eltingville", "Annadale",
            "Huguenot", "Tottenville", "Prince's Bay", "Midland Beach",
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
            Design your Staten Island kitchen
          </Link>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Staten Island kitchen cabinet FAQs
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

export default KitchenCabinetsStatenIsland;
