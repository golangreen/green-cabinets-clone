import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Check, Clock, DollarSign, Hammer, Truck, FileText } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import Contact from "@/components/home/Contact";
import Chatbot from "@/components/marketing/Chatbot";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/custom-kitchen-cabinets-brooklyn";
const TITLE = "Custom Kitchen Cabinets Brooklyn — Buyer's Guide 2026";
const DESC =
  "Brooklyn custom kitchen cabinets in 2026: real pricing per linear foot, brownstone vs. condo vs. loft constraints, co-op COI and alteration agreements, shaker vs. slim shaker, and 4–6 week lead times.";

const FAQS = [
  {
    q: "How much do custom kitchen cabinets cost in Brooklyn?",
    a: "In 2026 we price at $350 per linear foot for a full kitchen, $225/lf base-only, and $125/lf wall-only. A typical Brooklyn kitchen of 16–22 linear feet lands between $6,000 and $9,500 for cabinetry alone. Park Slope and Brooklyn Heights brownstone gut jobs with pantry walls and an island usually run $12,000–$20,000+. Countertops, appliances, tile, plumbing, and electrical are separate.",
  },
  {
    q: "Do Brooklyn co-ops and condos require an alteration agreement?",
    a: "Most do. Expect a signed alteration agreement, a certificate of insurance (COI) naming the building, the managing agent, and the board as additional insureds, proof of workers' comp and general liability, and a defined work window. Cabinet-and-counter swaps with no plumbing, gas, or wall moves generally avoid a DOB filing but still need board sign-off. We supply layouts, elevations, and finish specs in the format managing agents ask for.",
  },
  {
    q: "What about freight elevators and quiet hours?",
    a: "Brooklyn condo towers in DUMBO, Downtown Brooklyn, and Williamsburg require a reserved freight elevator slot, usually weekdays 9am–4pm, with masonite floor protection and a COI on file before the truck arrives. Quiet hours are typically no work before 9am, none after 5pm, and none on weekends or holidays. Brownstones have no elevator at all — cabinets get hand-carried up the stoop, so oversized boxes get sized to the stair turn.",
  },
  {
    q: "How is a brownstone kitchen different from a condo or loft kitchen?",
    a: "Brownstones: out-of-square plaster walls, 9–11 ft ceilings, radiators and chases to scribe around, and a parlor-floor stair that limits panel size. Condos: square walls, 8–9 ft ceilings, building rules that drive the schedule more than the carpentry. Lofts in Williamsburg, Bushwick, and Gowanus: exposed brick and column grids, 11–14 ft ceilings where a stacked upper run or open shelving reads better than one very tall cabinet.",
  },
  {
    q: "Shaker or slim shaker for a Brooklyn kitchen?",
    a: "Classic shaker (2.25–2.5 inch stile) suits pre-war brownstones and townhouses — it sits comfortably next to original moldings. Slim shaker (1.5 inch stile) reads cleaner in condos and lofts and gives you more visible panel on narrow doors, which matters in a galley. Both are painted or stained to the same durability spec. Flat-panel veneers from Tafisa, Shinnoki, and Egger are the third common choice for modern lofts.",
  },
  {
    q: "How long does a Brooklyn kitchen take?",
    a: "Plan on 4–6 weeks from signed design to install: 1–2 weeks for design, measure and finish selection, 2–4 weeks of production at our vetted millwork suppliers, and 1–2 days on site for install. Countertop templating happens the day cabinets land; stone fabrication adds 2–3 weeks. Board approval, when required, runs in parallel and is the most common cause of delay.",
  },
  {
    q: "Do you have a Brooklyn showroom I can visit?",
    a: "No walk-in shop. Design is run from Golan's home base in Bushwick, cabinets are built by vetted millwork suppliers, and we meet you at your apartment by appointment with door samples, finish panels, and hardware. Most clients do one in-home session and finalize the rest by email.",
  },
  {
    q: "Which Brooklyn neighborhoods do you serve?",
    a: "Park Slope, Williamsburg, DUMBO, Brooklyn Heights, Carroll Gardens, Cobble Hill, Boerum Hill, Fort Greene, Clinton Hill, Prospect Heights, Crown Heights, Bedford-Stuyvesant, Bushwick, Greenpoint, Gowanus, Red Hook, Sunset Park, Bay Ridge, Windsor Terrace, and Flatbush.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-08-26",
  keywords:
    "custom kitchen cabinets brooklyn, brooklyn kitchen cabinets, brownstone kitchen cabinets, park slope kitchen cabinets, williamsburg kitchen cabinets, brooklyn cabinet maker, slim shaker cabinets brooklyn",
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
  areaServed: { "@type": "Place", name: "Brooklyn, NY" },
  url: URL,
  description: DESC,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "4200",
    highPrice: "45000",
  },
};

const PRICING = [
  {
    tier: "Small kitchen (10–14 lf)",
    range: "$4,200 – $6,500",
    note: "Co-op galley or garden-floor rental unit. Painted shaker, soft-close hinges and slides, standard hardware.",
  },
  {
    tier: "Standard kitchen (16–22 lf)",
    range: "$6,000 – $9,500",
    note: "L-shape or U-shape with peninsula. Two-tone paint or a paint-and-veneer combination.",
  },
  {
    tier: "Brownstone gut (26–36 lf)",
    range: "$12,000 – $20,000+",
    note: "Full-height pantry walls, island with seating, appliance panels, specialty finishes and integrated pulls.",
  },
];

const BUILDING_RULES = [
  "Certificate of insurance naming the building, managing agent, and board as additional insureds — issued before the delivery date, not the install date.",
  "Signed alteration agreement for anything beyond a like-for-like swap; plumbing, gas, or wall moves usually add architect-stamped plans and a DOB filing.",
  "Freight elevator reserved in advance, typically weekdays 9am–4pm, with masonite and wall protection installed by the crew.",
  "Quiet hours enforced by most boards: no work before 9am, nothing after 5pm, no weekends or building holidays.",
  "Brownstones and walk-ups have no elevator — cabinet boxes are sized to clear the stoop, stair turn, and any parlor-floor door swing.",
  "Building deposits and elevator fees are paid by the owner, not the cabinet company — budget $500–$1,500 in a condo tower.",
];

const BUILDING_TYPES = [
  {
    title: "Brownstone & townhouse",
    points: [
      "Plaster walls are rarely square — every run is measured on site and scribed, not shimmed with wide filler.",
      "9–11 ft ceilings: a 42-inch upper plus a stacked glass or panel cabinet reads better than one oversized door.",
      "Radiators, chases, and original moldings get integrated instead of boxed over.",
      "Hand-carry only. Panels are sized to the stair turn before production starts.",
    ],
  },
  {
    title: "Condo & co-op tower",
    points: [
      "Square walls and predictable 8–9 ft ceilings make the carpentry simple; the building rules drive the schedule.",
      "Freight elevator windows and COIs set the delivery date — we book both before production is released.",
      "Slim shaker or flat-panel fronts with integrated pulls match most new-build interiors in DUMBO and Downtown Brooklyn.",
      "Appliance panels and toe-kick heights get matched to the developer's original spec when the unit is under warranty.",
    ],
  },
  {
    title: "Loft conversion",
    points: [
      "Exposed brick and column grids: cabinets are scribed to brick, never caulked to hide a gap.",
      "11–14 ft ceilings favor a stacked upper run, open shelving, or a deliberate stop with a soffit-free reveal.",
      "Long uninterrupted runs make grain-matched veneer (Tafisa, Shinnoki, Egger) worth the upcharge.",
      "Concrete floors are frequently out of level — bases get leveled on adjustable legs, not shims.",
    ],
  },
];

const CustomKitchenCabinetsBrooklyn = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="custom kitchen cabinets brooklyn, brooklyn kitchen cabinets, brownstone kitchen cabinets, park slope kitchen cabinets, williamsburg kitchen cabinets, dumbo kitchen cabinets, brooklyn cabinet maker"
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
        { name: "Custom Kitchen Cabinets Brooklyn", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Custom Kitchen Cabinets Brooklyn" },
        ]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <MapPin className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            Designed in Bushwick · installed across Brooklyn by appointment
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          Custom Kitchen Cabinets in Brooklyn — Buyer's Guide
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          What a Brooklyn kitchen actually costs in 2026, what your board
          will ask for before the truck shows up, and how brownstones,
          condos, and lofts each change the cabinet plan.
        </p>
        <p className="text-lg text-[#555555]">
          Design is run from Golan's home base in Bushwick, cabinets are
          built by vetted millwork suppliers, and installs are scheduled
          by appointment. There is no walk-in shop — finish samples come
          to your apartment.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthorByline author="golan" label="Written by" />
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Brooklyn cabinet pricing in 2026
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map((t) => (
            <div key={t.tier} className="bg-background rounded-xl p-6 shadow-sm">
              <DollarSign className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-2">{t.tier}</h3>
              <p className="text-2xl font-bold text-primary mb-3">{t.range}</p>
              <p className="text-sm text-[#555555]">{t.note}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-[#555555] text-center mt-6 max-w-2xl mx-auto">
          Baseline rates: $350 per linear foot for a full kitchen, $225/lf
          base-only, $125/lf wall-only. Cabinetry only — countertops,
          appliances, tile, plumbing, and electrical are separate.
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl space-y-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Co-op and condo rules that control your schedule
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {BUILDING_RULES.map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Hammer className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Brownstone vs. condo vs. loft
            </h2>
          </div>
          <div className="space-y-8">
            {BUILDING_TYPES.map((b) => (
              <div key={b.title}>
                <h3 className="font-display text-xl font-bold text-[#1a1a1a] mb-3">{b.title}</h3>
                <ul className="space-y-2 text-[#555555]">
                  {b.points.map((p) => (
                    <li key={p} className="flex gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Hammer className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Shaker or slim shaker in a Brooklyn kitchen
            </h2>
          </div>
          <p className="text-[#555555] mb-4">
            Door style is the single biggest driver of how a Brooklyn
            kitchen reads. Both options are built to the same construction
            spec — the difference is proportion.
          </p>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Classic shaker, 2.25–2.5 inch stile: right for brownstones and pre-war townhouses where original casing and picture rails set the scale.",
              "Slim shaker, 1.5 inch stile: more visible panel on narrow doors, which matters in a galley; the default in condos and converted lofts.",
              "Flat-panel veneer (Tafisa, Shinnoki, Egger): grain runs continuously across long loft runs and pairs with integrated or channel pulls.",
              "Paint holds up the same in either profile; slim shaker collects less dust in the reveal, which clients in Williamsburg rentals notice.",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-[#555555] mt-4">
            Full comparison:{" "}
            <Link to="/shaker-vs-slim-shaker-cabinets" className="text-primary font-semibold hover:underline">
              shaker vs. slim shaker cabinets
            </Link>
            .
          </p>
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
              ["Week 0", "In-home consult, measure, finish selection, deposit. Board paperwork starts the same week."],
              ["Weeks 1–4", "Production at our vetted millwork suppliers — mill, sand, spray, cure."],
              ["Week 5", "Freight elevator booked or stoop carry scheduled. Install runs 1–2 days; countertop template same day."],
              ["Weeks 6–8", "Stone fabricated and set. Backsplash, hardware, plumbing and appliance hookup."],
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
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Delivery across Brooklyn
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Bushwick, Bed-Stuy, Crown Heights, Greenpoint and Williamsburg are short runs — early-morning drops beat the BQE.",
              "DUMBO, Downtown Brooklyn, and Fort Greene towers need dock reservations and a COI on file before the truck is allowed in.",
              "Park Slope, Carroll Gardens, Cobble Hill, and Boerum Hill are mostly stoop carries with alternate-side parking to plan around.",
              "Bay Ridge, Sunset Park, and Flatbush add 20–30 minutes each way; install labor on site is unchanged.",
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
          Brooklyn neighborhoods we install in
        </h2>
        <p className="text-center text-[#555555] mb-8 max-w-2xl mx-auto">
          Same cabinets, same install crew, same finish samples brought to
          your apartment by appointment.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Park Slope", "Williamsburg", "DUMBO", "Brooklyn Heights",
            "Carroll Gardens", "Cobble Hill", "Boerum Hill", "Fort Greene",
            "Clinton Hill", "Prospect Heights", "Crown Heights", "Bedford-Stuyvesant",
            "Bushwick", "Greenpoint", "Gowanus", "Red Hook",
            "Sunset Park", "Bay Ridge", "Windsor Terrace", "Flatbush",
          ].map((label) => (
            <span
              key={label}
              className="px-4 py-2 rounded-full bg-background text-[#1a1a1a] font-semibold text-sm shadow-sm"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">
          Price your Brooklyn project
        </h2>
        <p className="text-[#555555] mb-8">
          Doing a bathroom in the same renovation? Size a custom vanity to
          the inch and get a live price in the 3D designer. For the
          kitchen, send measurements or a rough sketch through the quote
          form below and we'll come back with a linear-foot estimate.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/designer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm"
          >
            Design a vanity — live price
          </Link>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold transition-colors"
          >
            Get a kitchen quote
          </a>
        </div>
        <p className="text-sm text-[#555555] mt-6">
          Or call (718) 804-5488 · orders@greencabinetsny.com · by appointment in Brooklyn, Manhattan, and{" "}
          <Link to="/custom-kitchen-cabinets-queens" className="text-primary font-semibold hover:underline">
            Queens
          </Link>
          .
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Brooklyn kitchen cabinet FAQs
        </h2>
        <div className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q} className="bg-background rounded-xl p-6">
              <h3 className="font-display text-lg font-bold text-[#1a1a1a] mb-2">{f.q}</h3>
              <p className="text-[#555555]">{f.a}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-[#555555] mt-10">
          Also serving{" "}
          <Link to="/custom-kitchen-cabinets-manhattan" className="text-primary font-semibold hover:underline">
            Manhattan
          </Link>{" "}
          and{" "}
          <Link to="/custom-kitchen-cabinets-queens" className="text-primary font-semibold hover:underline">
            Queens
          </Link>
          .
        </p>
      </div>
    </section>

    <Contact />
    <CTA />
    <Footer />
    <Chatbot />
  </div>
);

export default CustomKitchenCabinetsBrooklyn;
