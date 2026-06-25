import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const ORDERS_EMAIL = "orders@greencabinetsny.com";
const FROM = "Green Cabinets NY <orders@greencabinetsny.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// In-memory rate limit (per cold-start instance) — 5 sends / hour / IP
const rl = new Map<string, { c: number; reset: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const r = rl.get(ip);
  if (!r || now > r.reset) {
    rl.set(ip, { c: 1, reset: now + 60 * 60 * 1000 });
    return true;
  }
  if (r.c >= 5) return false;
  r.c++;
  return true;
}

interface Pick {
  id: string;
  brand: string;
  name: string;
  codes: string[];
  thumb: string;
  detailUrl?: string;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(opts: {
  heading: string;
  intro: string;
  picks: Pick[];
  shareUrl: string;
  contact?: { name?: string | null; email: string; phone?: string | null; note?: string | null };
}): string {
  const rows = opts.picks
    .map(
      (p) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;width:80px;">
        <img src="${escape(p.thumb)}" alt="" width="72" height="72" style="display:block;border-radius:6px;object-fit:cover;" />
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:Arial,sans-serif;color:#1a1a1a;">
        <div style="font-weight:600;font-size:14px;">${escape(p.name)}</div>
        <div style="font-size:12px;color:#5C7650;font-family:monospace;margin-top:2px;">
          ${escape(p.brand)} · ${p.codes.map((c) => escape(c)).join(", ")}
        </div>
        ${p.detailUrl ? `<div style="font-size:11px;margin-top:4px;"><a href="${escape(p.detailUrl)}" style="color:#5C7650;">View product page</a></div>` : ""}
      </td>
    </tr>`
    )
    .join("");

  const contactBlock = opts.contact
    ? `
    <div style="background:#f5f5f5;padding:14px;border-radius:8px;margin:16px 0;font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;">
      <div style="font-weight:600;margin-bottom:6px;">Contact info</div>
      ${opts.contact.name ? `<div>Name: ${escape(opts.contact.name)}</div>` : ""}
      <div>Email: <a href="mailto:${escape(opts.contact.email)}">${escape(opts.contact.email)}</a></div>
      ${opts.contact.phone ? `<div>Phone: ${escape(opts.contact.phone)}</div>` : ""}
      ${opts.contact.note ? `<div style="margin-top:8px;"><strong>Note:</strong><br/>${escape(opts.contact.note).replace(/\n/g, "<br/>")}</div>` : ""}
    </div>`
    : "";

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;">
    <h1 style="color:#5C7650;font-size:22px;margin:0 0 8px;">${escape(opts.heading)}</h1>
    <p style="color:#444;font-size:14px;margin:0 0 16px;">${escape(opts.intro)}</p>
    ${contactBlock}
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
    <p style="font-size:13px;color:#444;">
      View this selection online:<br/>
      <a href="${escape(opts.shareUrl)}" style="color:#5C7650;word-break:break-all;">${escape(opts.shareUrl)}</a>
    </p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:11px;color:#999;">Green Cabinets NY · Custom Kitchens & Cabinetry · Bushwick, Brooklyn</p>
  </div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Resend error ${res.status}: ${t}`);
  }
  return res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests, please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { kind, name, email, phone, note, shareUrl, picks } = body as {
      kind: "self" | "shop";
      name?: string | null;
      email: string;
      phone?: string | null;
      note?: string | null;
      shareUrl: string;
      picks: Pick[];
    };

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Valid email required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(picks) || picks.length === 0 || picks.length > 20) {
      return new Response(JSON.stringify({ error: "Must include 1-20 picks." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!shareUrl || typeof shareUrl !== "string") {
      return new Response(JSON.stringify({ error: "Missing share URL." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (kind === "self") {
      const html = renderHtml({
        heading: "Your Green Cabinets finish picks",
        intro: `You saved ${picks.length} finish${picks.length === 1 ? "" : "es"} on greencabinetsny.com. Here's the list — bring these codes to the showroom or share with your designer.`,
        picks,
        shareUrl,
      });
      await sendEmail(email, `Your finish selection (${picks.length} picks)`, html);
    } else if (kind === "shop") {
      const html = renderHtml({
        heading: "New finish selection from a customer",
        intro: `A visitor has selected ${picks.length} finish${picks.length === 1 ? "" : "es"} and is requesting pricing & availability.`,
        picks,
        shareUrl,
        contact: { name, email, phone, note },
      });
      await sendEmail(
        ORDERS_EMAIL,
        `Finish selection request from ${name || email} (${picks.length} picks)`,
        html,
        email
      );
    } else {
      return new Response(JSON.stringify({ error: "Invalid kind." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-finish-selection error:", err);
    return new Response(JSON.stringify({ error: "Failed to send selection. Please try again or contact support." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
