// Registers com.greencabinetsny.app and its App Store profile against the team's
// existing Apple Distribution certificate, then installs the profile locally.
import fs from "node:fs";
import os from "node:os";
import { call } from "./asc.mjs";

const ID = "com.greencabinetsny.app";
const NAME = "Green Cabinets AppStore";

let bid = (await call("GET", `/bundleIds?filter[identifier]=${ID}`)).j?.data?.find((b) => b.attributes.identifier === ID);
if (!bid) {
  const r = await call("POST", "/bundleIds", { data: { type: "bundleIds", attributes: { identifier: ID, name: "Green Cabinets", platform: "IOS" } } });
  if (!r.ok) throw new Error("bundle id: " + r.msg);
  bid = r.j.data;
  console.log("registered", ID);
}

const certs = (await call("GET", "/certificates?filter[certificateType]=DISTRIBUTION,IOS_DISTRIBUTION&limit=50")).j?.data || [];
const cert = certs.find((c) => c.id === "44RT74PFWX") || certs[0];
if (!cert) throw new Error("no distribution certificate");

let prof = (await call("GET", `/profiles?filter[name]=${encodeURIComponent(NAME)}`)).j?.data?.find((p) => p.attributes.profileState === "ACTIVE");
if (!prof) {
  const r = await call("POST", "/profiles", {
    data: {
      type: "profiles",
      attributes: { name: NAME, profileType: "IOS_APP_STORE" },
      relationships: { bundleId: { data: { type: "bundleIds", id: bid.id } }, certificates: { data: [{ type: "certificates", id: cert.id }] } },
    },
  });
  if (!r.ok) throw new Error("profile: " + r.msg);
  prof = r.j.data;
  console.log("created profile", NAME);
}
const dir = os.homedir() + "/Library/MobileDevice/Provisioning Profiles";
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(`${dir}/${prof.attributes.uuid}.mobileprovision`, Buffer.from(prof.attributes.profileContent, "base64"));
console.log("installed", prof.attributes.uuid, "cert", cert.id);
