import Shell from "./Shell";
import SectionHead from "./SectionHead";
import render from "@/assets/gallery/design-render-kitchen-1-view1.jpeg";
import built from "@/assets/gallery/design-reality-kitchen-1-completed-view2.webp";

const STEPS = [
  {
    when: "Week 1",
    title: "Consult and measure",
    text: "We come to your home with door and finish samples, measure every wall, and talk through how you cook, store and live.",
  },
  {
    when: "Weeks 1 to 2",
    title: "Design and shop drawings",
    text: "You approve detailed drawings, materials and hardware before anything is cut. No surprises later.",
  },
  {
    when: "Weeks 3 to 5",
    title: "Fabrication",
    text: "CNC-cut boxes and doors, assembly, spray finishing and a final quality inspection before anything ships.",
  },
  {
    when: "Week 6",
    title: "Delivery and install",
    text: "Most installs take 3 to 7 days, scheduled around your building's freight elevator and quiet hours.",
  },
];

const Process = () => (
  <Shell id="process" labelledBy="process-title" className="bg-ink">
    <SectionHead
      id="process-title"
      eyebrow="How it works"
      title={
        <>
          Four steps. <em className="italic text-brass">Four to six weeks.</em>
        </>
      }
      lede="Most kitchens are complete four to six weeks from approved drawings. You get the timeline up front and updates at every stage."
    />

    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
      {STEPS.map((s, i) => (
        <li
          key={s.title}
          data-reveal="up"
          style={{ "--d": `${i * 80}ms` } as React.CSSProperties}
          className="relative border-t border-white/15 pt-6 pb-10"
        >
          {/* Brass tick marks this step's place on the timeline */}
          <span aria-hidden="true" className="absolute -top-px left-0 h-px w-12 bg-brass" />
          <p className="font-display text-xs uppercase tracking-[0.18em] text-brass">{s.when}</p>
          <h3 className="lux-display mt-4 text-[1.9rem] text-ivory">
            <span className="mr-3 text-stone">{i + 1}</span>
            {s.title}
          </h3>
          <p className="lux-body mt-3 text-ivory/70">{s.text}</p>
        </li>
      ))}
    </ol>

    <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
      <figure>
        <div data-reveal="image" className="relative aspect-[3/2] bg-[#E9E3D8]">
          <img
            src={render}
            alt="3D design render of a kitchen with an island, prepared before fabrication"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-4 mix-blend-multiply"
          />
        </div>
        <figcaption className="mt-3 font-display text-sm text-stone">
          <span className="text-ivory/90">The drawing.</span> Every run, panel and appliance placed before
          production.
        </figcaption>
      </figure>
      <figure>
        <div data-reveal="image" style={{ "--d": "120ms" } as React.CSSProperties} className="relative aspect-[3/2] bg-ink-3">
          <img
            src={built}
            alt="The same kitchen installed: white oak cabinetry with a marble island"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <figcaption className="mt-3 font-display text-sm text-stone">
          <span className="text-ivory/90">The kitchen.</span> Same project, installed.
        </figcaption>
      </figure>
    </div>
  </Shell>
);

export default Process;
