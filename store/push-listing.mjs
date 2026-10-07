// Fills the App Store listing for Green Cabinets NY from store/listing.json:
// name, subtitle, categories, description, keywords, URLs, review notes, age
// rating, free price and the 6.9" screenshots. Each step reports on its own.
import fs from "node:fs";
import crypto from "node:crypto";
import { call } from "./asc.mjs";

const L = JSON.parse(fs.readFileSync(new URL("./listing.json", import.meta.url), "utf8"));
const SHOTS = new URL("./screenshots/", import.meta.url).pathname;

async function api(m, p, body) {
  const r = await call(m, p, body);
  if (!r.ok) throw new Error(`${m} ${p.split("?")[0]} ${r.s}: ${r.msg}`);
  return r.j;
}
async function step(name, fn) {
  try {
    const r = await fn();
    console.log("ok  ", name, typeof r === "string" ? r : "");
  } catch (e) {
    console.log("FAIL", name, e.message);
  }
}

const app = (await api("GET", `/apps?filter[bundleId]=${L.bundleId}`)).data[0];
const info = (await api("GET", `/apps/${app.id}/appInfos`)).data.find((i) => i.attributes.state !== "READY_FOR_DISTRIBUTION") ?? (await api("GET", `/apps/${app.id}/appInfos`)).data[0];
const ver = (await api("GET", `/apps/${app.id}/appStoreVersions?filter[platform]=IOS`)).data[0];

await step("content rights", () =>
  api("PATCH", `/apps/${app.id}`, { data: { type: "apps", id: app.id, attributes: { contentRightsDeclaration: "DOES_NOT_USE_THIRD_PARTY_CONTENT" } } }),
);

await step("name, subtitle, privacy URL", async () => {
  const loc = (await api("GET", `/appInfos/${info.id}/appInfoLocalizations`)).data.find((l) => l.attributes.locale === "en-US");
  await api("PATCH", `/appInfoLocalizations/${loc.id}`, {
    data: { type: "appInfoLocalizations", id: loc.id, attributes: { name: L.name, subtitle: L.subtitle, privacyPolicyUrl: L.privacyUrl } },
  });
});

await step("categories", () =>
  api("PATCH", `/appInfos/${info.id}`, {
    data: {
      type: "appInfos",
      id: info.id,
      relationships: {
        primaryCategory: { data: { type: "appCategories", id: L.primaryCategory } },
        secondaryCategory: { data: { type: "appCategories", id: L.secondaryCategory } },
      },
    },
  }),
);

await step("age rating", async () => {
  // Every content question answered "None"/"No": Apple rates this 4+.
  const id = (await api("GET", `/appInfos/${info.id}/ageRatingDeclaration`)).data.id;
  const NO = ["advertising", "gambling", "healthOrWellnessTopics", "lootBox", "messagingAndChat", "parentalControls", "ageAssurance", "socialMedia", "unrestrictedWebAccess", "userGeneratedContent"];
  const NONE = ["alcoholTobaccoOrDrugUseOrReferences", "contests", "gamblingSimulated", "gunsOrOtherWeapons", "medicalOrTreatmentInformation", "profanityOrCrudeHumor", "sexualContentGraphicAndNudity", "sexualContentOrNudity", "horrorOrFearThemes", "matureOrSuggestiveThemes", "violenceCartoonOrFantasy", "violenceRealisticProlongedGraphicOrSadistic", "violenceRealistic"];
  const attributes = Object.fromEntries([...NO.map((k) => [k, false]), ...NONE.map((k) => [k, "NONE"])]);
  await api("PATCH", `/ageRatingDeclarations/${id}`, { data: { type: "ageRatingDeclarations", id, attributes } });
});

await step("copyright", () =>
  api("PATCH", `/appStoreVersions/${ver.id}`, { data: { type: "appStoreVersions", id: ver.id, attributes: { copyright: L.copyright } } }),
);

let vloc;
await step("description, keywords, URLs", async () => {
  vloc = (await api("GET", `/appStoreVersions/${ver.id}/appStoreVersionLocalizations`)).data.find((l) => l.attributes.locale === "en-US");
  await api("PATCH", `/appStoreVersionLocalizations/${vloc.id}`, {
    data: {
      type: "appStoreVersionLocalizations",
      id: vloc.id,
      attributes: { description: L.description, keywords: L.keywords, promotionalText: L.promotionalText, supportUrl: L.supportUrl, marketingUrl: L.marketingUrl },
    },
  });
});

await step("review notes", async () => {
  const attributes = {
    contactFirstName: L.reviewContact.firstName,
    contactLastName: L.reviewContact.lastName,
    contactEmail: L.reviewContact.email,
    contactPhone: L.reviewContact.phone,
    demoAccountRequired: false,
    notes: L.reviewNotes,
  };
  const r = await call("GET", `/appStoreVersions/${ver.id}/appStoreReviewDetail`);
  if (r.ok && r.j?.data) await api("PATCH", `/appStoreReviewDetails/${r.j.data.id}`, { data: { type: "appStoreReviewDetails", id: r.j.data.id, attributes } });
  else await api("POST", "/appStoreReviewDetails", { data: { type: "appStoreReviewDetails", attributes, relationships: { appStoreVersion: { data: { type: "appStoreVersions", id: ver.id } } } } });
});

await step("price: free", async () => {
  const pts = (await api("GET", `/apps/${app.id}/appPricePoints?filter[territory]=USA&limit=200`)).data;
  const free = pts.find((p) => Number(p.attributes.customerPrice) === 0);
  await api("POST", "/appPriceSchedules", {
    data: {
      type: "appPriceSchedules",
      relationships: {
        app: { data: { type: "apps", id: app.id } },
        baseTerritory: { data: { type: "territories", id: "USA" } },
        manualPrices: { data: [{ type: "appPrices", id: "${p0}" }] },
      },
    },
    included: [{ type: "appPrices", id: "${p0}", attributes: { startDate: null }, relationships: { appPricePoint: { data: { type: "appPricePoints", id: free.id } } } }],
  });
});

await step("screenshots (6.9 inch)", async () => {
  const sets = (await api("GET", `/appStoreVersionLocalizations/${vloc.id}/appScreenshotSets`)).data;
  let set = sets.find((s) => s.attributes.screenshotDisplayType === "APP_IPHONE_67");
  if (!set)
    set = (await api("POST", "/appScreenshotSets", {
      data: { type: "appScreenshotSets", attributes: { screenshotDisplayType: "APP_IPHONE_67" }, relationships: { appStoreVersionLocalization: { data: { type: "appStoreVersionLocalizations", id: vloc.id } } } },
    })).data;
  for (const o of (await api("GET", `/appScreenshotSets/${set.id}/appScreenshots`)).data) await api("DELETE", `/appScreenshots/${o.id}`);
  const files = fs.readdirSync(SHOTS).filter((f) => f.endsWith(".jpg")).sort();
  for (const f of files) {
    const buf = fs.readFileSync(SHOTS + f);
    const shot = (await api("POST", "/appScreenshots", {
      data: { type: "appScreenshots", attributes: { fileName: f, fileSize: buf.length }, relationships: { appScreenshotSet: { data: { type: "appScreenshotSets", id: set.id } } } },
    })).data;
    for (const op of shot.attributes.uploadOperations) {
      const r = await fetch(op.url, { method: op.method, headers: Object.fromEntries(op.requestHeaders.map((h) => [h.name, h.value])), body: buf.subarray(op.offset, op.offset + op.length) });
      if (!r.ok) throw new Error(`${f} upload ${r.status}`);
    }
    await api("PATCH", `/appScreenshots/${shot.id}`, { data: { type: "appScreenshots", id: shot.id, attributes: { uploaded: true, sourceFileChecksum: crypto.createHash("md5").update(buf).digest("hex") } } });
  }
  return files.length + " uploaded";
});
