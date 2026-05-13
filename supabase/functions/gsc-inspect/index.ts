// GSC URL Inspection proxy.
// Defaults to inspecting https://greencabinetsny.com/designer so it can be
// invoked from chat with no body. Auth precedence:
//   1. `token` field in the body (one-shot, e.g. OAuth Playground access token)
//   2. Stored refresh token (GSC_OAUTH_REFRESH_TOKEN + GSC_OAUTH_CLIENT_ID +
//      GSC_OAUTH_CLIENT_SECRET) -> exchanged for a short-lived access token.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const DEFAULT_SITE = 'https://greencabinetsny.com/';
const DEFAULT_URLS = ['https://greencabinetsny.com/designer'];

interface Body {
  token?: string;
  siteUrl?: string;
  urls?: string[];
}

async function getAccessTokenFromRefresh(): Promise<string | null> {
  const refresh = Deno.env.get('GSC_OAUTH_REFRESH_TOKEN');
  const clientId = Deno.env.get('GSC_OAUTH_CLIENT_ID');
  const clientSecret = Deno.env.get('GSC_OAUTH_CLIENT_SECRET');
  if (!refresh || !clientId || !clientSecret) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refresh,
      grant_type: 'refresh_token',
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Refresh token exchange failed [${res.status}]: ${JSON.stringify(json)}`);
  }
  return json.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    let body: Body = {};
    if (req.method !== 'GET') {
      try { body = (await req.json()) as Body; } catch { body = {}; }
    }

    const siteUrl = body.siteUrl ?? DEFAULT_SITE;
    const urls = body.urls && body.urls.length > 0 ? body.urls : DEFAULT_URLS;

    if (urls.length > 50) {
      return new Response(JSON.stringify({ error: 'Max 50 URLs per request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let token = body.token;
    if (!token) token = (await getAccessTokenFromRefresh()) ?? undefined;
    if (!token) {
      return new Response(
        JSON.stringify({
          error:
            'No OAuth token. Pass `token` in the body, or set GSC_OAUTH_REFRESH_TOKEN + GSC_OAUTH_CLIENT_ID + GSC_OAUTH_CLIENT_SECRET secrets.',
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
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
            verdict: idx.verdict,
            coverageState: idx.coverageState,
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

    return new Response(JSON.stringify({ siteUrl, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
