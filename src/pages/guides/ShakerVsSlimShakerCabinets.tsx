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

const URL = "https://greencabinetsny.com/shaker-vs-slim-shaker-cabinets";
const TITLE = "Shaker vs Slim Shaker Cabinets — NYC Design Guide 2026";
const DESC =
  "Shaker vs slim shaker kitchen cabinets in NYC: rail widths, construction, cost, and how each style reads in a Brooklyn brownstone versus a modern Manhattan loft.";

const FAQS = [
  {
    q: "What's the actual difference between shaker and slim shaker cabinets?",
    a: 'A classic shaker door has 2–2.5" wide rails and stiles framing a recessed center panel. A slim shaker narrows those rails to 1–1.5" — the frame reads as a thin line around the panel instead of a defined border. Same 5-piece construction, tighter proportions.',
  },
  {
    q: "Which style fits a pre-war Brooklyn brownstone?",
    a: "Classic shaker. The heavier rail complements original crown, tall baseboards, and traditional trim in brownstones and pre-war co-ops. It anchors the room instead of disappearing into it.",
  },
  {
    q: "What works better in a modern Manhattan loft or new-build condo?",
    a: "Slim shaker. The narrow frame keeps the door visually flat while still adding shadow depth — a middle ground between full slab and traditional shaker that reads contemporary without going austere.",
  },
  {
    q: "Is slim shaker more expensive than classic shaker?",
    a: 'From our Bushwick shop the cost is within 3–5% either way. Slim shaker uses less material but requires tighter tolerances on the mortise-and-tenon joinery — a 1" rail leaves no room for a sloppy joint. The pricing evens out.',
  },
  {
    q: "Do slim shaker doors hold up long-term?",
    a: "Yes, when built correctly. The critical spec is joinery: mortise-and-tenon or dowelled solid-wood construction, not stapled or biscuited. Anything less will telegraph seasonal wood movement through the narrow rail within a few years.",
  },
  {
    q: "Can I mix classic shaker on bases with slim shaker on uppers?",
    a: "We advise against it. Rail width is a proportion cue the eye picks up immediately — mixing reads as a mistake rather than a design choice. Commit to one profile across the whole kitchen.",
  },
  {
    q: "Which style ages better in resale?",
    a: 'Classic shaker has 100+ years of design equity and reads timeless in any NYC market. Slim shaker is currently trending — strong in $1.5M+ Manhattan and Williamsburg listings but less universal in outer-borough resale. Pick classic if you plan to sell in 5–7 years across a broad buyer pool.',
  },
];

const articleSchema = buildArticleSchema({
  url: URL,
  headline: TITLE,
  description: DESC,
  datePublished: "2026-07-23",
  keywords:
    "shaker vs slim shaker cabinets, slim shaker cabinets, shaker cabinets nyc, modern shaker cabinets, brownstone kitchen cabinets, loft kitchen cabinets",
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

const compareRows: Array<{ label: string; classic: string; slim: string }> = [
  { label: "Rail / stile width", classic: '2" – 2.5"', slim: '1" – 1.5"' },
  { label: "Visual weight", classic: "Framed, traditional", slim: "Minimal, contemporary" },
  { label: "Best fit", classic: "Brownstones, pre-war, transitional", slim: "Lofts, condos, modern renos" },
  { label: "Panel reveal", classic: "Pronounced shadow line", slim: "Subtle shadow line" },
  { label: "Joinery required", classic: "Mortise-and-tenon", slim: "Mortise-and-tenon (tight tolerance)" },
  { label: "Hardware pairing", classic: "Knobs, cup pulls, bar pulls", slim: "Edge pulls, bar pulls, push-to-open" },
  { label: "Installed cost (20 lf)", classic: "$6,500 – $8,000", slim: "$6,700 – $8,300" },
  { label: "Design longevity", classic: "Timeless", slim: "Currently trending" },
];

const ShakerVsSlimShakerCabinets = () => (
  <div className="min-h-screen">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="title" content={TITLE} />
      <meta name="description" content={DESC} />
      <meta
        name="keywords"
        content="shaker vs slim shaker cabinets, slim shaker cabinets, shaker cabinets nyc, modern shaker cabinets, brownstone kitchen cabinets, loft kitchen cabinets"
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
        { name: "Shaker vs Slim Shaker Cabinets", url: URL },
      ]}
    />

    <Header />

    <div className="pt-[96px] sm:pt-[128px] md:pt-[160px]">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Shaker vs Slim Shaker Cabinets" },
        ]}
      />
    </div>

    <section className="pt-10 pb-16 sm:pb-20 md:pb-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-4">
          <Award className="w-5 h-5" />
          <span className="font-semibold uppercase tracking-wide text-sm">
            NYC design guide — 2026
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
          Shaker vs Slim Shaker Cabinets
        </h1>
        <p className="text-xl text-[#555555] mb-6">
          A half-inch of rail width is the difference between a
          brownstone-classic kitchen and a Williamsburg-loft kitchen.
        </p>
        <p className="text-lg text-[#555555]">
          Here's how we help clients pick between the two at our Bushwick
          workshop — with actual proportions, joinery specs, and hardware
          pairings that hold up in NYC apartments.
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
            <div className="p-4 border-l border-primary-foreground/20">Classic Shaker</div>
            <div className="p-4 border-l border-primary-foreground/20">Slim Shaker</div>
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
                {row.classic}
              </div>
              <div className="p-4 border-l border-[#e5e5e5] text-[#1a1a1a]">
                <Check className="inline w-4 h-4 text-primary mr-2" />
                {row.slim}
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
              How rail width changes the room
            </h2>
          </div>
          <p className="text-[#555555] mb-4">
            Classic shaker's 2"+ rail carries visual weight — it plays well
            with 8"+ baseboards, plaster crown, and casement window trim
            typical of pre-war Brooklyn brownstones and Upper West Side
            classic-sixes. The frame gives the door a defined edge that
            balances the ornament around it.
          </p>
          <p className="text-[#555555]">
            Slim shaker's 1" rail nearly disappears at a distance. In a
            modern Williamsburg loft or a new Long Island City condo with
            flat trim and floor-to-ceiling windows, that restraint reads as
            intentional. In a brownstone with heavy period trim, it reads as
            missing detail.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Hammer className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Construction from our Bushwick shop
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              'Both profiles use 5-piece solid-wood door construction — no MDF veneer, no stapled panels.',
              'Mortise-and-tenon joinery is standard on both; slim shaker demands a tighter joint tolerance because there\'s less material to hide seasonal movement.',
              'We spray and cure in-house in Bushwick — the finish batch stays consistent across every door in your order.',
              'Panel float is engineered per species — quartersawn white oak, walnut, maple, and painted poplar all behave differently in a narrow rail.',
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
              Hardware pairings that work
            </h2>
          </div>
          <ul className="space-y-2 text-[#555555]">
            {[
              'Classic shaker + polished nickel or unlacquered brass cup pulls — signature brownstone kitchen look.',
              'Classic shaker + matte black knobs — transitional, works in Park Slope and Cobble Hill.',
              'Slim shaker + brushed brass edge pulls — clean loft feel, no protrusion at the door face.',
              'Slim shaker + integrated finger pulls or push-to-open — most contemporary read, best in modern condos.',
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
      <div className="container mx-auto px-6 max-w-3xl text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-4">
          See both profiles in the designer
        </h2>
        <p className="text-[#555555] mb-8">
          Configure a classic shaker or slim shaker kitchen with real
          finishes, real hardware, and real pricing before you commit.
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
          Shaker vs slim shaker FAQs
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

export default ShakerVsSlimShakerCabinets;
