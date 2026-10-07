// Waits for build N of Green Cabinets NY to finish processing, clears export
// compliance, writes "What to Test" and hands it to the internal TestFlight groups.
//   node store/testflight.mjs 1
import fs from "node:fs";
import { call } from "./asc.mjs";

const BUILD = process.argv[2] || "1";
const L = JSON.parse(fs.readFileSync(new URL("./listing.json", import.meta.url), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const app = (await call("GET", `/apps?filter[bundleId]=${L.bundleId}`)).j.data[0];

let b;
for (let i = 0; i < 60; i++) {
  b = (await call("GET", `/builds?filter[app]=${app.id}&filter[version]=${BUILD}`)).j?.data?.[0];
  if (b && b.attributes.processingState !== "PROCESSING") break;
  await sleep(30000);
}
console.log("build", BUILD, b?.attributes.processingState ?? "not found yet");
if (b?.attributes.processingState !== "VALID") process.exit(1);

if (b.attributes.usesNonExemptEncryption == null)
  console.log("compliance", (await call("PATCH", `/builds/${b.id}`, { data: { type: "builds", id: b.id, attributes: { usesNonExemptEncryption: false } } })).s);

const locs = (await call("GET", `/builds/${b.id}/betaBuildLocalizations`)).j?.data || [];
const en = locs.find((l) => l.attributes.locale === "en-US");
const r = en
  ? await call("PATCH", `/betaBuildLocalizations/${en.id}`, { data: { type: "betaBuildLocalizations", id: en.id, attributes: { whatsNew: L.whatToTest } } })
  : await call("POST", "/betaBuildLocalizations", { data: { type: "betaBuildLocalizations", attributes: { locale: "en-US", whatsNew: L.whatToTest }, relationships: { build: { data: { type: "builds", id: b.id } } } } });
console.log("what to test", r.s);

let groups = ((await call("GET", `/apps/${app.id}/betaGroups`)).j?.data || []).filter((g) => g.attributes.isInternalGroup);
if (!groups.length) {
  const g = await call("POST", "/betaGroups", { data: { type: "betaGroups", attributes: { name: "Team", isInternalGroup: true, hasAccessToAllBuilds: true }, relationships: { app: { data: { type: "apps", id: app.id } } } } });
  console.log("created internal group Team", g.s, g.msg.slice(0, 200));
  groups = g.ok ? [g.j.data] : [];
}
for (const g of groups) {
  if (g.attributes.hasAccessToAllBuilds) { console.log(g.attributes.name, "gets every build"); continue; }
  console.log("added to", g.attributes.name, (await call("POST", `/betaGroups/${g.id}/relationships/builds`, { data: [{ type: "builds", id: b.id }] })).s);
}
