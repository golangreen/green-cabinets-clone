import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Box } from "lucide-react";
import Header from "@/components/layout/Header";
import PictureStrip from "@/components/app/PictureStrip";
import SendToOffice from "@/components/app/SendToOffice";
import { AR_FINISHES, arAvailable, openArCabinets } from "@/lib/native/tools";

const STEPS = [
  { k: "Find the floor", v: "Move the phone slowly over the floor until the camera settles." },
  { k: "Place cabinets", v: "Tap the floor for a cabinet. Drag it, turn it with two fingers, and Add next lines up a run." },
  { k: "Try finishes", v: "Switch every door to oak, walnut or a painted color, and take pictures as you go." },
];

/** App only: real-size Green Cabinets cabinets in the client's own room, through the camera. */
const ArCabinets = () => {
  const [ok, setOk] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    arAvailable().then(setOk);
  }, []);

  const open = async () => {
    setError(null);
    try {
      const shots = await openArCabinets();
      setPhotos((p) => [...p, ...shots].slice(-10));
    } catch {
      setError("The camera couldn't start. Allow camera access for Green Cabinets in Settings, then try again.");
    }
  };

  return (
    <div className="min-h-screen bg-ink text-ivory">
      <Helmet>
        <title>Cabinets in Your Room | Green Cabinets NY</title>
      </Helmet>
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-28 sm:px-6 lg:px-10">
        <p className="lux-eyebrow mb-5">See it in your room</p>
        <h1 className="lux-display max-w-[16ch] text-[clamp(2.6rem,6vw,5rem)]">
          Your kitchen, <em className="italic text-brass">before it's built.</em>
        </h1>
        <p className="lux-body mt-5 max-w-xl text-ivory/75">
          Stand in your room and place real-size cabinets with the camera. Base, drawer, wall and pantry cabinets, in{" "}
          {AR_FINISHES.length} finishes.
        </p>

        <div className="mt-8">
          {ok === false ? (
            <p className="lux-body text-ivory/75">This device can't run the AR camera.</p>
          ) : (
            <button type="button" onClick={open} disabled={!ok} className="lux-btn disabled:opacity-50">
              <Box className="h-5 w-5" aria-hidden="true" /> {photos.length ? "Open the camera again" : "Open the camera"}
            </button>
          )}
          {error && <p role="alert" className="mt-4 font-display text-sm text-[#E8A598]">{error}</p>}
        </div>
        <ol className="mt-10 grid grid-cols-1 gap-x-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.k} className="border-t border-white/15 py-5">
              <p className="font-display text-xs uppercase tracking-[0.18em] text-brass">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="lux-display mt-2 text-[1.7rem]">{s.k}</h2>
              <p className="lux-body mt-1 text-ivory/70">{s.v}</p>
            </li>
          ))}
        </ol>


        {photos.length > 0 && (
          <section className="mt-10" aria-label="Your pictures">
            <PictureStrip pictures={photos} label="Your AR pictures" onRemove={(i) => setPhotos((p) => p.filter((_, j) => j !== i))} />
            <div className="mt-8">
              <SendToOffice
                kind="ar"
                pictures={photos}
                blurb="We see the cabinets and finishes you tried in your room, and come back with a design and a price."
              />
            </div>
          </section>
        )}
        <p className="mt-10 font-display text-xs leading-relaxed text-stone">
          The cabinets in the camera are standard sizes to help you picture the room. Your real cabinets are drawn to your
          measurements.
        </p>
      </main>
    </div>
  );
};

export default ArCabinets;
