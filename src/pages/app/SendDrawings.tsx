import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FileScan, ImagePlus } from "lucide-react";
import Header from "@/components/layout/Header";
import PictureStrip from "@/components/app/PictureStrip";
import SendToOffice from "@/components/app/SendToOffice";
import { docScanAvailable, scanDocuments } from "@/lib/native/tools";
import { openQuote } from "@/lib/quote";

const MAX = 10;

/** A photo from the library, scaled to at most 2000 px and saved as JPEG. */
const fileToJpeg = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 2000 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

/** App only: scan drawings, floor plans or a sketch with Apple's document scanner and send them. */
const SendDrawings = () => {
  const [ok, setOk] = useState<boolean | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pick = useRef<HTMLInputElement>(null);

  useEffect(() => {
    docScanAvailable().then(setOk);
  }, []);

  const add = (more: string[]) => setPages((p) => [...p, ...more].slice(0, MAX));

  const scan = async () => {
    setError(null);
    try {
      add(await scanDocuments());
    } catch {
      setError("The scanner couldn't start. Allow camera access for Green Cabinets in Settings, then try again.");
    }
  };

  const fromLibrary = async (files: FileList | null) => {
    if (!files) return;
    try {
      add(await Promise.all([...files].slice(0, MAX).map(fileToJpeg)));
    } catch {
      setError("One of those pictures couldn't be read. Try another.");
    }
  };

  return (
    <div className="min-h-screen bg-ink text-ivory">
      <Helmet>
        <title>Send Drawings | Green Cabinets NY</title>
      </Helmet>
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-28 sm:px-6 lg:px-10">
        <p className="lux-eyebrow mb-5">Quote</p>
        <h1 className="lux-display max-w-[16ch] text-[clamp(2.6rem,6vw,5rem)]">
          Have drawings? <em className="italic text-brass">Scan them in.</em>
        </h1>
        <p className="lux-body mt-5 max-w-xl text-ivory/75">
          Architect's plans, a floor plan from the building, or a sketch on paper. The scanner finds the page, straightens it and
          cleans it up. Up to {MAX} pages.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {ok !== false && (
            <button type="button" onClick={scan} disabled={!ok || pages.length >= MAX} className="lux-btn disabled:opacity-50">
              <FileScan className="h-5 w-5" aria-hidden="true" /> {pages.length ? "Scan more pages" : "Scan a drawing"}
            </button>
          )}
          <button type="button" onClick={() => pick.current?.click()} disabled={pages.length >= MAX} className="lux-btn-ghost disabled:opacity-50">
            <ImagePlus className="h-5 w-5" aria-hidden="true" /> Add from photos
          </button>
          <input
            ref={pick}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              fromLibrary(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        {error && <p role="alert" className="mt-4 font-display text-sm text-[#E8A598]">{error}</p>}

        {pages.length > 0 && (
          <section className="mt-10" aria-label="Your pages">
            <PictureStrip pictures={pages} label="Scanned pages" onRemove={(i) => setPages((p) => p.filter((_, j) => j !== i))} />
            <div className="mt-8">
              <SendToOffice
                kind="drawings"
                pictures={pages}
                blurb={`We price from your ${pages.length === 1 ? "page" : `${pages.length} pages`} and reply within 24 hours.`}
              />
            </div>
          </section>
        )}

        <div className="mt-12 border-t border-white/15 pt-8">
          <h2 className="lux-display text-[1.8rem]">No drawings yet?</h2>
          <p className="lux-body mt-2 max-w-xl text-ivory/70">Tell us about the room and we'll take it from there.</p>
          <button type="button" onClick={openQuote} className="lux-btn-ghost mt-5">
            Request a quote
          </button>
        </div>
      </main>
    </div>
  );
};

export default SendDrawings;
