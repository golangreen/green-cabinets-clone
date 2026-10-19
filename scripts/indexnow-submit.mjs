#!/usr/bin/env node
/**
 * IndexNow submitter — pings Bing/Yandex/Seznam/Naver via the shared IndexNow API.
 * Reads public/sitemap.xml and submits all <loc> URLs in one batch.
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs                     # submit every URL in sitemap
 *   node scripts/indexnow-submit.mjs https://...url1 ... # submit specific URLs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const HOST = "greencabinetsny.com";
const KEY = "6d814a9d1f84d4072a1a4fbd8844710f";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

// public/sitemap.xml is a sitemap index: expand each child sitemap to its
// page URLs (submitting the child sitemap URLs themselves does nothing).
function urlsFromSitemap() {
  const locs = (file) => [...readFileSync(file, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const urls = [];
  for (const loc of locs(resolve("public/sitemap.xml"))) {
    const child = loc.match(/^https:\/\/greencabinetsny\.com\/(sitemaps\/[^/]+\.xml)$/);
    if (child && existsSync(resolve("public", child[1]))) urls.push(...locs(resolve("public", child[1])));
    else if (!loc.endsWith(".xml")) urls.push(loc);
  }
  return [...new Set(urls)].slice(0, 10000);
}

const cliUrls = process.argv.slice(2).filter(Boolean);
const urlList = cliUrls.length ? cliUrls : urlsFromSitemap();

if (!urlList.length) {
  console.error("No URLs to submit.");
  process.exit(1);
}

const body = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList,
};

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`IndexNow → ${res.status} ${res.statusText} (${urlList.length} URLs)`);
if (text) console.log(text);
if (!res.ok) process.exit(1);
