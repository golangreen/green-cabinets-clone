#!/usr/bin/env node
/**
 * Post-deploy crawl trigger.
 *  - Google: submits sitemap via Search Console API (the public ping endpoint
 *    was retired in 2023). Requires LOVABLE_API_KEY + GOOGLE_SEARCH_CONSOLE_API_KEY
 *    in the env (Lovable connector gateway). Skips silently if missing.
 *  - Bing / Yandex / Seznam / Naver: handled via IndexNow (existing script).
 *
 * Usage: node scripts/ping-search-engines.mjs
 */
import { spawnSync } from "node:child_process";

const SITE = "https://greencabinetsny.com/";
const SITEMAP = "https://greencabinetsny.com/sitemap.xml";
const GATEWAY =
  "https://connector-gateway.lovable.dev/google_search_console/webmasters/v3";

async function pingGoogle() {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const gscKey = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;
  if (!lovableKey || !gscKey) {
    console.log("[google] skipped — LOVABLE_API_KEY / GOOGLE_SEARCH_CONSOLE_API_KEY not set");
    return;
  }
  const url = `${GATEWAY}/sites/${encodeURIComponent(SITE)}/sitemaps/${encodeURIComponent(SITEMAP)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gscKey,
    },
  });
  if (res.ok) {
    console.log(`[google] sitemap submitted via GSC API (${res.status})`);
  } else {
    console.error(`[google] GSC submit failed (${res.status}): ${await res.text()}`);
  }
}

function pingIndexNow() {
  const r = spawnSync("node", ["scripts/indexnow-submit.mjs"], { stdio: "inherit" });
  if (r.status !== 0) console.error("[indexnow] submit failed");
}

await pingGoogle();
pingIndexNow();
