import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Shell from "./Shell";
import SectionHead from "./SectionHead";
import { openQuote } from "@/lib/quote";

// Same ranges and rates as the Brooklyn buyer's guide (/custom-kitchen-cabinets-brooklyn)
const TIERS = [
  {
    name: "Small kitchen",
    size: "10 to 14 linear feet",
    range: "$4,200 to $6,500",
    note: "Co-op galley or garden-floor rental unit. Painted shaker, soft-close hinges and slides, standard hardware.",
  },
  {
    name: "Standard kitchen",
    size: "16 to 22 linear feet",
    range: "$6,000 to $9,500",
    note: "L-shape or U-shape with a peninsula. Two-tone paint or a paint-and-veneer combination.",
  },
  {
    name: "Brownstone gut",
    size: "26 to 36 linear feet",
    range: "$12,000 to $20,000+",
    note: "Full-height pantry walls, an island with seating, appliance panels, specialty finishes and integrated pulls.",
  },
];

const RATES = [
  { k: "$350", v: "per linear foot, full kitchen" },
  { k: "$225", v: "per linear foot, base only" },
  { k: "$125", v: "per linear foot, wall only" },
];

const Pricing = () => (
  <Shell id="pricing" labelledBy="pricing-title" className="bg-ink-2" chapter="Pricing">
    <SectionHead
      id="pricing-title"
      eyebrow="Pricing"
      title={<>Real numbers, before the first visit.</>}
      lede="Most cabinet shops make you wait for a quote to learn the price. Here is what NYC kitchens cost with us in 2026."
      aside={
        <Link to="/custom-kitchen-cabinets-brooklyn" className="lux-link font-display text-sm text-ivory/90">
          Full pricing guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
    />

    <ul className="grid grid-cols-1 gap-px overflow-hidden bg-white/10 md:grid-cols-3">
      {TIERS.map((t, i) => (
        <li
          key={t.name}
          data-reveal="up"
          style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
          className="flex flex-col bg-ink-2 p-7 md:p-9"
        >
          <p className="lux-eyebrow">{t.name}</p>
          <p className="mt-2 font-display text-sm text-stone">{t.size}</p>
          <p className="lux-display mt-8 text-[clamp(2.1rem,3.4vw,3rem)] text-ivory">{t.range}</p>
          <p className="lux-body mt-5 text-[0.95rem] text-ivory/70">{t.note}</p>
        </li>
      ))}
    </ul>

    <div
      data-reveal="up"
      className="mt-10 flex flex-col gap-8 border-t border-white/15 pt-8 lg:flex-row lg:items-center lg:justify-between"
    >
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-10">
        {RATES.map((r) => (
          <div key={r.k}>
            <dt className="font-lux text-3xl text-ivory">{r.k}</dt>
            <dd className="mt-1 font-display text-sm text-stone">{r.v}</dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={openQuote} className="lux-btn self-start lg:self-auto">
        Get your exact price
      </button>
    </div>
    <p className="mt-6 max-w-3xl font-display text-xs leading-relaxed text-stone">
      Cabinetry only. Countertops, appliances, tile, plumbing and electrical are separate.
    </p>
  </Shell>
);

export default Pricing;
