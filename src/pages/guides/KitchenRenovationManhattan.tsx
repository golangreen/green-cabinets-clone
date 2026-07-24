import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Check, Clock, DollarSign, Hammer, Building2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";
import Contact from "@/components/home/Contact";
import Chatbot from "@/components/marketing/Chatbot";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import AuthorByline from "@/components/marketing/AuthorByline";
import { buildArticleSchema } from "@/lib/articleSchema";

const URL = "https://greencabinetsny.com/kitchen-renovation-manhattan";
const TITLE = "Kitchen Renovation Manhattan — Co-op & Loft Guide 2026";
const DESC =
  "Manhattan kitchen renovation guide: co-op board alteration agreements, freight elevator logistics, loft-scale millwork, and 2026 pricing from a Bushwick custom cabinet shop.";

const FAQS = [
  {
    q: "How much does a Manhattan kitchen renovation cost in 2026?",
    a: "Full-gut Manhattan kitchens run $65,000–$180,000+ all-in (cabinets, counters, appliances, labor, permits, board fees). Custom cabinetry alone is $350/linear foot for a full kitchen — a typical 14–20 lf Manhattan galley or U-shape lands at $5,000–$7,000 for boxes, plus counters, appliances, and Local Law 11 / co-op contingencies.",
  },
  {
    q: "Do I need co-op board approval to renovate my Manhattan kitchen?",
    a: "Almost always. Every Manhattan co-op requires an executed Alteration Agreement before demo. The board reviews plans, insurance certificates, contractor licenses, and often the finish schedule. Budget 4–8 weeks for board review before any work starts. Condos are lighter — usually just an alteration application and COI. We ship cabinets on the board's approved schedule so nothing sits in the freight elevator staging area.",
  },
  {
    q: "How do you deliver cabinets to a Manhattan high-rise?",
    a: "Freight elevator only, reserved through the building manager. Standard windows are 9am–4pm weekdays, often with a same-day install requirement. We build in Bushwick, pad-wrap each cabinet, and stage the truck for the exact freight slot. Doorman buildings on the Upper East Side, Upper West Side, and Midtown all follow this pattern. Walk-up brownstones in the West Village or Harlem swap the elevator problem for a stairwell one — narrower cabinets, split deliveries.",
  },
  {
    q: "What cabinet styles work best for Manhattan apartments?",
    a: "Two dominant patterns: (1) tight Upper East Side / Upper West Side pre-war galleys where slim-shaker or slab doors in painted whites and warm woods maximize a 10-foot run, and (2) Soho / Tribeca / Chelsea lofts with 12-ft ceilings that call for oversized flat-panel millwork, full-height pantries, and integrated appliance panels. Both use the same Tafisa, Shinnoki, Egger, and painted-MDF finishes — the door style shifts with the ceiling height.",
  },
  {
    q: "How long does a Manhattan kitchen renovation take?",
    a: "6–14 weeks from board approval to final punch-list. Cabinets are milled in Bushwick during the 4-week board-review window so they land the week demo finishes. Countertops template the day cabinets install, add 2–3 weeks for stone fabrication. Appliance integration, backsplash, and paint close out the last 2–4 weeks. Buildings with strict work-hour restrictions (some Fifth Avenue co-ops cap noise to 9am–4pm) can add a week.",
  },
  {
    q: "What paperwork does the co-op board actually want?",
    a: "Standard alteration package: signed Alteration Agreement, contractor's COI naming the corporation and managing agent, licensed plumber/electrician letters if trades are involved, DOB permits for anything structural or mechanical, and a scope of work with drawings. Cabinet-and-counter swaps without moving plumbing, gas, or walls skip DOB but still need the board's alteration sign-off in most buildings.",
  },
  {
    q: "Can you match cabinetry to a Manhattan pre-war apartment's original details?",
    a: "Yes. Pre-war Upper West Side and Upper East Side apartments often keep original crown, base, and picture-rail molding. We match cabinet stiles, rails, and door proportions so new millwork reads as period-appropriate — beaded inset for classic pre-war, flat-panel for post-war and loft, slim-shaker as the modern compromise. Bring a photo of an existing built-in and we'll match profile and finish.",
  },
  {
    q: "Do you serve all Manhattan neighborhoods?",
    a: "Yes — Upper East Side, Upper West Side, Harlem, Morningside Heights, Midtown East/West, Murray Hill, Chelsea, Flatiron, Gramercy, West Village, Greenwich Village, East Village, Soho, Nolita, Tribeca, Financial District, Battery Park City, Washington Heights, Inwood, and Roosevelt Island. Delivery routing shifts by neighborhood but the shop and install crew are the same.",
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-07-24",
  keywords:
    "kitchen renovation manhattan, manhattan kitchen remodel, manhattan custom cabinets, co-op kitchen renovation nyc, loft kitchen millwork, upper east side kitchen renovation",
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
  serviceType: "Kitchen Renovation & Custom Cabinets",
  provider: { "@id": "https://greencabinetsny.com/#localbusiness" },
  areaServed: { "@type": "Place", name: "Manhattan, NY" },
  url: URL,
  description: DESC,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "65000",
    highPrice: "180000",
  },
};

const KitchenRenovationManhattan = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="kitchen renovation manhattan, manhattan kitchen remodel, manhattan custom cabinets, co-op alteration agreement, loft kitchen millwork, upper east side kitchen, soho loft kitchen, tribeca kitchen renovation"
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
        { name: "Kitchen Renovation Manhattan", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Kitchen Renovation Manhattan" },
        ]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <MapPin className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            Custom cabinetry for every Manhattan co-op, condo & loft
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          Kitchen Renovation in Manhattan — Co-op, Condo & Loft Guide
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          Board alterations, freight-elevator logistics, pre-war galleys, and
          Soho loft millwork — everything a Manhattan homeowner needs before
          the demo hammer swings in 2026.
        </p>
        <p className="text-lg text-[#555555]">
          We build every cabinet at our Bushwick shop and install across
          Manhattan from the Battery to Inwood. Here's how a specialist
          millwork shop navigates the borough's peculiar rules.
        </p>
        <div className="mt-8 flex justify-center">
          <AuthorByline author="golan" label="Written by" />
        </div>
      </div>
    </section>

    <section className="py-16 bg-[#d5d5d5]">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Manhattan kitchen renovation pricing in 2026
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tier: "Pre-war galley (10–14 lf)", range: "$65,000 – $95,000", note: "UES/UWS classic six/seven galley. Slim-shaker painted, quartz counters, integrated panels." },
            { tier: "Condo / loft standard (16–22 lf)", range: "$95,000 – $140,000", note: "Chelsea/Tribeca open kitchen. Flat-panel walnut or two-tone, waterfall island, luxury appliance package." },
            { tier: "Full-floor loft / townhouse (25–40 lf)", range: "$140,000 – $280,000+", note: "Soho/West Village. Full-height pantry walls, dual islands, integrated Sub-Zero/Wolf/Miele, custom stone." },
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
          All-in ranges (cabinets + counters + appliances + labor + permits +
          board fees). Cabinetry alone is $350/lf for a full kitchen at our
          shop — the rest of the budget is trades, stone, and appliances.
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl space-y-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Co-op board alteration agreements
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Every Manhattan co-op requires an executed Alteration Agreement before demo — no exceptions.",
              "Standard submission: signed agreement, contractor COI naming the corporation and managing agent, licensed plumber/electrician letters, DOB permits if applicable, drawings, and finish schedule.",
              "Budget 4–8 weeks for board review. We use that window to mill and cure cabinets in Bushwick so nothing sits in a hallway.",
              "Many Fifth Avenue and Park Avenue buildings restrict work to 9am–4pm weekdays and prohibit summer renovation entirely — verify calendar before signing.",
              "Refundable deposits ($5,000–$25,000) and non-refundable review fees ($500–$2,500) are standard line items.",
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
            <Hammer className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Freight elevator & loading dock logistics
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Freight windows reserved through the building manager — usually a single 9am–4pm slot on a weekday.",
              "Cabinets pad-wrapped individually so they clear the freight cab without dinging the finish.",
              "Doorman buildings on the UES/UWS require the truck to double-park with hazards and a spotter — we handle the coordination.",
              "Soho and Tribeca cast-iron loft buildings often have narrow service elevators — we pre-size cabinets on paper before milling.",
              "Walk-up brownstones (West Village, Harlem, East Village) get split deliveries and hand-carry — factor an extra half-day of labor.",
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
              Realistic Manhattan timeline (6–14 weeks)
            </h2>
          </div>
          <ul className="space-y-3 text-[#555555]">
            {[
              ["Weeks 0–2", "Design consult, measure, finish selection, drawings for board package."],
              ["Weeks 2–8", "Board review in parallel with cabinet production at Bushwick."],
              ["Weeks 8–9", "Board approves. Demo starts. Cabinets delivered via freight elevator, installed 1–2 days."],
              ["Weeks 9–12", "Countertop template, fabrication, install. Appliance integration. Backsplash."],
              ["Weeks 12–14", "Punch-list, paint touch-up, final board sign-off, close-out COI."],
            ].map(([when, what]) => (
              <li key={when} className="flex gap-4">
                <span className="font-bold text-primary min-w-[100px]">{when}</span>
                <span>{what}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Hammer className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              What makes a Manhattan kitchen different
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              "Space is measured in inches — every filler, spacer, and appliance panel matters. Custom cabinetry recovers 8–14 inches over stock in a typical galley.",
              "Pre-war UES/UWS apartments (built 1900–1940) have plaster walls up to 2 inches out of plumb over an 8-ft run — cabinets scribe on-site.",
              "Soho and Tribeca cast-iron lofts have 11–14 ft ceilings — full-height pantries, upper cabinets stacked in two tiers, and oversized crown are standard.",
              "Chelsea and West Village brownstones often want the kitchen opened to the parlor — worth confirming load-bearing walls with a structural engineer before finalizing layout.",
              "Integrated appliances (Sub-Zero, Miele, Bosch) require custom cabinet panels to match — we build them in the same finish as the doors.",
              "Building work-hour restrictions cap most sites to 9am–4pm weekdays; noisy trades (demo, tile saw) may be limited further.",
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
          Every Manhattan install routes from our Bushwick shop — same
          cabinets, same install crew, same finish samples you'd see in
          Brooklyn or Staten Island.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Upper East Side", "Upper West Side", "Harlem", "Morningside Heights",
            "Midtown East", "Midtown West", "Murray Hill", "Gramercy",
            "Flatiron", "Chelsea", "West Village", "Greenwich Village",
            "East Village", "Soho", "Nolita", "Tribeca",
            "Financial District", "Battery Park City", "Washington Heights", "Inwood",
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
            Design your Manhattan kitchen
          </Link>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-10 text-center">
          Manhattan kitchen renovation FAQs
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

export default KitchenRenovationManhattan;
