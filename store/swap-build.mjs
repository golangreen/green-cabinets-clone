// Pulls Green Cabinets NY out of App Review, attaches build N to the open
// iOS version and submits it again.   node store/swap-build.mjs 3
import fs from "node:fs";
import { call } from "./asc.mjs";

const BUILD = process.argv[2];
const L = JSON.parse(fs.readFileSync(new URL("./listing.json", import.meta.url), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(m, p, body) {
  const r = await call(m, p, body);
  if (!r.ok) throw new Error(`${m} ${p.split("?")[0]} ${r.s}: ${r.msg}`);
  return r.j;
}
const app = (await api("GET", `/apps?filter[bundleId]=${L.bundleId}`)).data[0];
const subs = `/reviewSubmissions?filter[app]=${app.id}&filter[platform]=IOS&filter[state]=`;

for (const s of (await api("GET", subs + "WAITING_FOR_REVIEW,IN_REVIEW,UNRESOLVED_ISSUES")).data) {
  await api("PATCH", `/reviewSubmissions/${s.id}`, { data: { type: "reviewSubmissions", id: s.id, attributes: { canceled: true } } });
  console.log("pulled from review:", s.attributes.state);
}
for (let i = 0; i < 40; i++) {
  if (!(await api("GET", subs + "WAITING_FOR_REVIEW,IN_REVIEW,CANCELING")).data.length) break;
  await sleep(15000);
}

const b = (await api("GET", `/builds?filter[app]=${app.id}&filter[version]=${BUILD}`)).data[0];
if (b?.attributes.processingState !== "VALID") throw new Error(`build ${BUILD} not ready`);
const v = (await api("GET", `/apps/${app.id}/appStoreVersions?filter[platform]=IOS`)).data[0];
await api("PATCH", `/appStoreVersions/${v.id}/relationships/build`, { data: { type: "builds", id: b.id } });
console.log(`version ${v.attributes.versionString} now has build ${BUILD}`);

const open = (await api("GET", subs + "READY_FOR_REVIEW")).data;
const s = open[0] ?? (await api("POST", "/reviewSubmissions", { data: { type: "reviewSubmissions", attributes: { platform: "IOS" }, relationships: { app: { data: { type: "apps", id: app.id } } } } })).data;
const item = await call("POST", "/reviewSubmissionItems", { data: { type: "reviewSubmissionItems", relationships: { reviewSubmission: { data: { type: "reviewSubmissions", id: s.id } }, appStoreVersion: { data: { type: "appStoreVersions", id: v.id } } } } });
if (!item.ok) console.log("item:", item.msg);
await api("PATCH", `/reviewSubmissions/${s.id}`, { data: { type: "reviewSubmissions", id: s.id, attributes: { submitted: true } } });
const now = (await api("GET", `/apps/${app.id}/appStoreVersions?filter[platform]=IOS`)).data[0];
console.log("submitted:", now.attributes.appStoreState);
