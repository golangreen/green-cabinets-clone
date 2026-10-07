// Read-only: which apps and bundle ids exist on the account.
import { call } from "./asc.mjs";

const apps = await call("GET", "/apps?limit=50&fields[apps]=name,bundleId,sku");
console.log("apps:", apps.s, (apps.j?.data || []).map((a) => `${a.attributes.name} | ${a.attributes.bundleId}`));
const bids = await call("GET", "/bundleIds?limit=200&fields[bundleIds]=identifier");
console.log("bundleIds:", (bids.j?.data || []).map((b) => b.attributes.identifier).join(", "));
