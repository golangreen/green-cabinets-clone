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

const URL = "https://greencabinetsny.com/custom-kitchen-cabinets-manhattan";
const TITLE = "Custom Kitchen Cabinets Manhattan — Buyer's Guide 2026";
const DESC =
  "Manhattan custom kitchen cabinets in 2026: pricing per linear foot, co-op alteration agreements and COIs, freight elevator and quiet-hour rules, prewar vs. condo vs. loft constraints, shaker vs. slim shaker.";

const FAQS = [
  {
    q: "How much do custom kitchen cabinets cost in Manhattan?",
    a: "Our 2026 rates are $350 per linear foot for a full kitchen, $225/lf base-only, and $125/lf wall-only. A Manhattan galley of 10–14 linear feet is roughly $4,200–$6,500 in cabinetry; a standard 16–22 lf kitchen runs $6,000–$9,500; a prewar classic-six or townhouse gut with pantry walls and an island runs $13,000–$22,000+. Building fees, countertops, appliances, tile, plumbing, and electrical are separate.",
  },
  {
    q: "What does a Manhattan co-op board require before work starts?",
    a: "Typically a signed alteration agreement, architect- or engineer-stamped plans for anything touching plumbing, gas, or walls, a certificate of insurance naming the corporation, managing agent, and board as additional insureds, workers' comp and liability certificates, a licensed-contractor filing, and a security deposit. Cabinet-and-counter replacement with no wet-work moves is usually treated as a minor alteration but still needs written approval. We provide layouts, elevations, and finish specs in the format managing agents ask for.",
  },
  {
    q: "How do freight elevators and quiet hours affect the install?",
    a: "Nearly every Manhattan building requires a reserved freight elevator slot — commonly weekdays 9am–4pm, sometimes as narrow as 10am–3pm — with masonite floor protection, padded elevator walls, and a COI on file before the truck arrives. Quiet hours mean no demo or drilling before 9am, nothing after 5pm, and no weekend or holiday work. Some prewar buildings have a single service elevator under 7 ft tall, which caps panel and tall-cabinet sizes; we confirm the car dimensions before releasing production.",
  },
  {
    q: "Can you build for a prewar Manhattan apartment?",
    a: "Yes — that's most of what we do. Prewar kitchens on the Upper East Side, Upper West Side, and in Greenwich Village have out-of-square plaster walls, 9–10 ft ceilings, exposed risers and steam chases, and doorways that won't pass a wide box. Everything is measured on site, built to the exact opening, and scribed to the wall, with fillers kept under an inch.",
  },
  {
    q: "How is a condo or new-development kitchen different?",
    a: "Square walls, predictable 8–9 ft ceilings, and simple carpentry — but the building rules and warranty spec drive everything. Hudson Yards, FiDi, and Chelsea condos usually require the developer's toe-kick height, appliance panel spec, and often approval from the building's design review before a change. Slim shaker or flat-panel fronts with integrated pulls match most of these interiors.",
  },
  {
    q: "What about downtown lofts?",
    a: "Tribeca, SoHo, and NoHo lofts have 11–14 ft ceilings, cast-iron columns, and exposed brick. A stacked upper run or a deliberate stop with open shelving reads better than one oversized cabinet. Long uninterrupted runs make grain-matched veneer from Tafisa, Shinnoki, or Egger worth the upcharge, and floors are frequently out of level, so bases are set on adjustable legs.",
  },
  {
    q: "Shaker or slim shaker for a Manhattan kitchen?",
    a: "Classic shaker at a 2.25–2.5 inch stile sits naturally in prewar apartments alongside original casing. Slim shaker at 1.5 inches gives more visible panel on the narrow doors a Manhattan galley forces, and reads cleaner in condos and lofts. Flat-panel veneer is the third route for modern downtown interiors. Construction and finish durability are identical — it is a proportion decision.",
  },
  {
    q: "Do you have a Manhattan showroom?",
    a: "No walk-in shop anywhere. Design runs from Golan's home base in Bushwick, cabinets are built by vetted millwork suppliers, and we come to your apartment by appointment with door samples, finish panels, and hardware. Call (718) 804-5488 or email orders@greencabinetsny.com to book a time.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-08-26",
  keywords:
    "custom kitchen cabinets manhattan, manhattan kitchen cabinets, prewar kitchen cabinets nyc, upper east side kitchen cabinets, tribeca kitchen cabinets, co-op alteration agreement kitchen, slim shaker cabinets manhattan",
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
  areaServed: { "@type": "Place", name: "Manhattan, NY" },
  url: URL,
  description: DESC,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "4200",
    highPrice: "60000",
  },
};

const PRICING = [
  {
    tier: "Galley / studio (10–14 lf)",
    range: "$4,200 – $6,500",
    note: "Prewar one-bedroom or studio. Painted shaker or slim shaker, soft-close hardware, full-height uppers.",
  },
  {
    tier: "Standard kitchen (16–22 lf)",
    range: "$6,000 – $9,500",
    note: "L-shape or U-shape with peninsula. Two-tone paint or a paint-and-veneer combination.",
  },
  {
    tier: "Prewar / townhouse gut (26–36 lf)",
    range: "$13,000 – $22,000+",
    note: "Pantry walls, island with seating, integrated appliance panels, specialty finishes and hardware.",
  },
];

const BUILDING_RULES = [
  "Alteration agreement signed by shareholder and contractor before any material enters the building.",
  "Certificate of insurance naming the corporation or condo, managing agent, and board as additional insureds — dated before the delivery, not the install.",
  "Architect- or engineer-stamped plans and a DOB filing whenever plumbing, gas, or walls move; a like-for-like cabinet swap usually avoids both.",
  "Freight elevator reserved in advance, typically weekdays 9am–4pm, with masonite floor protection and padded car walls.",
  "Quiet hours: no work before 9am, nothing after 5pm, no weekends or building holidays — this is what stretches a two-day install across a week.",
  "Service elevator car height, door width, and hallway turns are measured before production; prewar cars under 7 ft cap tall-cabinet sizes.",
  "Building security deposits and elevator fees are paid by the owner — budget $1,000–$3,000 in a full-service building.",
];

const BUILDING_TYPES = [
  {
    title: "Prewar co-op",
    points: [
      "Out-of-square plaster and 9–10 ft ceilings — every run measured on site, scribed rather than filled.",
      "Steam risers, chases, and original moldings are integrated into the cabinet plan, not boxed over.",
      "Tight service elevators and narrow doorways cap panel size; oversized fronts get split or field-assembled.",
      "Classic shaker at a 2.25–2.5 inch stile matches original casing and picture rails.",
    ],
  },
  {
    title: "Condo & new development",
    points: [
      "Square walls, 8–9 ft ceilings, straightforward carpentry — building process drives the calendar.",
      "Developer specs for toe-kick height, appliance panels, and hardware often must be matched under warranty.",
      "Design review approval can be required in addition to the alteration agreement.",
      "Slim shaker and flat-panel with integrated pulls suit Hudson Yards, Chelsea, and FiDi interiors.",
    ],
  },
  {
    title: "Downtown loft",
    points: [
      "Cast-iron columns and exposed brick: cabinets scribed to brick, never caulked to hide a gap.",
      "11–14 ft ceilings favor stacked uppers or a deliberate stop with open shelving above.",
      "Long runs make grain-matched veneer (Tafisa, Shinnoki, Egger) worth the upcharge.",
      "Out-of-level concrete floors — bases leveled on adjustable legs, not shims.",
    ],
  },
];

const CustomKitchenCabinetsManhattan = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="custom kitchen cabinets manhattan, manhattan kitchen cabinets, prewar kitchen cabinets nyc, upper east side kitchen cabinets, tribeca kitchen cabinets, soho kitchen cabinets, manhattan cabinet maker"
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
        { name: "Custom Kitchen Cabinets Manhattan", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Custom Kitchen Cabinets Manhattan" },
        ]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <MapPin className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            Designed in Bushwick · installed across Manhattan by appointment
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          Custom Kitchen Cabinets in Manhattan — Buyer's Guide
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          2026 pricing, the alteration-agreement and COI paperwork your
          board will demand, freight elevator and quiet-hour realities,
          and how prewar, condo, and loft kitchens each change the plan.
        </p>
        <p className="text-lg text-[#555555]">
          Design runs from Golan's home base in Bushwick, cabinets are
          built by vetted millwork suppliers, and installs are scheduled
          by appointment. There is no walk-in shop — samples come to your
          apartment.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthorByline author="golan" label="Written by" />
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Manhattan cabinet pricing in 2026
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
          base-only, $125/lf wall-only. Cabinetry only — building fees,
          countertops, appliances, tile, plumbing, and electrical are separate.
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
              Prewar vs. condo vs. loft
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
              Shaker or slim shaker in a Manhattan kitchen
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Classic shaker, 2.25–2.5 inch stile: matches prewar casing, picture rails, and paneled doors on the Upper East and Upper West Sides.",
              "Slim shaker, 1.5 inch stile: more visible panel on the narrow doors a Manhattan galley forces; the default in condos.",
              "Flat-panel veneer (Tafisa, Shinnoki, Egger): continuous grain for downtown lofts, paired with integrated or channel pulls.",
              "Same box construction, hinges, and finish durability across all three — the choice is proportion, not quality.",
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
              Realistic timeline (4–6 weeks, plus board time)
            </h2>
          </div>
          <ul className="space-y-3 text-[#555555]">
            {[
              ["Week 0", "In-home consult, measure, finish selection, deposit. Alteration agreement and COI paperwork starts immediately."],
              ["Weeks 1–4", "Production at our vetted millwork suppliers while board review runs in parallel."],
              ["Week 5", "Freight elevator slot booked. Install runs 1–2 working days inside the building's approved hours; countertop template same day."],
              ["Weeks 6–8", "Stone fabricated and set. Backsplash, hardware, plumbing and appliance hookup."],
            ].map(([when, what]) => (
              <li key={when} className="flex gap-4">
                <span className="font-bold text-primary min-w-[88px]">{when}</span>
                <span>{what}</span>
              </li>
            ))}
          </ul>
          <p className="text-[#555555] mt-4">
            Board approval, not carpentry, is the usual delay. Buildings
            that review monthly can add 2–6 weeks — start the paperwork on
            day one.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Delivery into Manhattan
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Trucks route over the Williamsburg or Manhattan Bridge for downtown, the Queensboro for the East Side — early-morning drops avoid the congestion zone crush.",
              "Loading dock or curb permit, dock reservation, and COI must all be confirmed before dispatch; a missing COI is the number one reason a delivery gets turned away.",
              "Doorman buildings require the crew list in advance and service-entrance access only.",
              "Walk-up townhouses in the Village and Harlem are hand carries — box sizes are set to the stair turn before production.",
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
          Manhattan neighborhoods we install in
        </h2>
        <p className="text-center text-[#555555] mb-8 max-w-2xl mx-auto">
          Same cabinets, same install crew, same finish samples brought to
          your apartment by appointment.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Tribeca", "SoHo", "NoHo", "Nolita",
            "West Village", "Greenwich Village", "East Village", "Lower East Side",
            "Chelsea", "Gramercy", "Murray Hill", "Midtown",
            "Hell's Kitchen", "Upper East Side", "Upper West Side", "Morningside Heights",
            "Harlem", "Washington Heights", "Financial District", "Battery Park City",
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
          Price your Manhattan project
        </h2>
        <p className="text-[#555555] mb-8">
          Renovating a bathroom at the same time? Size a custom vanity to
          the inch and get a live price in the 3D designer. For the
          kitchen, send measurements or a rough sketch through the quote
          form below and we'll return a linear-foot estimate.
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
          Or call (718) 804-5488 · orders@greencabinetsny.com · by appointment in Manhattan,{" "}
          <Link to="/custom-kitchen-cabinets-brooklyn" className="text-primary font-semibold hover:underline">
            Brooklyn
          </Link>
          , and{" "}
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
          Manhattan kitchen cabinet FAQs
        </h2>
        <div className="space-y-6">
          {FAQS.map((f) => (
            <div key={f.q} className="bg-background rounded-xl p-6">
              <h3 className="font-display text-lg font-bold text-[#1a1a1a] mb-2">{f.q}</h3>
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

export default CustomKitchenCabinetsManhattan;
