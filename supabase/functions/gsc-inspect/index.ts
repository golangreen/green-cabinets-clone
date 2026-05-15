// GSC URL Inspection via Lovable connector gateway.
// No OAuth setup required — uses the linked Google Search Console connector.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const DEFAULT_SITE = "sc-domain:greencabinetsny.com";
const DEFAULT_URLS = ["https://greencabinetsny.com/designer"];

interface InspectBody {
  siteUrl?: string;
  urls?: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GSC_KEY = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);
  if (!GSC_KEY) return json({ error: "GOOGLE_SEARCH_CONSOLE_API_KEY not configured (link the connector)" }, 500);

  let body: InspectBody = {};
  if (req.method === "POST") {
    try { body = await req.json(); } catch { /* allow empty body */ }
  }

  const siteUrl = (body.siteUrl ?? DEFAULT_SITE).trim();
  const urls = (body.urls?.length ? body.urls : DEFAULT_URLS).slice(0, 50);

  const results = await Promise.all(urls.map(async (url) => {
    try {
      const res = await fetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": GSC_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inspectionUrl: url, siteUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { url, ok: false, status: res.status, error: data };
      const r = data?.inspectionResult ?? {};
      const idx = r.indexStatusResult ?? {};
      return {
        url,
        ok: true,
        verdict: idx.verdict,
        coverageState: idx.coverageState,
        indexingState: idx.indexingState,
        lastCrawlTime: idx.lastCrawlTime,
        googleCanonical: idx.googleCanonical,
        userCanonical: idx.userCanonical,
        pageFetchState: idx.pageFetchState,
        robotsTxtState: idx.robotsTxtState,
        inspectionResultLink: r.inspectionResultLink,
      };
    } catch (e) {
      return { url, ok: false, error: String(e) };
    }
  }));

  return json({ siteUrl, results });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
