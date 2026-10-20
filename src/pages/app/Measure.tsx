import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Ruler, X } from "lucide-react";
import Header from "@/components/layout/Header";
import PictureStrip from "@/components/app/PictureStrip";
import SendToOffice from "@/components/app/SendToOffice";
import { arAvailable, openMeasure } from "@/lib/native/tools";
import { UNITS, lengthIn, type Unit } from "@/lib/scan/roomScan";

interface Length {
  m: number;
  name: string;
}

const UNIT_KEY = "gc_measure_unit";
const units = UNITS.filter((u) => u.key !== "none");

/** App only: a tape measure in the camera, for a wall, a gap or a window. */
const Measure = () => {
  const [ok, setOk] = useState<boolean | null>(null);
  const [unit, setUnitState] = useState<Unit>(() => {
    try {
      return (localStorage.getItem(UNIT_KEY) as Unit) || "ftin";
    } catch {
      return "ftin";
    }
  });
  const [lengths, setLengths] = useState<Length[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fmt = lengthIn(unit);

  useEffect(() => {
    arAvailable().then(setOk);
  }, []);

  const setUnit = (u: Unit) => {
    setUnitState(u);
    try {
      localStorage.setItem(UNIT_KEY, u);
    } catch {
      /* private mode */
    }
  };

  const open = async () => {
    setError(null);
    try {
      const r = await openMeasure(unit);
      setLengths((l) => [...l, ...r.lengths.map((m) => ({ m, name: "" }))]);
      setPhotos((p) => [...p, ...r.photos].slice(-10));
    } catch {
      setError("The camera couldn't start. Allow camera access for Green Cabinets in Settings, then try again.");
    }
  };

  const summary = lengths.map((l, i) => `${l.name.trim() || `Length ${i + 1}`}: ${fmt(l.m)}`);

  return (
    <div className="min-h-screen bg-ink text-ivory">
      <Helmet>
        <title>Measure | Green Cabinets NY</title>
      </Helmet>
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-28 sm:px-6 lg:px-10">
        <p className="lux-eyebrow mb-5">Measure</p>
        <h1 className="lux-display max-w-[16ch] text-[clamp(2.6rem,6vw,5rem)]">
          A tape measure <em className="italic text-brass">in your camera.</em>
        </h1>
        <p className="lux-body mt-5 max-w-xl text-ivory/75">
          Point the ring at one end of a wall, a gap or a window, tap +, move to the other end and tap + again. Measure as many as
          you like, then send them to us.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div role="radiogroup" aria-label="Units" className="flex rounded-full border border-white/15 p-1">
            {units.map((u) => (
              <button
                key={u.key}
                type="button"
                role="radio"
                aria-checked={unit === u.key}
                onClick={() => setUnit(u.key)}
                className={`min-h-10 rounded-full px-4 font-display text-sm transition-colors duration-150 active:scale-[0.97] ${
                  unit === u.key ? "bg-ivory text-ink" : "text-ivory/75"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
          {ok === false ? (
            <p className="lux-body text-ivory/75">This device can't run the AR camera.</p>
          ) : (
            <button type="button" onClick={open} disabled={!ok} className="lux-btn disabled:opacity-50">
              <Ruler className="h-5 w-5" aria-hidden="true" /> {lengths.length ? "Measure more" : "Start measuring"}
            </button>
          )}
        </div>
        {error && <p role="alert" className="mt-4 font-display text-sm text-[#E8A598]">{error}</p>}

        {lengths.length > 0 && (
          <section className="mt-10" aria-label="Your measurements">
            <ul className="max-w-xl">
              {lengths.map((l, i) => (
                <li key={i} className="flex items-center gap-3 border-t border-white/15 py-3">
                  <input
                    value={l.name}
                    onChange={(e) => setLengths((all) => all.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                    placeholder={`Length ${i + 1} (name it: sink wall, window...)`}
                    aria-label={`Name for length ${i + 1}`}
                    maxLength={60}
                    className="min-w-0 flex-1 bg-transparent py-2 font-display text-base text-ivory outline-none placeholder:text-ivory/35"
                  />
                  <span className="shrink-0 font-lux text-2xl tabular-nums">{fmt(l.m)}</span>
                  <button
                    type="button"
                    onClick={() => setLengths((all) => all.filter((_, j) => j !== i))}
                    aria-label={`Remove length ${i + 1}`}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ivory/70 active:scale-95"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <PictureStrip pictures={photos} label="Pictures with the lengths" onRemove={(i) => setPhotos((p) => p.filter((_, j) => j !== i))} />
            </div>
            <div className="mt-8">
              <SendToOffice
                kind="measure"
                pictures={photos}
                summary={summary}
                blurb={photos.length ? "We get every length and the pictures with them." : "Take at least one picture in the camera to send these."}
              />
            </div>
          </section>
        )}
        <p className="mt-10 font-display text-xs leading-relaxed text-stone">
          Camera measurements are close, usually within an inch. We confirm every size on site before anything is built.
        </p>
      </main>
    </div>
  );
};

export default Measure;
