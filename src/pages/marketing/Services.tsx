import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/lux/PageHero";
import ContactCta from "@/components/home/lux/ContactCta";
import { useLuxPage } from "@/hooks/useLuxPage";
import { isApp } from "@/lib/platform";
import kitchen from "@/assets/gallery/modern-kitchen-marble-waterfall-wood-base.webp";
import vanity from "@/assets/gallery/contemporary-bathroom-wood-vanity-double-sink.webp";
import builtIns from "@/assets/gallery/natural-wood-hallway-cabinets.jpeg";
import commercial from "@/assets/gallery/modern-workspace-wood-desk-brick.jpeg";

const MAKE = [
  {
    id: "kitchens",
    k: "01",
    title: "Kitchen cabinets",
    body: "Full kitchens drawn to the room you actually have: crooked walls, low soffits, radiators and all. Painted shaker, wood veneer, slab laminate, or a mix.",
    points: ["Islands, pantry walls and appliance panels", "Paint, veneer and laminate finishes", "Blum and Hettich hardware"],
    img: kitchen,
    alt: "Waterfall marble island on a white oak base in a finished kitchen",
    links: [
      { to: "/gallery?category=kitchens", label: "See kitchens" },
      { to: "/#pricing", label: "Kitchen pricing" },
    ],
  },
  {
    id: "vanities",
    k: "02",
    title: "Bathroom vanities",
    body: "Floating and floor-standing vanities sized to the inch, with drawers that clear the plumbing and finishes that handle steam.",
    points: ["Single, double and powder-room sizes", "Moisture-resistant boxes and finishes", "Medicine cabinets and linen towers"],
    img: vanity,
    alt: "Floating white oak double vanity with two undermount sinks",
    links: [
      { to: "/gallery?category=vanities", label: "See vanities" },
      { to: "/designer", label: "Design a vanity" },
    ],
  },
  {
    id: "closets",
    k: "03",
    title: "Closets and built-ins",
    body: "Walk-ins, reach-ins, wardrobe walls, media units and window seats that use the awkward corners stock furniture can't.",
    points: ["Walk-in and reach-in closets", "Wardrobe and storage walls", "Libraries, media walls and banquettes"],
    img: builtIns,
    alt: "Full-height walnut storage wall along a hallway leading to a bright dining room",
    links: [{ to: "/gallery?category=closets", label: "See closets" }],
  },
  {
    id: "commercial",
    k: "04",
    title: "Commercial and multi-unit millwork",
    body: "Kitchens, baths and fixtures for buildings, hospitality, retail and offices, delivered to spec and to schedule.",
    points: ["Multi-unit kitchen and bath packages", "Reception desks and paneling", "Shop drawings for approval"],
    img: commercial,
    alt: "Built-in wood desk and shelving against an exposed brick wall",
    links: [{ to: "/#services", label: "Who we work with" }],
  },
];

const STEPS = [
  { t: "Measure", d: "A free in-home consultation, or scan the room yourself with the Green Cabinets app. We bring the samples." },
  { t: "Draw", d: "CAD plans and 3D views of your room. For designers and architects, shop drawings for approval." },
  { t: "Build", d: "CNC-cut boxes and doors, Blum and Hettich hardware, low-VOC spray finishes and a quality check before anything ships." },
  { t: "Install", d: "Most installs take 3 to 7 days. COIs, elevator bookings and building paperwork are handled before delivery day." },
];

const Services = () => {
  useLuxPage();
  const tools = [
    { to: "/scan", k: isApp() ? "In this app" : "iPhone app", t: "Scan your room", d: "Walk the room with a LiDAR iPhone and send us a 3D outline with every wall measured." },
    { to: "/estimator", k: "Instant", t: "Cost estimator", d: "Upload drawings or a cabinet list and get a ballpark number in minutes." },
    { to: "/designer", k: "Try it", t: "Design a vanity", d: "Pick a size, layout and finish, and send the design to us for a quote." },
    { to: "/finishes-colors", k: "Real panels", t: "Finishes and colors", d: "Browse the actual panels we order from, save favorites and share the list." },
  ];

  return (
    <div className="min-h-dvh bg-ink text-ivory">
      <Helmet>
        <title>Services: Custom Kitchens, Vanities, Closets & Millwork | Green Cabinets NY</title>
        <meta
          name="description"
          content="Custom kitchen cabinets, bathroom vanities, closets, built-ins and commercial millwork for Brooklyn, Manhattan and Queens. Designed in Bushwick since 2009."
        />
        <link rel="canonical" href="https://greencabinetsny.com/services" />
        <meta property="og:title" content="Services | Green Cabinets NY" />
        <meta property="og:description" content="Custom kitchens, vanities, closets, built-ins and commercial millwork across NYC." />
        <meta property="og:url" content="https://greencabinetsny.com/services" />
        <meta property="og:image" content="https://greencabinetsny.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Green Cabinets NY services",
          itemListElement: MAKE.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@type": "Service", name: m.title, description: m.body, provider: { "@id": "https://greencabinetsny.com/#localbusiness" }, areaServed: ["Brooklyn", "Manhattan", "Queens"] },
          })),
        })}</script>
      </Helmet>

      <Header />

      <main>
        <PageHero
          crumbs={[{ label: "Home", to: "/" }, { label: "Services" }]}
          eyebrow="Services"
          title={
            <>
              Everything that&rsquo;s <em className="italic text-brass">built in</em>.
            </>
          }
          lede="Custom kitchen cabinets, vanities, closets, built-ins and commercial millwork for Brooklyn, Manhattan and Queens. Designed in Bushwick since 2009."
        />

        {/* What we make */}
        <section aria-label="What we make" className="border-t border-white/10">
          {MAKE.map((m, i) => (
            <article
              key={m.id}
              id={m.id}
              aria-labelledby={`${m.id}-title`}
              className="mx-auto grid max-w-[1440px] scroll-mt-24 grid-cols-1 items-center gap-10 border-b border-white/10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-12 lg:gap-16 lg:px-10"
            >
              <div className={`lg:col-span-7 ${i % 2 ? "lg:order-2" : ""}`} data-reveal="image">
                <div className="aspect-[4/3] overflow-hidden bg-ink-3">
                  <img src={m.img} alt={m.alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className={`lg:col-span-5 ${i % 2 ? "lg:order-1" : ""}`} data-reveal="up">
                <p className="lux-eyebrow mb-5">{m.k}</p>
                <h2 id={`${m.id}-title`} className="lux-display text-[clamp(2.2rem,4vw,3.75rem)] text-ivory">
                  {m.title}
                </h2>
                <p className="lux-body mt-5 text-base text-ivory/70 sm:text-lg">{m.body}</p>
                <ul className="mt-7 space-y-3 border-t border-white/10 pt-6">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-3 font-display text-sm text-ivory/80">
                      <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-brass" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 font-display text-sm">
                  {m.links.map((l) => (
                    <Link key={l.to} to={l.to} className="lux-link text-ivory">
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* How it runs */}
        <section aria-labelledby="steps-title" className="bg-ink-2">
          <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 md:py-28 lg:px-10">
            <div className="mb-14 max-w-3xl" data-reveal="up">
              <p className="lux-eyebrow mb-5">How it runs</p>
              <h2 id="steps-title" className="lux-display text-[clamp(2.3rem,4.6vw,4.25rem)] text-ivory">
                Four steps, one team.
              </h2>
            </div>
            <ol className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.t} className="bg-ink-2 p-8" data-reveal="up" style={{ "--d": `${i * 50}ms` } as React.CSSProperties}>
                  <p className="font-lux text-5xl leading-none text-brass tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-6 font-lux text-[1.9rem] leading-tight text-ivory">{s.t}</h3>
                  <p className="lux-body mt-3 text-sm text-ivory/65">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Tools */}
        <section aria-labelledby="tools-title" className="border-t border-white/10">
          <div className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 md:py-28 lg:px-10">
            <div className="mb-14 max-w-3xl" data-reveal="up">
              <p className="lux-eyebrow mb-5">Start on your own</p>
              <h2 id="tools-title" className="lux-display text-[clamp(2.3rem,4.6vw,4.25rem)] text-ivory">
                Tools you can use tonight.
              </h2>
            </div>
            <ul className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {tools.map((t, i) => (
                <li key={t.to} className="bg-ink" data-reveal="up" style={{ "--d": `${i * 50}ms` } as React.CSSProperties}>
                  <Link to={t.to} className="group flex h-full flex-col p-8 transition-colors duration-300 hover:bg-ink-2">
                    <p className="lux-eyebrow mb-6">{t.k}</p>
                    <h3 className="font-lux text-[1.9rem] leading-tight text-ivory">{t.t}</h3>
                    <p className="lux-body mt-3 flex-1 text-sm text-ivory/65">{t.d}</p>
                    <span className="lux-link mt-8 self-start font-display text-sm text-ivory">Open</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ContactCta />
      </main>

      <Footer />
    </div>
  );
};

export default Services;
