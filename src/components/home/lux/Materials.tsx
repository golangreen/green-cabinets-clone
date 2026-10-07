import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Shell from "./Shell";
import ChapterHead from "./ChapterHead";
import { WOOD_SPECIES } from "@/data/woodSpecies";
import edge from "@/assets/story/oak-edge-brass-pull.jpg";

const LINKS = [
  {
    to: "/wood-species",
    title: "Wood species",
    text: `${WOOD_SPECIES.length} hardwoods compared on hardness, grain, finish and cost.`,
  },
  {
    to: "/finishes-colors",
    title: "Finishes and colors",
    text: "Real decors from Tafisa, Egger, Shinnoki, Wilsonart and AGT, with product codes.",
  },
];

const Materials = () => (
  <Shell id="materials" labelledBy="materials-title" className="bg-ink" chapter="Made to spec">
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:order-2 lg:col-span-6">
        <div data-reveal="image" className="relative aspect-[4/3] bg-ink-3">
          <img
            src={edge}
            alt="Close-up of a white oak cabinet door with a brushed brass edge pull and a soft-close hinge"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="lg:order-1 lg:col-span-6">
        <ChapterHead
          n="03"
          when="Weeks 3 to 5"
          id="materials-title"
          title={
            <>
              Made to spec, <em className="italic text-brass">down to the hinge.</em>
            </>
          }
          lede="CNC-cut boxes and doors, Blum and Hettich hardware, low-VOC spray finishes and a final quality inspection before anything ships."
        />
        <ul className="mt-10">
          {LINKS.map((l, i) => (
            <li key={l.to} data-reveal="up" style={{ "--d": `${i * 50}ms` } as React.CSSProperties}>
              <Link to={l.to} className="group flex items-center justify-between gap-6 border-t border-white/15 py-6">
                <span>
                  <span className="block font-lux text-[1.75rem] leading-tight text-ivory">{l.title}</span>
                  <span className="lux-body mt-1 block text-sm text-ivory/65">{l.text}</span>
                </span>
                <ArrowRight
                  className="h-5 w-5 shrink-0 text-brass transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Shell>
);

export default Materials;
