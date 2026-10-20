import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSpamGuard } from "@/lib/spamGuard";
import { newScanId } from "@/lib/scan/watermark";

export type SendKind = "ar" | "measure" | "drawings";

interface Props {
  kind: SendKind;
  /** Data URLs (JPEG), at most 10 */
  pictures: string[];
  /** Plain lines for the email, like lengths */
  summary?: string[];
  title?: string;
  blurb?: string;
}

const FILE = { ar: "AR cabinets", measure: "Measurement", drawings: "Drawing page" } as const;

// The details people typed last time, so they don't type them twice
const KEY = "gc_contact";
const remembered = () => {
  try {
    return { name: "", email: "", phone: "", ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { name: "", email: "", phone: "" };
  }
};

/** Name, email, a note, and one button: the pictures go to orders@ with the details. */
const SendToOffice = ({ kind, pictures, summary = [], title = "Send it to Green Cabinets", blurb }: Props) => {
  const { getGuard, honeypotProps } = useSpamGuard();
  const [form, setForm] = useState(remembered);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pictures.length) return;
    setBusy(true);
    setError(null);
    const id = newScanId();
    try {
      try {
        localStorage.setItem(KEY, JSON.stringify(form));
      } catch {
        /* private mode */
      }
      const { error: err } = await supabase.functions.invoke("send-room-scan", {
        body: {
          kind,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          note: note.trim() || undefined,
          scanId: id,
          summary,
          images: pictures.slice(0, 10).map((p, i) => ({ name: `${FILE[kind]} ${i + 1} ${id}.jpg`, data: p.split(",")[1] })),
          spamGuard: getGuard(),
        },
      });
      if (err) throw err;
      setSent(id);
    } catch {
      setError("That didn't go through. Check your connection and try again, or text us the pictures.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="border-t border-white/15 pt-8" role="status">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brass text-ink">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="lux-display mt-5 text-[2rem]">It's with us.</h2>
        <p className="lux-body mt-2 text-ivory/70">Reference {sent}. We reply within 24 hours, by email or text.</p>
      </div>
    );
  }

  const field = "mt-2 block w-full rounded-none border-0 border-b border-white/25 bg-transparent px-0 py-2 font-display text-base text-ivory outline-none focus:border-brass";
  return (
    <form onSubmit={send} className="grid grid-cols-1 gap-6 border-t border-white/15 pt-8">
      <div>
        <h2 className="lux-display text-[2rem]">{title}</h2>
        {blurb && <p className="lux-body mt-2 text-sm text-ivory/70">{blurb}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              className={field}
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
            className={`${field} resize-none placeholder:text-ivory/30`}
          />
        </label>
      </div>
      <button type="submit" disabled={busy || !pictures.length} className="lux-btn self-start disabled:opacity-50">
        {busy ? "Sending…" : "Send to Green Cabinets"} {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
      {error && (
        <p role="alert" className="font-display text-sm text-[#E8A598]">
          {error}
        </p>
      )}
    </form>
  );
};

export default SendToOffice;
