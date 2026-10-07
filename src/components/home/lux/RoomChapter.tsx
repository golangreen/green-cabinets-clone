import Shell from "./Shell";
import ChapterHead from "./ChapterHead";
import Print from "./Print";
import samples from "@/assets/story/door-samples-measure.jpg";

// From the Brooklyn buyer's guide: what NYC rooms actually look like
const FACTS = [
  { k: "Rarely square", v: "Pre-war plaster walls get scribed on site, not shimmed with wide filler." },
  { k: "9 to 11 ft", v: "Brownstone ceilings, so uppers are planned for the height you have." },
  { k: "Closes at 4", v: "The freight elevator runs weekdays, roughly 9 to 4. We book it early." },
];

const RoomChapter = () => (
  <Shell id="process" labelledBy="ch1-title" className="bg-ink" chapter="The room">
    <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <ChapterHead
          n="01"
          when="Week 1"
          id="ch1-title"
          title={
            <>
              It starts with the room <em className="italic text-brass">you actually have.</em>
            </>
          }
          lede="We come to your home with door and finish samples, measure every wall, and talk through how you cook, store and live. Then we design around the building, not a catalog."
        />
        <dl className="mt-12 grid grid-cols-1 gap-x-8 sm:grid-cols-3">
          {FACTS.map((f, i) => (
            <div
              key={f.k}
              data-reveal="up"
              style={{ "--d": `${i * 50}ms` } as React.CSSProperties}
              className="border-t border-white/15 py-5"
            >
              <dt className="font-lux text-2xl text-ivory">{f.k}</dt>
              <dd className="lux-body mt-2 text-sm text-ivory/70">{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="lg:col-span-5">
        <Print
          src={samples}
          alt="Door samples in white oak, sage, greige and walnut with a brass tape measure and pull"
          caption="Samples come to you"
          tilt={2.5}
          className="mx-auto max-w-md"
        />
      </div>
    </div>
  </Shell>
);

export default RoomChapter;
