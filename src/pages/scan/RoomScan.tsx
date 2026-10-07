import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ScanLine } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RoomViewer, { type RoomViewerHandle } from "@/components/scan/RoomViewer";
import { openQuote } from "@/lib/quote";
import { useSpamGuard } from "@/lib/spamGuard";
import { supabase } from "@/integrations/supabase/client";
import { SAMPLE_ROOM, isApp, scanAvailable, scanRoom, summarize, type ScannedRoom } from "@/lib/scan/roomScan";
import { NOTICE_LONG, brandSnapshot, newScanId } from "@/lib/scan/watermark";

type Stage = "intro" | "room" | "sent";

interface Current {
  room: ScannedRoom;
  scanId: string;
  sample: boolean;
}

const STORE = "gc_last_scan";
const CONTACT = "gc_scan_contact";

const read = <T,>(k: string): T | null => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* private mode: the scan just isn't remembered */
  }
};

const STEPS = [
  { k: "Walk the room", v: "About two minutes. Point your iPhone at the walls, corners and floor while it draws the room." },
  { k: "See it in 3D", v: "Every wall, door, window and cabinet, measured, in feet and inches." },
  { k: "Send it to us", v: "We plan your cabinets from the real room and reply within 24 hours." },
];

const today = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const RoomScan = () => {
  const [stage, setStage] = useState<Stage>("intro");
  const [cur, setCur] = useState<Current | null>(null);
  const [lidar, setLidar] = useState<{ ok: boolean; multi: boolean } | null>(null);
  const [several, setSeveral] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(() => read<{ name: string; email: string; phone: string }>(CONTACT) ?? { name: "", email: "", phone: "" });
  const [note, setNote] = useState("");
  const viewer = useRef<RoomViewerHandle>(null);
  const { getGuard, honeypotProps } = useSpamGuard();
  const app = isApp();

  useLayoutEffect(() => {
    document.documentElement.classList.add("theme-lux");
  }, []);

  useEffect(() => {
    scanAvailable().then(setLidar);
    // /scan?sample=1 opens the sample directly (links from the site, App Review)
    if (new URLSearchParams(window.location.search).get("sample") === "1") {
      setCur({ room: SAMPLE_ROOM, scanId: "GC-SAMPLE", sample: true });
      setStage("room");
      return;
    }
    const last = read<Current>(STORE);
    if (last && !last.sample) {
      setCur(last);
      setStage("room");
    }
  }, []);

  const startScan = async () => {
    setError(null);
    const room = await scanRoom(several);
    if (!room || !room.walls?.length) {
      setError(room ? "The scan didn't find any walls. Try again with more light, moving slowly." : null);
      return;
    }
    const next = { room, scanId: newScanId(), sample: false };
    setCur(next);
    write(STORE, next);
    setStage("room");
    window.scrollTo(0, 0);
  };

  const showSample = () => {
    setCur({ room: SAMPLE_ROOM, scanId: "GC-SAMPLE", sample: true });
    setStage("room");
    window.scrollTo(0, 0);
  };

  const brandedPicture = async (): Promise<HTMLCanvasElement | null> => {
    const shot = viewer.current?.snapshot();
    if (!shot || !cur) return null;
    return brandSnapshot(shot, {
      scanId: cur.scanId === "GC-SAMPLE" ? "SAMPLE" : cur.scanId,
      date: today(),
      client: form.name || undefined,
      sample: cur.sample,
    });
  };

  const saveCopy = async () => {
    const pic = await brandedPicture();
    if (!pic || !cur) return;
    const dataUrl = pic.toDataURL("image/jpeg", 0.9);
    const name = `Green-Cabinets-${cur.scanId}.jpg`;
    if (app) {
      const [{ Filesystem, Directory }, { Share }] = await Promise.all([
        import("@capacitor/filesystem"),
        import("@capacitor/share"),
      ]);
      const file = await Filesystem.writeFile({ path: name, data: dataUrl.split(",")[1], directory: Directory.Cache });
      await Share.share({ title: "Room scan, Green Cabinets NY", files: [file.uri] }).catch(() => undefined);
    } else {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = name;
      a.click();
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cur || cur.sample) return;
    setBusy(true);
    setError(null);
    write(CONTACT, form);
    try {
      const pic = await brandedPicture();
      if (!pic) throw new Error("no picture");
      // Keep the email small: at most 1600 px wide
      let out = pic;
      if (pic.width > 1600) {
        out = document.createElement("canvas");
        out.width = 1600;
        out.height = Math.round((pic.height / pic.width) * 1600);
        out.getContext("2d")!.drawImage(pic, 0, 0, out.width, out.height);
      }
      const { error: err } = await supabase.functions.invoke("send-room-scan", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          note: note.trim() || undefined,
          scanId: cur.scanId,
          summary: summarize(cur.room).lines,
          room: JSON.stringify(cur.room),
          image: out.toDataURL("image/jpeg", 0.85).split(",")[1],
          spamGuard: getGuard(),
        },
      });
      if (err) throw err;
      setStage("sent");
      window.scrollTo(0, 0);
    } catch {
      // Never a dead end: hand the measurements to the phone's email app,
      // addressed to us, so the client can still send them in one tap.
      const body = [
        `Room scan ${cur.scanId}`,
        `${form.name}${form.phone ? ` · ${form.phone}` : ""} · ${form.email}`,
        ...(note.trim() ? ["", note.trim()] : []),
        "",
        ...summarize(cur.room).lines,
      ].join("\n");
      window.location.href =
        "mailto:orders@greencabinetsny.com?subject=" +
        encodeURIComponent(`Room scan ${cur.scanId} from ${form.name}`) +
        "&body=" +
        encodeURIComponent(body);
      setError("We opened your email app with the measurements. Tap Save a copy to attach the picture too.");
    } finally {
      setBusy(false);
    }
  };

  const summary = cur ? summarize(cur.room) : null;

  return (
    <div className="min-h-screen bg-ink text-ivory">
      <Helmet>
        <title>Scan Your Room | Green Cabinets NY</title>
        <meta
          name="description"
          content="Scan your kitchen with the Green Cabinets iPhone app and send us the measured room. We plan your custom cabinets from the real walls, in Brooklyn, Manhattan and Queens."
        />
        <link rel="canonical" href="https://greencabinetsny.com/scan" />
      </Helmet>
      <Header />

      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-28 sm:px-6 md:pt-36 lg:px-10">
        {stage === "intro" && (
          <section aria-labelledby="scan-title">
            <p className="lux-eyebrow lux-fade mb-5">Room scan</p>
            <h1 id="scan-title" className="lux-display max-w-[16ch] text-[clamp(2.6rem,6vw,5.25rem)]">
              Scan your room. <em className="italic text-brass">We take it from there.</em>
            </h1>

            <ol className="mt-12 grid grid-cols-1 gap-x-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.k} className="border-t border-white/15 py-6">
                  <p className="font-display text-xs uppercase tracking-[0.18em] text-brass">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="lux-display mt-3 text-[1.9rem]">{s.k}</h2>
                  <p className="lux-body mt-2 text-ivory/70">{s.v}</p>
                </li>
              ))}
            </ol>

            {lidar?.ok ? (
              <div className="mt-10 max-w-xl">
                <label className="flex items-start gap-3 border-t border-white/15 py-5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#C6A15B]"
                  />
                  <span className="lux-body text-sm text-ivory/80">
                    This scan is for my project with Green Cabinets NY. I won't share it with other cabinet
                    companies, contractors or designers.
                  </span>
                </label>
                {lidar.multi && (
                  <label className="flex items-center gap-3 pb-5">
                    <input
                      type="checkbox"
                      checked={several}
                      onChange={(e) => setSeveral(e.target.checked)}
                      className="h-5 w-5 accent-[#C6A15B]"
                    />
                    <span className="font-display text-sm text-ivory/80">Several rooms in one walk</span>
                  </label>
                )}
                <button type="button" disabled={!agreed} onClick={startScan} className="lux-btn w-full sm:w-auto disabled:opacity-40">
                  <ScanLine className="h-5 w-5" aria-hidden="true" /> Start the scan
                </button>
                {error && <p role="alert" className="mt-4 font-display text-sm text-[#E8A598]">{error}</p>}
              </div>
            ) : (
              <div className="mt-10 max-w-2xl border-t border-white/15 pt-8">
                <p className="lux-body text-ivory/80">
                  {app && lidar
                    ? "This device has no LiDAR scanner. Room scan needs an iPhone Pro (12 Pro or newer) or an iPad Pro."
                    : "Room scanning works in the Green Cabinets iPhone app, on iPhone Pro and iPad Pro models with LiDAR. The app is coming to the App Store soon."}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button type="button" onClick={showSample} className="lux-btn">
                    See a sample scan
                  </button>
                  <Link to="/estimator" className="lux-btn-ghost">
                    Upload your drawings instead
                  </Link>
                  <button type="button" onClick={openQuote} className="lux-btn-ghost">
                    Request a quote
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {stage === "room" && cur && summary && (
          <section aria-labelledby="room-title">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="lux-eyebrow mb-4">{cur.sample ? "Sample scan" : `Your scan · ${cur.scanId}`}</p>
                <h1 id="room-title" className="lux-display text-[clamp(2.3rem,5vw,4rem)]">
                  {cur.sample ? "This is what we receive." : "Your room, measured."}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!cur.sample) write(STORE, null);
                  setCur(null);
                  setStage("intro");
                }}
                className="lux-link self-start font-display text-sm md:self-auto"
              >
                {cur.sample ? "Back" : "Scan again"}
              </button>
            </div>

            <RoomViewer ref={viewer} room={cur.room} sample={cur.sample} />

            <dl className="mt-8 grid grid-cols-2 gap-x-6 md:grid-cols-4">
              {[
                ["Floor area", summary.area],
                ["Ceiling", summary.ceiling],
                ["Wall length", summary.wallRun],
                ["Doors · windows", `${summary.doors} · ${summary.windows}`],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-white/15 py-4">
                  <dt className="font-display text-xs uppercase tracking-[0.16em] text-stone">{k}</dt>
                  <dd className="mt-1 font-lux text-[1.75rem] leading-tight text-ivory">{v}</dd>
                </div>
              ))}
            </dl>

            {cur.sample ? (
              <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-8 sm:flex-row">
                <button type="button" onClick={openQuote} className="lux-btn">
                  Request a quote
                </button>
                <button type="button" onClick={saveCopy} className="lux-btn-ghost">
                  Save the sample picture
                </button>
              </div>
            ) : (
              <form onSubmit={send} className="mt-10 grid grid-cols-1 gap-8 border-t border-white/15 pt-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <h2 className="lux-display text-[2rem]">Send it to Green Cabinets</h2>
                  <p className="lux-body mt-3 text-sm text-ivory/70">
                    We get the 3D room and every measurement, then reply within 24 hours.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
                  <input {...honeypotProps} />
                  {(
                    [
                      ["name", "Your name", "text", "name", true],
                      ["email", "Email", "email", "email", true],
                      ["phone", "Phone (optional)", "tel", "tel", false],
                    ] as const
                  ).map(([key, label, type, auto, req]) => (
                    <label key={key} className={key === "name" ? "sm:col-span-2" : ""}>
                      <span className="font-display text-xs uppercase tracking-[0.16em] text-stone">{label}</span>
                      <input
                        type={type}
                        autoComplete={auto}
                        required={req}
                        minLength={key === "name" ? 2 : undefined}
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="mt-2 block w-full rounded-none border-0 border-b border-white/25 bg-transparent px-0 py-2 font-display text-base text-ivory outline-none focus:border-brass"
                      />
                    </label>
                  ))}
                  <label className="sm:col-span-2">
                    <span className="font-display text-xs uppercase tracking-[0.16em] text-stone">About the project (optional)</span>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Kitchen, vanity or closets? Style, timing, building rules..."
                      className="mt-2 block w-full resize-none rounded-none border-0 border-b border-white/25 bg-transparent px-0 py-2 font-display text-base text-ivory outline-none placeholder:text-ivory/30 focus:border-brass"
                    />
                  </label>
                  <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
                    <button type="submit" disabled={busy} className="lux-btn disabled:opacity-60">
                      {busy ? "Sending…" : "Send to Green Cabinets"} {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                    </button>
                    <button type="button" onClick={saveCopy} className="lux-btn-ghost">
                      Save a copy
                    </button>
                  </div>
                  {error && (
                    <p role="alert" className="font-display text-sm text-[#E8A598] sm:col-span-2">
                      {error}
                    </p>
                  )}
                  <p className="font-display text-xs leading-relaxed text-stone sm:col-span-2">{NOTICE_LONG}</p>
                </div>
              </form>
            )}
          </section>
        )}

        {stage === "sent" && cur && (
          <section aria-labelledby="sent-title" className="max-w-2xl">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brass text-ink">
              <Check className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 id="sent-title" className="lux-display mt-6 text-[clamp(2.4rem,5vw,4rem)]">
              Scan {cur.scanId} is with us.
            </h1>
            <p className="lux-body mt-4 text-lg text-ivory/75">
              We'll study your room and get back to you within 24 hours to book the in-home consultation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/" className="lux-btn">
                Back to Green Cabinets
              </Link>
              <button type="button" onClick={() => setStage("room")} className="lux-btn-ghost">
                View the scan
              </button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RoomScan;
