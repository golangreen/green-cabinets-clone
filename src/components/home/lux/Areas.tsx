import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Shell from "./Shell";
import SectionHead from "./SectionHead";
import { BOROUGH_LIST } from "@/data/boroughSeo";

const SHOWN = 10;

const Areas = () => (
  <Shell id="areas" labelledBy="areas-title" className="bg-ink">
    <SectionHead
      id="areas-title"
      eyebrow="Where we work"
      title={<>Across New York City, by appointment.</>}
      lede="There is no walk-in showroom. We bring door and finish samples to your home, measure on site, then handle delivery and installation."
    />

    <ul className="grid grid-cols-1 gap-x-10 md:grid-cols-3">
      {BOROUGH_LIST.map((b, i) => {
        const more = b.neighborhoods.length - SHOWN;
        return (
          <li
            key={b.slug}
            data-reveal="up"
            style={{ "--d": `${i * 70}ms` } as React.CSSProperties}
            className="border-t border-white/15 py-8"
          >
            <h3>
              <Link
                to={`/custom-kitchen-cabinets-${b.slug}`}
                className="group inline-flex items-center gap-3 font-lux text-[2rem] leading-none text-ivory"
              >
                {b.name}
                <ArrowRight
                  className="h-5 w-5 text-brass transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </h3>
            <p className="mt-2 font-display text-sm text-stone">Custom kitchen cabinets in {b.name}</p>
            <p className="lux-body mt-5 text-[0.95rem] text-ivory/75">
              {b.neighborhoods.slice(0, SHOWN).join(" · ")}
              {more > 0 && <span className="text-stone"> and {more} more</span>}
            </p>
          </li>
        );
      })}
    </ul>
    <p data-reveal="up" className="mt-4 font-display text-sm text-stone">
      Also on Staten Island.{" "}
      <Link to="/kitchen-cabinets-staten-island" className="lux-link text-ivory/90">
        Staten Island kitchen cabinets
      </Link>
    </p>
  </Shell>
);

export default Areas;
