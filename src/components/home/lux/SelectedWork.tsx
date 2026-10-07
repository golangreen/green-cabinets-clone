import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Shell from "./Shell";
import SectionHead from "./SectionHead";
import oakKitchen from "@/assets/gallery/design-reality-kitchen-1-completed-view1.webp";
import darkCloset from "@/assets/gallery/dark-walk-in-closet-center-island.jpg";
import greenKitchen from "@/assets/gallery/green-kitchen-marble-island.png";
import floatingVanity from "@/assets/gallery/modern-bathroom-floating-wood-vanity.jpeg";
import litCloset from "@/assets/gallery/luxury-walk-in-closet-integrated-lighting.jpg";

const CATEGORIES = [
  { label: "Kitchens", to: "/gallery?category=kitchens" },
  { label: "Vanities", to: "/gallery?category=vanities" },
  { label: "Closets", to: "/gallery?category=closets" },
  { label: "Design to reality", to: "/gallery?category=design-to-reality" },
];

interface Tile {
  src: string;
  alt: string;
  caption: string;
  kind: string;
  to: string;
  className: string;
  ratio: string;
}

const TILES: Tile[] = [
  {
    src: oakKitchen,
    alt: "Flat-panel white oak kitchen with a marble waterfall island and full-height pantry wall",
    caption: "White oak, flat panel, marble waterfall island",
    kind: "Kitchen",
    to: "/gallery?category=kitchens",
    className: "md:col-span-8",
    ratio: "aspect-[3/2]",
  },
  {
    src: darkCloset,
    alt: "Dark walk-in closet with a center island and lit shelving",
    caption: "Walk-in with a center island",
    kind: "Closet",
    to: "/gallery?category=closets",
    className: "md:col-span-4",
    ratio: "aspect-[4/5] md:aspect-auto md:flex-1 md:min-h-0",
  },
  {
    src: greenKitchen,
    alt: "Painted green kitchen cabinetry with a marble island",
    caption: "Painted green, marble island",
    kind: "Kitchen",
    to: "/gallery?category=kitchens",
    className: "md:col-span-4",
    ratio: "aspect-[4/5]",
  },
  {
    src: floatingVanity,
    alt: "Floating wood vanity in a marble bathroom",
    caption: "Floating wood vanity",
    kind: "Vanity",
    to: "/gallery?category=vanities",
    className: "md:col-span-4",
    ratio: "aspect-[4/5]",
  },
  {
    src: litCloset,
    alt: "Walk-in closet with integrated lighting in every shelf",
    caption: "Integrated shelf lighting",
    kind: "Closet",
    to: "/gallery?category=closets",
    className: "md:col-span-4",
    ratio: "aspect-[4/5]",
  },
];

const SelectedWork = () => (
  <Shell id="work" labelledBy="work-title" className="bg-ink">
    <SectionHead
      id="work-title"
      eyebrow="Selected work"
      title={<>Rooms built for the buildings they live in.</>}
      aside={
        <Link to="/gallery" className="lux-link font-display text-sm text-ivory/90">
          Browse 100+ projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
    />

    <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">
      {TILES.map((t, i) => (
        <li key={t.src} className={t.className}>
          <Link to={t.to} className="lux-zoom group block h-full">
            <figure className="flex h-full flex-col">
              <div
                data-reveal="image"
                style={{ "--d": `${(i % 3) * 90}ms` } as React.CSSProperties}
                className={`relative w-full bg-ink-3 ${t.ratio}`}
              >
                <img
                  src={t.src}
                  alt={t.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between gap-4 font-display text-sm">
                <span className="text-ivory/90">{t.caption}</span>
                <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-stone">{t.kind}</span>
              </figcaption>
            </figure>
          </Link>
        </li>
      ))}
    </ul>

    <nav aria-label="Gallery categories" className="mt-12 flex flex-wrap gap-2" data-reveal="up">
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

export default SelectedWork;
