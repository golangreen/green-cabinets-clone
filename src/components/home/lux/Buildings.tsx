import Shell from "./Shell";
import photo from "@/assets/gallery/wood-kitchen-outdoor-access.jpeg";

const RULES = [
  {
    title: "Certificates of insurance",
    text: "Naming the building, managing agent and board as additional insureds, usually within 48 hours.",
  },
  {
    title: "Alteration agreements",
    text: "Contractor registrations and every document your building asks for, handled for you.",
  },
  {
    title: "Freight elevator",
    text: "Reserved with your super or managing agent before delivery day, with wall and floor protection.",
  },
  {
    title: "Quiet hours",
    text: "Loud work only in permitted hours. Quiet finish work fills the rest, so neighbors stay happy.",
  },
  {
    title: "Sized for the stairs",
    text: "In walk-ups and brownstones, boxes are sized to clear the stoop, the stair turn and the door swing.",
  },
];

const Buildings = () => (
  <Shell id="buildings" labelledBy="buildings-title" className="bg-ink">
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <div data-reveal="image" className="relative aspect-[4/5] bg-ink-3">
            <img
              src={photo}
              alt="Wood kitchen with marble countertops opening onto an outdoor patio"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div data-reveal="up">
          <p className="lux-eyebrow mb-5">Co-ops, condos &amp; brownstones</p>
          <h2 id="buildings-title" className="lux-display text-[clamp(2.3rem,4.6vw,4.25rem)] text-ivory">
            We know what the board will ask before you do.
          </h2>
          <p className="lux-body mt-5 max-w-2xl text-base sm:text-lg text-ivory/70">
            In New York the building sets the schedule. We plan around it from the first visit, so the
            install day is the easy part.
          </p>
        </div>

        <dl className="mt-12">
          {RULES.map((r, i) => (
            <div
              key={r.title}
              data-reveal="up"
              style={{ "--d": `${i * 60}ms` } as React.CSSProperties}
              className="grid grid-cols-1 gap-2 border-t border-white/15 py-6 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8"
            >
              <dt className="font-lux text-2xl text-ivory">{r.title}</dt>
              <dd className="lux-body text-ivory/70">{r.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </Shell>
);

export default Buildings;
