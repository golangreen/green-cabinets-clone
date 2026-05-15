// Public SEO + GEO checker. Fetches public assets/pages and runs per-check validation.
// Called once per check from the client so the UI can show live progress.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const ALLOWED_ORIGINS = new Set([
  'https://greencabinetsny.com',
  'https://www.greencabinetsny.com',
  'https://green-cabinets-clone.lovable.app',
]);

type CheckResult = {
  id: string;
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string;
};

function pickOrigin(input?: string): string {
  if (input && ALLOWED_ORIGINS.has(input)) return input;
  return 'https://greencabinetsny.com';
}

async function fetchText(url: string, timeoutMs = 10000): Promise<{ ok: boolean; status: number; text: string; ct: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow' });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, ct: res.headers.get('content-type') ?? '' };
  } finally {
    clearTimeout(t);
  }
}

async function runCheck(id: string, origin: string): Promise<CheckResult> {
  switch (id) {
    case 'robots': {
      const r = await fetchText(`${origin}/robots.txt`);
      if (!r.ok) return { id, name: 'robots.txt reachable', status: 'fail', message: `HTTP ${r.status}` };
      const hasSitemap = /^\s*Sitemap:\s*https?:\/\//im.test(r.text);
      const blocksAll = /User-agent:\s*\*[\s\S]*?Disallow:\s*\/\s*$/im.test(r.text);
      if (blocksAll) return { id, name: 'robots.txt', status: 'fail', message: 'Site is blocked from all crawlers (Disallow: /).' };
      if (!hasSitemap) return { id, name: 'robots.txt', status: 'warn', message: 'Missing Sitemap: directive.' };
      return { id, name: 'robots.txt', status: 'pass', message: 'OK with Sitemap directive.' };
    }
    case 'sitemap': {
      const r = await fetchText(`${origin}/sitemap.xml`);
      if (!r.ok) return { id, name: 'sitemap.xml reachable', status: 'fail', message: `HTTP ${r.status}` };
      const urls = (r.text.match(/<loc>/g) || []).length;
      if (urls === 0) return { id, name: 'sitemap.xml', status: 'fail', message: 'No <loc> entries found.' };
      if (!/^<\?xml/.test(r.text.trim())) return { id, name: 'sitemap.xml', status: 'warn', message: 'Missing XML declaration.' };
      return { id, name: 'sitemap.xml', status: 'pass', message: `${urls} URLs indexed.`, details: `${urls} entries` };
    }
    case 'llms': {
      const r = await fetchText(`${origin}/llms.txt`);
      if (!r.ok) return { id, name: 'llms.txt (GEO)', status: 'warn', message: 'Missing — recommended for AI crawlers.' };
      if (r.text.length < 100) return { id, name: 'llms.txt (GEO)', status: 'warn', message: 'Present but very short.' };
      return { id, name: 'llms.txt (GEO)', status: 'pass', message: `Present (${r.text.length} bytes).` };
    }
    case 'home-meta': {
      const r = await fetchText(`${origin}/`);
      if (!r.ok) return { id, name: 'Homepage meta tags', status: 'fail', message: `HTTP ${r.status}` };
      const title = r.text.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '';
      const desc = r.text.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] ?? '';
      const canonical = /<link[^>]+rel=["']canonical["']/i.test(r.text);
      const og = /<meta[^>]+property=["']og:image["']/i.test(r.text);
      const issues: string[] = [];
      if (!title || title.length < 10) issues.push('title');
      if (!desc || desc.length < 50) issues.push('description');
      if (!canonical) issues.push('canonical');
      if (!og) issues.push('og:image');
      if (issues.length) return { id, name: 'Homepage meta tags', status: issues.length > 2 ? 'fail' : 'warn', message: `Missing/short: ${issues.join(', ')}` };
      return { id, name: 'Homepage meta tags', status: 'pass', message: `title (${title.length}) · desc (${desc.length}) · canonical · og`, details: title };
    }
    case 'jsonld': {
      const r = await fetchText(`${origin}/`);
      const blocks = r.text.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
      if (!blocks.length) return { id, name: 'Structured data (JSON-LD)', status: 'fail', message: 'No JSON-LD blocks found in homepage.' };
      let valid = 0; let bad = 0; const types: string[] = [];
      for (const b of blocks) {
        const m = b.match(/>([\s\S]*?)<\/script>/i)?.[1] ?? '';
        try {
          const parsed = JSON.parse(m);
          valid++;
          const t = Array.isArray(parsed) ? parsed.map((p) => p['@type']).filter(Boolean) : [parsed['@type']].filter(Boolean);
          types.push(...t.flat());
        } catch { bad++; }
      }
      if (bad) return { id, name: 'Structured data (JSON-LD)', status: 'warn', message: `${valid} valid, ${bad} invalid blocks.`, details: types.join(', ') };
      return { id, name: 'Structured data (JSON-LD)', status: 'pass', message: `${valid} valid blocks.`, details: types.join(', ') };
    }
    case 'noindex': {
      const r = await fetchText(`${origin}/`);
      const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(r.text);
      if (noindex) return { id, name: 'Indexability', status: 'fail', message: 'Homepage has noindex meta tag.' };
      return { id, name: 'Indexability', status: 'pass', message: 'No noindex on homepage.' };
    }
    case 'pillars': {
      const paths = ['/shop', '/case-studies', '/about', '/wood-species', '/finishes-colors'];
      const results = await Promise.all(paths.map(async (p) => {
        try { const r = await fetchText(`${origin}${p}`, 8000); return { p, ok: r.ok, s: r.status }; }
        catch { return { p, ok: false, s: 0 }; }
      }));
      const broken = results.filter((x) => !x.ok);
      if (broken.length) return { id, name: 'Pillar pages reachable', status: 'fail', message: `${broken.length} broken: ${broken.map((b) => `${b.p}(${b.s})`).join(', ')}` };
      return { id, name: 'Pillar pages reachable', status: 'pass', message: `${paths.length}/${paths.length} OK.` };
    }
    case 'geo-citations': {
      const r = await fetchText(`${origin}/`);
      const hasNAP = /Green Cabinets/i.test(r.text) && /(Brooklyn|Queens|Bronx|Manhattan|NYC|New York)/i.test(r.text);
      const hasLocalBiz = /"@type"\s*:\s*"LocalBusiness"/i.test(r.text);
      if (!hasNAP) return { id, name: 'GEO: NAP on homepage', status: 'warn', message: 'Brand + NYC borough not found in static HTML.' };
      if (!hasLocalBiz) return { id, name: 'GEO: LocalBusiness schema', status: 'warn', message: 'LocalBusiness JSON-LD not found in static HTML.' };
      return { id, name: 'GEO: NAP + LocalBusiness', status: 'pass', message: 'Brand, location, and LocalBusiness present.' };
    }
    default:
      return { id, name: id, status: 'fail', message: 'Unknown check.' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const id = String(body.check ?? '');
    const origin = pickOrigin(body.origin);
    if (!id) return new Response(JSON.stringify({ error: 'check required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const result = await runCheck(id, origin);
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'An internal error occurred' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
