import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Shell from "./Shell";
import SectionHead from "./SectionHead";
import { openQuote } from "@/lib/quote";

type Action = { label: string; quote: true } | { label: string; to: string };

const AUDIENCES: { n: string; who: string; title: string; lede: string; points: string[]; action: Action }[] = [
  {
    n: "01",
    who: "Homeowners",
    title: "A kitchen that fits the room you actually have.",
    lede: "Brownstones, co-ops, condos and lofts across Brooklyn, Manhattan and Queens.",
    points: ["Free in-home consult", "Samples brought to you", "Board paperwork handled"],
    action: { label: "Request a quote", quote: true },
  },
  {
    n: "02",
    who: "Designers & architects",
    title: "Your drawings, built to spec.",
    lede: "A dependable millwork partner for design firms and architectural studios.",
    points: ["Shop drawings for approval", "Trade pricing", "Blum and Hettich hardware"],
    action: { label: "Upload drawings for an estimate", to: "/estimator" },
  },
  {
    n: "03",
    who: "Developers & GCs",
    title: "Multi-unit and commercial millwork.",
    lede: "Kitchens, baths and fixtures for buildings, hospitality, retail and offices.",
    points: ["Multi-unit packages", "Reception desks and paneling", "COIs in 48 hours"],
    action: { label: "Discuss a project", quote: true },
  },
];

const Audiences = () => (
  <Shell id="services" labelledBy="services-title" className="bg-ink" chapter="Who it's for">
    <SectionHead
      id="services-title"
      eyebrow="Who we build for"
      title={<>One studio. Three kinds of client.</>}
      lede="Custom kitchen cabinets, vanities, closets, built-ins and commercial millwork, designed in Bushwick since 2009."
    />

    <ol className="grid grid-cols-1 gap-x-10 lg:grid-cols-3">
      {AUDIENCES.map((a, i) => (
        <li
          key={a.n}
          data-reveal="up"
          style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
          className="flex flex-col border-t border-white/15 py-10"
        >
          <div className="flex items-baseline justify-between">
            <p className="lux-eyebrow">{a.who}</p>
            <span className="font-lux text-lg text-stone">{a.n}</span>
          </div>
          <h3 className="lux-display mt-6 text-[2rem] md:text-[2.25rem] text-ivory">{a.title}</h3>
          <p className="lux-body mt-4 text-ivory/70">{a.lede}</p>
          <p className="mt-5 flex-1 font-display text-sm text-stone">{a.points.join(" · ")}</p>
          <div className="mt-8">
            {"quote" in a.action ? (
              <button type="button" onClick={openQuote} className="lux-link font-display text-sm">
                {a.action.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <Link to={a.action.to} className="lux-link font-display text-sm">
                {a.action.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  </Shell>
);

export default Audiences;
