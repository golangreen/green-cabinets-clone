import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Shell from "./Shell";
import SectionHead from "./SectionHead";
import { WOOD_SPECIES } from "@/data/woodSpecies";
import { ALL_PANELS } from "@/data/finishes";

const BRANDS = ["Egger", "Tafisa", "Shinnoki", "Wilsonart", "AGT", "Blum", "Hettich", "Richelieu"];

const woodHero = WOOD_SPECIES.find((w) => w.slug === "white-oak") ?? WOOD_SPECIES[0];
// A wall of real cabinet-panel photos: Shinnoki veneers + Tafisa woodgrains and
// neutrals (no stone slabs, no flat color chips)
const veneers = ALL_PANELS.filter((p) => p.thumb && p.brand === "Shinnoki");
const tafisa = ALL_PANELS.filter(
  (p) => p.thumb && p.brand === "Tafisa" && (p.category === "Woodgrain" || p.category === "Whites & Neutrals"),
);
const swatches = Array.from({ length: 12 }, (_, i) => (i % 2 ? tafisa[i >> 1] : veneers[i >> 1])).filter(Boolean);

const Materials = () => (
  <Shell id="materials" labelledBy="materials-title" className="bg-ink-2">
    <SectionHead
      id="materials-title"
      eyebrow="Materials"
      title={<>Real panels. Real wood. Real product codes.</>}
      lede="Pick from the actual laminate, melamine and veneer decors we order, or from the hardwoods we build with. Every trade-off explained."
    />

    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <Link to="/wood-species" className="lux-zoom group block">
        <div data-reveal="image" className="relative aspect-[4/3] bg-ink-3">
          <img
            src={woodHero.image}
            alt={`${woodHero.name} board showing its grain`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <h3 className="lux-display text-[2rem] text-ivory">Wood species</h3>
            <p className="lux-body mt-1 text-ivory/70">
              {WOOD_SPECIES.length} hardwoods compared on hardness, grain, finish and cost.
            </p>
          </div>
          <ArrowRight className="mt-3 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
        </div>
      </Link>

      <Link to="/finishes-colors" className="group block">
        <div
          data-reveal="image"
          style={{ "--d": "120ms" } as React.CSSProperties}
          className="grid aspect-[4/3] grid-cols-4 grid-rows-3 gap-px bg-white/10"
        >
          {swatches.map((p) => (
            <div
              key={p.id}
              className="relative overflow-hidden"
              style={{ background: p.swatchHex || "#1F1C19" }}
              title={`${p.name} (${p.brand})`}
            >
              {p.thumb && (
                <img
                  src={p.thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <h3 className="lux-display text-[2rem] text-ivory">Finishes and colors</h3>
            <p className="lux-body mt-1 text-ivory/70">Decors from Tafisa, Egger, Shinnoki, Wilsonart and AGT, with codes.</p>
          </div>
          <ArrowRight className="mt-3 h-5 w-5 shrink-0 text-brass" aria-hidden="true" />
        </div>
      </Link>
    </div>

    <div data-reveal="up" className="mt-16 border-t border-white/15 pt-8">
      <p className="lux-eyebrow mb-5">Suppliers we build with</p>
      <ul className="flex flex-wrap gap-x-10 gap-y-3">
        {BRANDS.map((b) => (
          <li key={b} className="font-lux text-2xl md:text-3xl text-ivory/55">
            {b}
          </li>
        ))}
      </ul>
    </div>
  </Shell>
);

export default Materials;
