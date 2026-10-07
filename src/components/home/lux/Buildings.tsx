import Shell from "./Shell";
import ChapterHead from "./ChapterHead";
import photo from "@/assets/gallery/wood-kitchen-outdoor-access.jpeg";

const RULES = [
  {
    title: "Paperwork",
    text: "COIs naming the building, agent and board, usually within 48 hours, plus alteration agreements and registrations.",
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
  <Shell id="buildings" labelledBy="buildings-title" className="bg-ink-2" chapter="Install day">
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <div data-reveal="image" className="relative aspect-[4/5] bg-ink-3">
            <img
              src={photo}
              alt="Finished white oak kitchen opening onto a terrace"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <ChapterHead
          n="04"
          when="Week 6"
          id="buildings-title"
          title={
            <>
              Install day. <em className="italic text-brass">The paperwork is already done.</em>
            </>
          }
          lede="Most installs take 3 to 7 days. In New York the building sets the schedule, so we plan around it from the first visit."
        />

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
