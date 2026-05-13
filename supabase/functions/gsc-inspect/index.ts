// Proxies Google Search Console URL Inspection API to bypass CORS.
// Caller passes their own OAuth access token; we never store it.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface Body {
  token: string;
  siteUrl: string;
  urls: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { token, siteUrl, urls } = (await req.json()) as Body;

    if (!token || !siteUrl || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'token, siteUrl, and urls[] are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    if (urls.length > 50) {
      return new Response(JSON.stringify({ error: 'Max 50 URLs per request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = await Promise.all(
      urls.map(async (inspectionUrl) => {
        try {
          const res = await fetch(
            'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ inspectionUrl, siteUrl, languageCode: 'en-US' }),
            },
          );
          const json = await res.json();
          if (!res.ok) {
            return { url: inspectionUrl, ok: false, status: res.status, error: json };
          }
          const r = json?.inspectionResult ?? {};
          const idx = r.indexStatusResult ?? {};
          return {
            url: inspectionUrl,
            ok: true,
            verdict: idx.verdict,                       // PASS | PARTIAL | FAIL | NEUTRAL
            coverageState: idx.coverageState,           // e.g. "Submitted and indexed"
            indexingState: idx.indexingState,
            lastCrawlTime: idx.lastCrawlTime,
            googleCanonical: idx.googleCanonical,
            userCanonical: idx.userCanonical,
            pageFetchState: idx.pageFetchState,
            robotsTxtState: idx.robotsTxtState,
            sitemap: idx.sitemap,
            referringUrls: idx.referringUrls,
            inspectionResultLink: r.inspectionResultLink,
          };
        } catch (e) {
          return { url: inspectionUrl, ok: false, error: String(e) };
        }
      }),
    );

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
