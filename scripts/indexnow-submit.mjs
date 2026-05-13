#!/usr/bin/env node
/**
 * IndexNow submitter — pings Bing/Yandex/Seznam/Naver via the shared IndexNow API.
 * Reads public/sitemap.xml and submits all <loc> URLs in one batch.
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs                     # submit every URL in sitemap
 *   node scripts/indexnow-submit.mjs https://...url1 ... # submit specific URLs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const HOST = "greencabinetsny.com";
const KEY = "6d814a9d1f84d4072a1a4fbd8844710f";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

function urlsFromSitemap() {
  const xml = readFileSync(resolve("public/sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
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
