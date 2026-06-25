import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Per-IP rate limit
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const MAX_HTML_BYTES = 200 * 1024; // 200 KB

function ipOf(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = rateLimitMap.get(ip);
  if (!rec || now > rec.resetTime) { rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS }); return true; }
  if (rec.count >= MAX_PER_WINDOW) return false;
  rec.count++;
  return true;
}

function isEmail(s: string): boolean {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 255;
}

// Strip script/iframe/object/embed/style tags, javascript: URLs, and inline event handlers.
function sanitizeHtml(input: string): string {
  let html = String(input);
  html = html.replace(/<\/?(?:script|iframe|object|embed|style|link|meta|base|form)\b[^>]*>/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  html = html.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
  html = html.replace(/(href|src|action|formaction|background|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
  return html;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = ipOf(req);
    if (!checkRateLimit(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Require an authenticated session (anon JWT not accepted)
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Authentication required." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userEmail = userData.user.email?.toLowerCase() ?? "";

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { quoteHtml, customerEmail, subject, sendToCustomer } = body as Record<string, unknown>;

    if (typeof quoteHtml !== "string" || quoteHtml.length === 0) {
      return new Response(JSON.stringify({ error: "Quote content is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (quoteHtml.length > MAX_HTML_BYTES) {
      return new Response(JSON.stringify({ error: "Quote content too large." }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const safeHtml = sanitizeHtml(quoteHtml);

    const safeSubject = (typeof subject === "string" ? subject : "")
      .replace(/[\r\n]+/g, " ")
      .slice(0, 200) || "New Quote Request — Green Cabinets Estimator";

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const headers = {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    };

    // Always send to the business address — never accept arbitrary recipients
    const gcResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: "Green Cabinets Estimator <orders@greencabinetsny.com>",
        to: ["greencabinets@gmail.com"],
        reply_to: userEmail || undefined,
        subject: safeSubject,
        html: safeHtml,
      }),
    });

    const gcData = await gcResponse.json();
    if (!gcResponse.ok) {
      console.error("Resend API error (GC):", gcResponse.status, JSON.stringify(gcData));
      return new Response(
        JSON.stringify({ error: "Failed to send quote. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional customer copy — restricted to the authenticated user's own email
    let customerSent = false;
    if (sendToCustomer === true) {
      const requested = typeof customerEmail === "string" ? customerEmail.trim().toLowerCase() : "";
      if (!requested || !isEmail(requested) || requested !== userEmail) {
        console.warn("send-quote: blocked customer copy to non-self recipient");
      } else {
        const custResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers,
          body: JSON.stringify({
            from: "Green Cabinets Estimator <orders@greencabinetsny.com>",
            to: [requested],
            subject: `Your Quote from Green Cabinets — ${safeSubject.replace(/^Quote Request:\s*/i, "")}`.trim(),
            html: safeHtml,
          }),
        });
        if (custResponse.ok) {
          customerSent = true;
        } else {
          console.error("Customer copy failed:", custResponse.status, await custResponse.text());
        }
      }
    }

    return new Response(JSON.stringify({ success: true, id: gcData.id, customerSent }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-quote error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
