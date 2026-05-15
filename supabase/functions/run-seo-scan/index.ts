// Runs Google PageSpeed Insights against the live site (mobile + desktop) and stores results.
// Admin-only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

async function runPsi(url: string, strategy: "mobile" | "desktop") {
  const params = new URLSearchParams({ url, strategy });
  CATEGORIES.forEach((c) => params.append("category", c));
  const apiKey = Deno.env.get("PAGESPEED_API_KEY");
  if (apiKey) params.set("key", apiKey);

  const res = await fetch(`${PSI_ENDPOINT}?${params.toString()}`);
  if (!res.ok) throw new Error(`PSI ${strategy} failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const lh = data.lighthouseResult ?? {};
  const cats = lh.categories ?? {};
  const audits = lh.audits ?? {};

  const failing = Object.values(audits)
    .filter((a: any) => a && typeof a.score === "number" && a.score < 0.9 && a.title)
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      score: a.score,
      displayValue: a.displayValue ?? null,
      description: a.description ?? null,
    }))
    .slice(0, 50);

  return {
    performance_score: cats.performance?.score != null ? cats.performance.score * 100 : null,
    accessibility_score: cats.accessibility?.score != null ? cats.accessibility.score * 100 : null,
    best_practices_score: cats["best-practices"]?.score != null ? cats["best-practices"].score * 100 : null,
    seo_score: cats.seo?.score != null ? cats.seo.score * 100 : null,
    lcp_ms: audits["largest-contentful-paint"]?.numericValue ?? null,
    cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
    inp_ms: audits["interaction-to-next-paint"]?.numericValue ?? null,
    fcp_ms: audits["first-contentful-paint"]?.numericValue ?? null,
    tbt_ms: audits["total-blocking-time"]?.numericValue ?? null,
    failing_audits: failing,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const url: string = body.url || "https://greencabinetsny.com/";

    const results = [];
    for (const strategy of ["mobile", "desktop"] as const) {
      try {
        const r = await runPsi(url, strategy);
        const { data: inserted, error } = await admin
          .from("seo_scans")
          .insert({ url, strategy, ...r, triggered_by: userData.user.id })
          .select()
          .single();
        if (error) throw error;
        results.push(inserted);
      } catch (e) {
        const msg = (e as Error).message;
        await admin.from("seo_scans").insert({
          url,
          strategy,
          error: msg,
          triggered_by: userData.user.id,
        });
        results.push({ strategy, error: msg });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
