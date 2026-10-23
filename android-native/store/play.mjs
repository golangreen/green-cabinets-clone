// Pushes the Android app to Google Play: the listing text, contact details,
// icon, feature graphic and screenshots, then the bundle to a track.
//   node store/play.mjs listing                  text and pictures only
//   node store/play.mjs upload <track> [--draft]  bundle to internal / production (also pushes the listing)
//   node store/play.mjs check                    what each track holds
// Signs in with the Play service account that already publishes Punchlee
// (~/Downloads/punchlee-keys/play-service-account.json), which Golan gave
// access to this app.
import { readFileSync, readdirSync } from "fs";
import crypto from "crypto";

const DIR = new URL(".", import.meta.url).pathname;
const L = JSON.parse(readFileSync(DIR + "play-listing.json", "utf8"));
const pkg = L.package;
const [cmd, track = "internal", flag] = process.argv.slice(2);

const key = JSON.parse(readFileSync(process.env.HOME + "/Downloads/punchlee-keys/play-service-account.json"));
const now = Math.floor(Date.now() / 1000);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const u = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({ iss: key.client_email, scope: "https://www.googleapis.com/auth/androidpublisher", aud: key.token_uri, iat: now, exp: now + 3600 });
const jwt = u + "." + crypto.sign("RSA-SHA256", Buffer.from(u), key.private_key).toString("base64url");
const { access_token } = await (await fetch(key.token_uri, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}` })).json();
const H = { Authorization: "Bearer " + access_token };
const API = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}`;
const UP = `https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/${pkg}`;
const j = async (r) => { const t = await r.text(); if (!r.ok) throw new Error(r.status + " " + t.slice(0, 1500)); return t ? JSON.parse(t) : {}; };

const edit = (await j(await fetch(API + "/edits", { method: "POST", headers: H }))).id;
const E = `${API}/edits/${edit}`;

if (cmd === "check") {
  const t = await j(await fetch(E + "/tracks", { headers: H }));
  console.log(JSON.stringify(t.tracks.map((x) => [x.track, x.releases?.map((r) => [r.name, r.versionCodes, r.status])])));
  process.exit(0);
}

// Text and contact details (NOLISTING=1 skips the listing: needs "Manage store presence" on the service account)
const listing = !process.env.NOLISTING;
if (listing) await j(await fetch(`${E}/listings/${L.language}`, {
  method: "PUT", headers: { ...H, "Content-Type": "application/json" },
  body: JSON.stringify({ language: L.language, title: L.title, shortDescription: L.shortDescription, fullDescription: L.fullDescription }),
}));
if (listing) await j(await fetch(`${E}/details`, {
  method: "PATCH", headers: { ...H, "Content-Type": "application/json" },
  body: JSON.stringify({ defaultLanguage: L.language, contactEmail: L.contactEmail, contactWebsite: L.contactWebsite }),
}));
if (listing) console.log("ok   listing text, contact details");

// Pictures: replace each set
async function images(type, files) {
  await j(await fetch(`${E}/listings/${L.language}/${type}`, { method: "DELETE", headers: H }));
  for (const f of files) {
    await j(await fetch(`${UP}/edits/${edit}/listings/${L.language}/${type}?uploadType=media`, { method: "POST", headers: { ...H, "Content-Type": "image/png" }, body: readFileSync(f) }));
  }
  console.log(`ok   ${type}: ${files.length}`);
}
const pngs = (d) => readdirSync(DIR + d).filter((f) => f.endsWith(".png")).sort().map((f) => DIR + d + "/" + f);
if (listing) {
  await images("icon", [DIR + "icon-512.png"]);
  await images("featureGraphic", [DIR + "feature-graphic.png"]);
  await images("phoneScreenshots", pngs("phone"));
  await images("sevenInchScreenshots", pngs("tablet"));
  await images("tenInchScreenshots", pngs("tablet"));
}

if (cmd === "upload") {
  const aab = DIR + "../app/build/outputs/bundle/release/app-release.aab";
  const up = await j(await fetch(`${UP}/edits/${edit}/bundles?uploadType=media`, { method: "POST", headers: { ...H, "Content-Type": "application/octet-stream" }, body: readFileSync(aab) }));
  console.log("ok   bundle, versionCode", up.versionCode);
  const gradle = readFileSync(DIR + "../app/build.gradle.kts", "utf8");
  const name = `${/versionName = "([^"]+)"/.exec(gradle)[1]} (${up.versionCode})`;
  for (const t of new Set(["internal", track])) {
    await j(await fetch(`${E}/tracks/${t}`, {
      method: "PUT", headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ track: t, releases: [{ name, versionCodes: [String(up.versionCode)], status: flag === "--draft" && t !== "internal" ? "draft" : "completed", releaseNotes: [{ language: L.language, text: L.releaseNotes }] }] }),
    }));
    console.log(`ok   ${t} track: ${name}`);
  }
}

const c = await j(await fetch(E + ":commit", { method: "POST", headers: H }));
console.log("committed", c.id);
