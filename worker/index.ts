/**
 * Cloudflare Worker in front of the static site (see wrangler.jsonc).
 *
 * Runs for page requests only (not /assets/*), and does three things:
 *   1. 301 www.greencabinetsny.com → greencabinetsny.com (one canonical host)
 *   2. 301 legacy URL shapes to their current pages (these used to be
 *      client-side <Navigate> redirects, which crawlers saw as 200 pages)
 *   3. everything else is served from the built files in dist/; unknown
 *      URLs get dist/404.html with a real 404 status.
 */
interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const APEX = "greencabinetsny.com";

const EXACT_REDIRECTS: Record<string, string> = {
  "/shop": "/",
  "/vanity-configurator": "/designer",
  "/vanity-designer": "/designer",
  "/staten-island-kitchen-cabinets": "/kitchen-cabinets-staten-island",
};

const PATTERN_REDIRECTS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [/^\/product\/[^/]+\/?$/, () => "/"],
  [/^\/(?:neighborhoods?|boroughs?|custom-kitchen-cabinets)\/([a-z0-9-]+)\/?$/, (m) => `/custom-kitchen-cabinets-${m[1]}`],
];

export function redirectFor(url: URL): string | null {
  if (url.hostname === `www.${APEX}`) {
    return `https://${APEX}${url.pathname}${url.search}`;
  }
  const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  const exact = EXACT_REDIRECTS[path];
  if (exact) return `${url.origin}${exact}${url.search}`;
  for (const [re, to] of PATTERN_REDIRECTS) {
    const m = url.pathname.match(re);
    if (m) return `${url.origin}${to(m)}${url.search}`;
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const target = redirectFor(new URL(request.url));
    if (target) return Response.redirect(target, 301);
    return env.ASSETS.fetch(request);
  },
};
