// App Store Connect API helper for the Green Cabinets app. Reuses the account's
// API key (same Apple developer team as Punchlee) and its JWT signer.
import fs from "node:fs";
import os from "node:os";
import { makeJWT } from "../../../Downloads/store/push-metadata.mjs";

const cfg = JSON.parse(fs.readFileSync(os.homedir() + "/Downloads/store/asc-key.json", "utf8"));
cfg.privateKey = fs.readFileSync(cfg.p8Path.replace(/^~/, os.homedir()), "utf8");
export const KEY = { id: cfg.keyId, issuer: cfg.issuerId, path: cfg.p8Path.replace(/^~/, os.homedir()) };

let tok = makeJWT(cfg);
let made = Date.now();
export async function call(m, p, body) {
  if (Date.now() - made > 15 * 60 * 1000) {
    tok = makeJWT(cfg);
    made = Date.now();
  }
  const r = await fetch((p.startsWith("http") ? "" : "https://api.appstoreconnect.apple.com/v1") + p, {
    method: m,
    headers: { Authorization: "Bearer " + tok, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const x = await r.text();
  let j = null;
  try {
    j = x ? JSON.parse(x) : null;
  } catch {
    /* not JSON */
  }
  return { ok: r.ok, s: r.status, j, msg: (j?.errors || []).map((e) => e.detail || e.title).join(" | ") || x.slice(0, 300) };
}
