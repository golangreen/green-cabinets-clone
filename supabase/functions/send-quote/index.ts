import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 255;
}

function sanitizeHeader(s: string): string {
  return s.replace(/[\r\n]+/g, " ").slice(0, 200);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      console.error("Missing email credentials");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const form = await req.formData();
    const name = sanitizeHeader(String(form.get("name") ?? "")).trim();
    const emailRaw = String(form.get("email") ?? "").trim();
    const subject =
      sanitizeHeader(String(form.get("_subject") ?? "")).trim() ||
      "New Quote from Green Cabinets";
    const quote = String(form.get("quote") ?? "");
    const image = form.get("design_image");

    const email = emailRaw && isEmail(emailRaw) ? emailRaw : "";

    const attachments: Array<{ filename: string; content: string }> = [];
    if (image instanceof File && image.size > 0) {
      const buf = new Uint8Array(await image.arrayBuffer());
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < buf.length; i += chunk) {
        binary += String.fromCharCode.apply(
          null,
          Array.from(buf.subarray(i, i + chunk)),
        );
      }
      attachments.push({
        filename: "green-cabinets-design.png",
        content: btoa(binary),
      });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;color:#222;line-height:1.5">
        ${name ? `<p><strong>From:</strong> ${escapeHtml(name)}</p>` : ""}
        ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
        <h3>Quote</h3>
        <pre style="white-space:pre-wrap;font-family:inherit;background:#f6f6f6;padding:12px;border-radius:6px">${escapeHtml(quote)}</pre>
      </div>
    `;

    const payload: Record<string, unknown> = {
      from: "Green Cabinets <quotes@greencabinetsny.com>",
      to: ["orders@greencabinetsny.com"],
      subject,
      html,
    };
    if (email) {
      payload.cc = [email];
      payload.reply_to = email;
    }
    if (attachments.length) payload.attachments = attachments;

    const resp = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Resend error:", resp.status, text);
      return new Response(JSON.stringify({ error: "Failed to send" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-quote error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
