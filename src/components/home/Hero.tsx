import { Link } from "react-router-dom";
import { ScanLine } from "lucide-react";
import { openQuote } from "@/lib/quote";
import { isApp } from "@/lib/platform";

const LINES = [
  { text: "Most NYC kitchens", em: false },
  { text: "were never designed", em: false },
  { text: "for stock cabinets.", em: true },
];

const FACTS = [
  { k: "Since 2009", v: "Designed in Bushwick" },
  { k: "4 to 6 weeks", v: "From approved drawings to install" },
  { k: "COIs in 48 hours", v: "For co-op and condo boards" },
];

const Hero = () => (
  <section
    id="top"
    data-testid="hero-carousel"
    className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-ivory"
  >
    <img
      src="/hero-lcp.webp"
      alt="White oak kitchen with a marble waterfall island and walnut bar stools, built by Green Cabinets NY"
      width={1920}
      height={1080}
      {...{ fetchpriority: "high" }}
      loading="eager"
      decoding="async"
      className="lux-hero-img absolute inset-0 h-full w-full object-cover"
    />
    {/* Legibility: a deep floor gradient plus a soft left wash on wide screens */}
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/5" />
    <div aria-hidden="true" className="absolute inset-0 hidden md:block bg-gradient-to-r from-ink/75 via-ink/15 to-transparent" />
    {/* Phones: the headline sits over the brightest part of the photo, so dim it evenly */}
    <div aria-hidden="true" className="absolute inset-0 md:hidden bg-ink/45" />

    <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10 pt-32 pb-10 md:pb-14">
      <p className="lux-eyebrow lux-fade mb-6" style={{ "--d": "100ms" } as React.CSSProperties}>
        From a crooked wall to a finished kitchen
      </p>

      <h1 className="lux-display text-[clamp(2.75rem,6.2vw,6.25rem)]">
        {LINES.map((l, i) => (
          <span key={l.text} className="lux-line md:whitespace-nowrap">
            <span style={{ "--d": `${180 + i * 110}ms` } as React.CSSProperties}>
              {l.em ? <em className="italic text-brass">{l.text}</em> : l.text}
            </span>
          </span>
        ))}
      </h1>

      <p
        className="lux-body lux-fade mt-7 max-w-xl text-base sm:text-lg text-ivory/80"
        style={{ "--d": "420ms" } as React.CSSProperties}
      >
        Designed in Bushwick, built to spec, installed across Brooklyn, Manhattan and Queens. Including
        the co-op with the freight elevator and the brownstone with the crooked walls.
      </p>

      <div
        className="lux-fade mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        style={{ "--d": "520ms" } as React.CSSProperties}
      >
        {isApp() ? (
          <>
            {/* The app leads with what only the app can do */}
            <Link to="/scan" className="lux-btn">
              <ScanLine className="h-5 w-5" aria-hidden="true" /> Scan your room
            </Link>
            <button type="button" onClick={openQuote} className="lux-btn-ghost">
              Request a quote
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={openQuote} className="lux-btn">
              Request a quote
            </button>
            <a href="#work" className="lux-btn-ghost">
              See the work
            </a>
          </>
        )}
      </div>

      <dl
        className="lux-fade mt-12 md:mt-20 grid grid-cols-3 border-t border-white/15"
        style={{ "--d": "640ms" } as React.CSSProperties}
      >
        {FACTS.map((f, i) => (
          <div
            key={f.k}
            className={`py-4 pr-3 sm:py-5 sm:pr-6 ${i > 0 ? "border-l border-white/15 pl-3 sm:pl-6" : ""}`}
          >
            <dt className="font-lux text-[1.15rem] sm:text-2xl md:text-[1.75rem] leading-tight sm:leading-none text-ivory">{f.k}</dt>
            <dd className="mt-1.5 sm:mt-2 font-display text-xs sm:text-sm leading-snug text-stone">{f.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default Hero;
