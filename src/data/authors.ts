/**
 * Centralized author/Person schema for E-E-A-T.
 * Reference these via @id from any Article / HowTo / FAQPage schema:
 *   author: { "@id": AUTHOR_IDS.golan }
 * The full Person object is emitted once on /about and discoverable
 * by search engines + LLMs through the @id graph.
 */

export const ORG_ID = "https://greencabinetsny.com/#organization";
export const LOCALBUSINESS_ID = "https://greencabinetsny.com/#localbusiness";

export const AUTHOR_IDS = {
  golan: "https://greencabinetsny.com/about#golan-achdary",
  andy: "https://greencabinetsny.com/about#andy-lopez",
  team: "https://greencabinetsny.com/about#team",
} as const;

export type AuthorRef = { "@type": "Person"; "@id": string; name: string; url: string };

/** Lightweight author reference suitable as `author:` on Article/HowTo schema. */
export const authorRef = (id: keyof typeof AUTHOR_IDS = "golan"): AuthorRef => {
  const map: Record<keyof typeof AUTHOR_IDS, { name: string }> = {
    golan: { name: "Golan Achdary" },
    andy: { name: "Andy Lopez" },
    team: { name: "Green Cabinets NY Editorial Team" },
  };
  return {
    "@type": "Person",
    "@id": AUTHOR_IDS[id],
    name: map[id].name,
    url: AUTHOR_IDS[id],
  };
};

/** Full Person nodes — emitted once on /about so the @ids resolve. */
export const PEOPLE = [
  {
    "@type": "Person",
    "@id": AUTHOR_IDS.golan,
    name: "Golan Achdary",
    givenName: "Golan",
    familyName: "Achdary",
    jobTitle: "Founder & Master Cabinetmaker",
    worksFor: { "@id": ORG_ID },
    affiliation: { "@id": ORG_ID },
    url: "https://greencabinetsny.com/about",
    telephone: "+1-718-804-5488",
    email: "orders@greencabinetsny.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "10 Montieth St",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      postalCode: "11206",
      addressCountry: "US",
    },
    knowsAbout: [
      "Custom kitchen cabinetry",
      "Shaker and slim-shaker door construction",
      "Bathroom vanity design",
      "FSC-certified hardwoods",
      "Low-VOC and water-based finishes",
      "NYC apartment and brownstone renovations",
      "Co-op and DOB approval workflows",
    ],
    description:
      "Founder of Green Cabinets NY (2009). Master cabinetmaker specializing in custom kitchen cabinets, bathroom vanities, and architectural millwork built in Bushwick, Brooklyn for NYC homeowners, architects, and developers.",
    sameAs: [
      "https://www.instagram.com/greencabinetsny",
      "https://www.instagram.com/green_cabinets_",
    ],
  },
  {
    "@type": "Person",
    "@id": AUTHOR_IDS.andy,
    name: "Andy Lopez",
    givenName: "Andy",
    familyName: "Lopez",
    jobTitle: "Project Manager & Installation Lead",
    worksFor: { "@id": ORG_ID },
    affiliation: { "@id": ORG_ID },
    url: "https://greencabinetsny.com/about",
    telephone: "+1-917-819-5538",
    email: "orders@greencabinetsny.com",
    knowsAbout: [
      "Cabinet installation in NYC apartments",
      "Project scheduling and site coordination",
      "Brownstone and pre-war kitchen renovations",
      "Co-op board approvals and alteration agreements",
    ],
    description:
      "Runs install crews and project management for Green Cabinets NY across the five boroughs.",
  },
] as const;
