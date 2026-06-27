import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const BUSINESS_EMAIL = "orders@greencabinetsny.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory IP throttle (per edge instance)
const RATE = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = RATE.get(ip);
  if (!rec || now > rec.resetAt) {
    RATE.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (rec.count >= MAX_PER_WINDOW) return true;
  rec.count++;
  return false;
}

// Strip scripts, iframes, on* handlers, javascript: URLs.
function sanitizeHtml(input: string): string {
  let s = String(input).slice(0, 200_000);
  s = s.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
  s = s.replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*"(?:[^"\\]|\\.)*"/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*'(?:[^'\\]|\\.)*'/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
  s = s.replace(/(href|src|action|formaction)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "$1=$2#$2");
  return s;
}

function sanitizeHeader(s: unknown): string {
  return String(s ?? "").replace(/[\r\n]+/g, " ").slice(0, 200);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ---- AuthN: require a logged-in user ----
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";
    if (!jwt) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Rate limit ----
    const ip = getIp(req);
    if (rateLimited(ip)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      console.error("Missing email credentials");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { quoteHtml, customerEmail, subject, sendToCustomer } = body as Record<string, unknown>;

    if (!quoteHtml || typeof quoteHtml !== "string") {
      return new Response(JSON.stringify({ error: "Quote HTML content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeHtml = sanitizeHtml(quoteHtml);
    const safeSubject = sanitizeHeader(subject) || "New Quote Request — Green Cabinets Estimator";

    // Validate customer email if provided
    let safeCustomerEmail = "";
    if (typeof customerEmail === "string" && customerEmail.trim()) {
      const v = customerEmail.trim().slice(0, 255);
      if (!EMAIL_RE.test(v)) {
        return new Response(JSON.stringify({ error: "Invalid customer email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      safeCustomerEmail = v;
    }

    const gatewayHeaders = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
      "Content-Type": "application/json",
    };

    // Always send to Green Cabinets
    const gcResponse = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: gatewayHeaders,
      body: JSON.stringify({
        from: `Green Cabinets Estimator <${BUSINESS_EMAIL}>`,
        to: [BUSINESS_EMAIL],
        reply_to: safeCustomerEmail || undefined,
        subject: safeSubject,
        html: safeHtml,
      }),
    });
    const gcData = await gcResponse.json().catch(() => ({}));
    if (!gcResponse.ok) {
      console.error("Resend gateway error (GC):", gcResponse.status, JSON.stringify(gcData));
      return new Response(JSON.stringify({ error: "Failed to send quote" }), {
        status: gcResponse.status || 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let customerSent = false;
    if (sendToCustomer === true && safeCustomerEmail) {
      const custResponse = await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: gatewayHeaders,
        body: JSON.stringify({
          from: `Green Cabinets Estimator <${BUSINESS_EMAIL}>`,
          to: [safeCustomerEmail],
          subject: `Your Quote from Green Cabinets — ${safeSubject.replace(/^Quote Request:\s*/i, "")}`.trim(),
          html: safeHtml,
        }),
      });
      const custData = await custResponse.json().catch(() => ({}));
      if (custResponse.ok) {
        customerSent = true;
        console.log("Customer copy sent:", custData.id);
      } else {
        console.error("Customer copy failed:", custResponse.status, JSON.stringify(custData));
      }
    }

    console.log("Email sent:", gcData.id);
    return new Response(JSON.stringify({ success: true, id: gcData.id, customerSent }), {
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
