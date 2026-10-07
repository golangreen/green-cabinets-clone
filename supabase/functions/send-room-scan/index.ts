// Receives a room scan from the Green Cabinets app and emails it to
// orders@greencabinetsny.com: the client's details, the measurements in feet,
// the branded (watermarked) picture and the raw scan file as attachments.
// Same email path and spam rules as send-contact-form. The app runs in a
// webview (capacitor://), where reCAPTCHA's domain check can't pass, so this
// uses the keyless honeypot + dwell guard and a per-IP rate limit.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (s: unknown): string =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const MIN_DWELL_MS = 3000;
const MAX_IMAGE_CHARS = 4_000_000; // ~3 MB JPEG as base64
const MAX_ROOM_CHARS = 400_000;

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional(),
  note: z.string().trim().max(1000).optional(),
  scanId: z.string().regex(/^GC-[A-Z0-9]{6}$/),
  summary: z.array(z.string().max(600)).max(20),
  room: z.string().max(MAX_ROOM_CHARS),
  image: z.string().max(MAX_IMAGE_CHARS).regex(/^[A-Za-z0-9+/=]+$/),
  spamGuard: z.object({ hp: z.string().max(200), elapsedMs: z.number() }),
});

const rate = new Map<string, { n: number; reset: number }>();
const allow = (ip: string) => {
  const now = Date.now();
  const r = rate.get(ip);
  if (!r || now > r.reset) {
    rate.set(ip, { n: 1, reset: now + 60 * 60 * 1000 });
    return true;
  }
  if (r.n >= 5) return false;
  r.n++;
  return true;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(ip)) return json({ error: "Too many scans sent. Please try again later." }, 429);

  try {
    if (!RESEND_API_KEY || !LOVABLE_API_KEY) return json({ error: "Email not configured" }, 500);

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Please check your details and try again." }, 400);
    const d = parsed.data;

    if (d.spamGuard.hp.trim() !== "" || d.spamGuard.elapsedMs < MIN_DWELL_MS) {
      return json({ error: "Spam verification failed. Please try again." }, 400);
    }
    try {
      JSON.parse(d.room);
    } catch {
      return json({ error: "The scan file is damaged. Please scan again." }, 400);
    }

    const roomB64 = btoa(unescape(encodeURIComponent(d.room)));
    const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Green Cabinets App <orders@greencabinetsny.com>",
        to: ["orders@greencabinetsny.com"],
        reply_to: d.email,
        subject: `Room scan ${d.scanId} from ${escapeHtml(d.name)}`,
        html: `
          <h2>New room scan from the Green Cabinets app</h2>
          <p><strong>Scan:</strong> ${escapeHtml(d.scanId)}</p>
          <h3>Client</h3>
          <p><strong>Name:</strong> ${escapeHtml(d.name)}<br>
          <strong>Email:</strong> ${escapeHtml(d.email)}<br>
          ${d.phone ? `<strong>Phone:</strong> ${escapeHtml(d.phone)}<br>` : ""}</p>
          ${d.note ? `<h3>About the project</h3><p>${escapeHtml(d.note).replace(/\n/g, "<br>")}</p>` : ""}
          <h3>Measurements</h3>
          <ul>${d.summary.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>
          <p style="color:#666">Attached: the branded picture of the room, and the scan file (${escapeHtml(d.scanId)}.json)
          for the measurements. Reply to this email to reach the client.</p>
        `,
        attachments: [
          { filename: `${d.scanId}.jpg`, content: d.image },
          { filename: `${d.scanId}.json`, content: roomB64 },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Email failed: ${await res.text()}`);
    return json({ success: true });
  } catch (e) {
    console.error("send-room-scan", e);
    return json({ error: "Couldn't send the scan. Please try again." }, 500);
  }
});
