import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Shell from "./Shell";
import ChapterHead from "./ChapterHead";
import Print from "./Print";
import oakKitchen from "@/assets/gallery/natural-wood-kitchen-marble.jpeg";
import greenKitchen from "@/assets/gallery/green-kitchen-marble-island.png";
import litCloset from "@/assets/gallery/luxury-walk-in-closet-integrated-lighting.jpg";
import marbleBath from "@/assets/gallery/luxury-marble-bathroom-shower.jpeg";
import loftKitchen from "@/assets/gallery/loft-kitchen-exposed-brick-natural-wood.jpeg";

const PRINTS = [
  { src: oakKitchen, alt: "Natural oak kitchen with marble backsplash and counters", caption: "Natural oak, marble", tilt: -2.5, offset: "lg:mt-10" },
  { src: greenKitchen, alt: "Painted green kitchen cabinetry with a marble island", caption: "Painted green, brass fittings", tilt: 1.8, offset: "" },
  { src: litCloset, alt: "Walk-in closet with integrated lighting in every shelf", caption: "Lit walk-in closet", tilt: -1.2, offset: "lg:mt-20" },
  { src: marbleBath, alt: "Marble bathroom with a floating wood vanity", caption: "Floating vanity, marble bath", tilt: 2.4, offset: "lg:-mt-6" },
  { src: loftKitchen, alt: "Loft kitchen in natural wood against exposed brick", caption: "Brick loft kitchen", tilt: -1.8, offset: "lg:mt-8" },
];

const CATEGORIES = [
  { label: "Kitchens", to: "/gallery?category=kitchens" },
  { label: "Vanities", to: "/gallery?category=vanities" },
  { label: "Closets", to: "/gallery?category=closets" },
  { label: "Design to reality", to: "/gallery?category=design-to-reality" },
];

const LivingChapter = () => (
  <Shell id="work" labelledBy="ch5-title" className="overflow-hidden bg-ink" chapter="Living in it">
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <ChapterHead
        n="05"
        when="After"
        id="ch5-title"
        title={
          <>
            Then you <em className="italic text-brass">live in it.</em>
          </>
        }
        lede="Kitchens, vanities, closets and built-ins, made for the buildings they live in."
      />
      <Link to="/gallery" data-reveal="up" className="lux-link shrink-0 font-display text-sm text-ivory/90">
        Browse 100+ projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>

    <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-8 lg:grid-cols-5 lg:gap-x-6">
      {PRINTS.map((p, i) => (
        <Link
          key={p.src}
          to="/gallery"
          aria-label={`${p.caption}, see more in the gallery`}
          className={`${p.offset} ${i === 4 ? "col-span-2 mx-auto w-1/2 lg:col-span-1 lg:mx-0 lg:w-auto" : ""}`}
        >
          <Print src={p.src} alt={p.alt} caption={p.caption} tilt={p.tilt} delay={(i % 3) * 90} />
        </Link>
      ))}
    </div>

    <nav aria-label="Gallery categories" className="mt-16 flex flex-wrap gap-2" data-reveal="up">
      {CATEGORIES.map((c) => (
        <Link
          key={c.label}
          to={c.to}
          className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 px-5 font-display text-sm text-ivory/80 transition-[color,border-color,transform] duration-150 active:scale-[0.97] hover:border-white/40 hover:text-ivory"
        >
          {c.label}
        </Link>
      ))}
    </nav>
  </Shell>
);

export default LivingChapter;
