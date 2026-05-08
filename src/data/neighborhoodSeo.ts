import type { BoroughSlug } from "./boroughSeo";

export interface NeighborhoodFaq {
  question: string;
  answer: string;
}

export interface NeighborhoodBodySection {
  heading: string;
  paragraphs: string[];
}

export interface NeighborhoodSeo {
  /** URL slug — used as `/custom-kitchen-cabinets-{slug}`. Must NOT collide with borough slugs. */
  slug: string;
  name: string;
  boroughSlug: BoroughSlug;
  boroughName: string;
  url: string;
  title: string;
  description: string;
  keywords: string;
  heroTagline: string;
  intro: string;
  body: NeighborhoodBodySection[];
  faqs: NeighborhoodFaq[];
  /** Lat/lng for LocalBusiness JSON-LD areaServed. */
  geo: { latitude: number; longitude: number };
}

const BASE = "https://greencabinetsny.com";

export const NEIGHBORHOODS: Record<string, NeighborhoodSeo> = {
  bushwick: {
    slug: "bushwick",
    name: "Bushwick",
    boroughSlug: "brooklyn",
    boroughName: "Brooklyn",
    url: `${BASE}/custom-kitchen-cabinets-bushwick`,
    title: "Custom Kitchen Cabinets in Bushwick, Brooklyn | Green Cabinets NY",
    description:
      "Custom kitchen cabinets handcrafted in our Bushwick shop. Local Brooklyn cabinetmaker since 2009 — FSC-certified hardwoods, low-VOC finishes, free in-home consultation. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets Bushwick, Bushwick cabinet maker, Bushwick kitchen renovation, custom cabinetry Bushwick Brooklyn, Bushwick cabinet shop, kitchen cabinets 11206 11207 11221",
    heroTagline:
      "Designed, milled, and hand-finished in Bushwick — installed across Brooklyn.",
    intro:
      "Green Cabinets NY is a Bushwick-based custom cabinet shop. Every kitchen we build leaves the same neighborhood you live in — milled, sanded, sprayed, and crated by the same craftspeople who design it.",
    body: [
      {
        heading: "Your local Bushwick cabinet maker",
        paragraphs: [
          "We're not a showroom that subcontracts to a factory in another state. Our shop is a working woodshop in Bushwick where every face frame, door, drawer box, and finished panel for your kitchen is built. That means shorter lead times for our Bushwick neighbors, no shipping damage, and the ability to walk a client through their cabinets while they're still in raw wood — something almost no NYC cabinet company can offer.",
          "Most of our Bushwick projects come from referrals on the same block. We've worked in the loft conversions along Wyckoff Avenue, the brick rowhouses near Maria Hernandez Park, the Knickerbocker Avenue walk-ups, and the new construction off Myrtle. Each one has its own quirks — and after 15+ years working this neighborhood, we know them.",
        ],
      },
      {
        heading: "Bushwick kitchens we love to build",
        paragraphs: [
          "The classic Bushwick kitchen is a long, narrow galley in a railroad apartment, or an open warehouse loft with 10–12 ft ceilings. Both reward custom cabinetry: galleys need every inch optimized with toe-kick drawers, full-extension hardware, and floor-to-ceiling pantries; lofts beg for double-stacked uppers, oversized islands, and integrated appliance panels.",
          "We work in shaker, slab, and inset shaker styles, in our signature sage green, deep navy, warm cream, or natural white-oak finishes. For Bushwick artists and creatives, we've also built a fair number of two-tone kitchens — dark base, light upper, mixed metals — that photograph beautifully and hold up to daily cooking.",
        ],
      },
      {
        heading: "Pricing for a Bushwick kitchen",
        paragraphs: [
          "Custom kitchen cabinets in Bushwick run $350 per linear foot for full kitchens, $225/lf for base cabinets, and $125/lf for wall cabinets. A typical Bushwick galley lands between $7,500 and $14,000; a loft kitchen with an island and pantry wall typically falls in the $14,000–$25,000 range. Free in-home consultation, fixed quote, and no design fee.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are you really based in Bushwick?",
        answer:
          "Yes. Our cabinet shop has been in Bushwick since 2009. Every kitchen we sell is designed, milled, and hand-finished here before installation. Bushwick clients are welcome to visit the shop while their cabinets are being built.",
      },
      {
        question: "How fast can you install a kitchen in Bushwick?",
        answer:
          "For Bushwick clients, we can typically start a project within 1–2 weeks of approval. Total timeline runs 4–6 weeks: 1 week design, 2–3 weeks fabrication in our shop, and 3–7 days for installation in your home.",
      },
      {
        question: "Do you work in Bushwick walk-up apartments and lofts?",
        answer:
          "Daily. We've installed in 5th-floor walk-ups, freight-elevator loft buildings, and ground-floor garden apartments throughout Bushwick. Every cabinet is built sized to fit through the actual stair or elevator path — measured before fabrication.",
      },
      {
        question: "What Bushwick zip codes do you serve?",
        answer:
          "We serve all of Bushwick — 11206, 11207, 11221, 11237 — and the surrounding East Williamsburg, Ridgewood, and Bedford-Stuyvesant blocks.",
      },
    ],
    geo: { latitude: 40.6944, longitude: -73.9213 },
  },

  williamsburg: {
    slug: "williamsburg",
    name: "Williamsburg",
    boroughSlug: "brooklyn",
    boroughName: "Brooklyn",
    url: `${BASE}/custom-kitchen-cabinets-williamsburg`,
    title:
      "Custom Kitchen Cabinets in Williamsburg, Brooklyn | Green Cabinets NY",
    description:
      "Custom kitchen cabinets in Williamsburg — loft conversions, brownstones, new construction. Built in our nearby Bushwick shop. Free consultation. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets Williamsburg, Williamsburg Brooklyn cabinet maker, loft kitchen Williamsburg, custom cabinetry Williamsburg, Williamsburg condo kitchen renovation, kitchen cabinets 11211 11249",
    heroTagline:
      "Loft kitchens, brownstone galleys, and new-construction Williamsburg condos.",
    intro:
      "Williamsburg is one of our most-served neighborhoods. Our Bushwick workshop is twenty minutes away, which means short delivery windows, easy site visits, and same-week punch-list returns.",
    body: [
      {
        heading: "Cabinetry built for Williamsburg's range of homes",
        paragraphs: [
          "Williamsburg is three neighborhoods in one: the converted industrial lofts along Wythe and Kent, the historic Italianate brownstones in the South Side and Hewes Street area, and the glassy new-construction condos along the waterfront. Each calls for a very different cabinetry approach — and we build for all three.",
          "Loft conversions in old brewing and textile buildings often have brick walls, exposed steel columns, and 10–14 ft ceilings. We design double-stacked uppers, oversized islands with waterfall stone, and integrated panel-front refrigerators that disappear into the cabinetry. For South Williamsburg brownstones, we build inset shaker doors with traditional bead detail, painted in deep forest green or warm cream, that look original to the 1880s building.",
          "For new-construction Williamsburg condos, our work focuses on upgrading developer-grade cabinets to true custom — taller wall cabinets, integrated appliance fronts, custom pantry pull-outs, and stone-to-ceiling backsplashes that the original install never accounted for.",
        ],
      },
      {
        heading: "Why Williamsburg clients choose us",
        paragraphs: [
          "We're a short drive away in Bushwick, which translates to faster site visits, cheaper installation labor, and the ability to handle warranty work in days instead of weeks. We also know the building managers and supers in many of the larger Williamsburg condo buildings — which speeds up the COI and elevator-reservation process for board-managed buildings.",
          "All cabinets are built from FSC-certified hardwoods and finished with low-VOC waterborne paints and conversion varnishes. For Williamsburg families with young children or anyone sensitive to off-gassing, this matters.",
        ],
      },
      {
        heading: "Williamsburg kitchen cabinet pricing",
        paragraphs: [
          "Custom kitchen cabinets in Williamsburg start at $350 per linear foot for full kitchens. A typical Williamsburg loft kitchen with island runs $15,000–$28,000; a brownstone galley falls in the $9,000–$16,000 range; condo upgrades depend on scope but often start around $7,500.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you handle Williamsburg condo board approvals and COIs?",
        answer:
          "Yes. We regularly provide certificates of insurance, alteration agreements, and elevator-reservation paperwork for the major Williamsburg condo and rental buildings. We've worked with most of the building management companies in 11211 and 11249.",
      },
      {
        question: "Can you build kitchens for Williamsburg loft conversions?",
        answer:
          "Loft kitchens are our specialty. We design around exposed brick, steel columns, and 12+ ft ceilings — building cabinetry that respects the original architecture instead of fighting it.",
      },
      {
        question: "How long does a Williamsburg kitchen take?",
        answer:
          "4–6 weeks total: 1–2 weeks design and material selection, 2–3 weeks fabrication in our Bushwick shop, and 3–7 days for installation in Williamsburg.",
      },
      {
        question: "Which Williamsburg areas do you serve?",
        answer:
          "All of Williamsburg — North Side, South Side, East Williamsburg, and the Williamsburg waterfront. Zip codes 11211, 11206, and 11249.",
      },
    ],
    geo: { latitude: 40.7081, longitude: -73.9571 },
  },

  "park-slope": {
    slug: "park-slope",
    name: "Park Slope",
    boroughSlug: "brooklyn",
    boroughName: "Brooklyn",
    url: `${BASE}/custom-kitchen-cabinets-park-slope`,
    title:
      "Custom Kitchen Cabinets in Park Slope, Brooklyn | Green Cabinets NY",
    description:
      "Custom kitchen cabinets for Park Slope brownstones and co-ops. Built in our Bushwick shop, installed with care for historic homes. Free consultation. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets Park Slope, Park Slope brownstone kitchen, Park Slope cabinet maker, custom cabinetry Park Slope, Park Slope kitchen renovation, kitchen cabinets 11215 11217",
    heroTagline:
      "Brownstone-ready custom cabinetry, built for Park Slope's historic kitchens.",
    intro:
      "Park Slope is a neighborhood of brownstones, co-ops, and pre-war apartments — most with original moldings, plaster walls, and out-of-square corners. We build custom cabinetry that looks like it has always belonged.",
    body: [
      {
        heading: "Brownstone cabinetry, done right",
        paragraphs: [
          "Most Park Slope kitchens we work in are in 1880s–1900 brownstones — typically on the parlor floor, garden floor, or in a renovated basement. The original kitchens were small, dark, and tucked at the back; today's owners almost always want them opened up to the dining room or rear yard.",
          "We design and build cabinetry that fits the brownstone vocabulary: inset shaker doors with traditional bead, painted in heritage colors (deep green, navy, soft cream), real solid-wood face frames, and crown molding that ties cleanly into the original ceiling cornice. Where the architecture calls for it, we mill custom door profiles to match existing built-ins or china cabinets — a service most NYC cabinet companies don't offer.",
        ],
      },
      {
        heading: "Co-op and condo work in Park Slope",
        paragraphs: [
          "For Park Slope co-ops and condos — including the larger pre-war buildings on Prospect Park West, 8th Avenue, and 7th Avenue — we handle alteration agreements, COIs, and the typical board approval process. Most of these kitchens are tighter than the brownstones, but the 9–10 ft ceilings let us push uppers higher and add a glazed display row that doubles real storage.",
        ],
      },
      {
        heading: "Park Slope kitchen pricing and timeline",
        paragraphs: [
          "Park Slope kitchens typically run $350 per linear foot for full kitchens, with most projects landing $12,000–$26,000 depending on size, finish, and stone selection. Total timeline is 4–6 weeks from approval to installation. Free in-home consultation, written fixed quote, no design fee.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you work in Park Slope landmarked brownstones?",
        answer:
          "Yes. We routinely work in landmarked Park Slope brownstones. Interior cabinetry generally does not require Landmarks approval, but we work carefully around original moldings, plaster, and historic finishes.",
      },
      {
        question: "Can you match the trim and moldings already in my brownstone?",
        answer:
          "We mill custom face frames, crown moldings, and door profiles to match existing trim. For especially detailed brownstones, we'll take molding samples back to our Bushwick shop and replicate the profile in house.",
      },
      {
        question: "How much does a Park Slope kitchen renovation cost?",
        answer:
          "Cabinetry alone for a Park Slope brownstone typically runs $12,000–$26,000. A full kitchen renovation including stone, plumbing, electrical, and tile usually lands $40,000–$90,000+ depending on scope.",
      },
      {
        question: "Which Park Slope blocks do you serve?",
        answer:
          "All of Park Slope — North Slope, South Slope, the Gold Coast on Prospect Park West, and the brownstone blocks east of 5th Avenue. Zip codes 11215 and 11217.",
      },
    ],
    geo: { latitude: 40.6712, longitude: -73.978 },
  },

  soho: {
    slug: "soho",
    name: "SoHo",
    boroughSlug: "manhattan",
    boroughName: "Manhattan",
    url: `${BASE}/custom-kitchen-cabinets-soho`,
    title: "Custom Kitchen Cabinets in SoHo, Manhattan | Green Cabinets NY",
    description:
      "Custom kitchen cabinets for SoHo cast-iron lofts. Built in Brooklyn, installed with white-glove care. Co-op and condo board experience. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets SoHo, SoHo loft kitchen, SoHo cabinet maker, custom cabinetry SoHo Manhattan, SoHo kitchen renovation, luxury kitchen cabinets SoHo, kitchen cabinets 10012 10013",
    heroTagline:
      "Cast-iron loft kitchens, built with the precision SoHo demands.",
    intro:
      "SoHo's cast-iron loft buildings are some of the most architecturally significant in the country — and some of the most demanding to build cabinetry for. We design and install custom kitchens that respect the loft's column lines, ceiling heights, and cast-iron façade.",
    body: [
      {
        heading: "Cabinetry for SoHo cast-iron lofts",
        paragraphs: [
          "SoHo lofts share a common DNA: 12–14 ft ceilings, exposed cast-iron columns, original tin or pressed-metal ceilings, and column-free spans of 60+ feet. The standard developer kitchen never does these spaces justice. Our custom kitchens for SoHo lofts use the height — double-stacked uppers, glazed display cabinets above, and oversized islands designed to handle entertaining.",
          "We work primarily in inset shaker, slab, and handle-less integrated styles. For SoHo's design-forward clientele, two-tone kitchens (deep navy or charcoal base, natural rift-cut white-oak upper) are especially popular. All cabinets are built in solid hardwood with conversion-varnish finishes, suitable for the heavy daily use these spaces see.",
        ],
      },
      {
        heading: "Co-op and condo board approvals in SoHo",
        paragraphs: [
          "Most SoHo lofts are co-ops or condos with strict alteration agreements. We handle the full paperwork process — COIs, contractor licensing, alteration agreements, building rules — for the major SoHo loft buildings on Greene, Mercer, Wooster, Spring, and Broome. Our installers are experienced with freight-elevator scheduling, building-staff coordination, and the protection requirements for landmarked lobbies.",
        ],
      },
      {
        heading: "SoHo cabinet pricing",
        paragraphs: [
          "Custom kitchen cabinets in SoHo start at $350 per linear foot. A typical SoHo loft kitchen — island, pantry wall, integrated appliances — runs $20,000–$45,000+ depending on materials, hardware, and stone. Free design consultation, fixed quote, no surprises.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you handle SoHo co-op and loft board approvals?",
        answer:
          "Yes. We provide alteration agreement specs, certificates of insurance, contractor licensing, and the full paperwork required by SoHo loft co-op and condo boards. We've worked in most of the major SoHo buildings on Greene, Mercer, Wooster, Broome, and Spring streets.",
      },
      {
        question: "Can you design around cast-iron columns in a SoHo loft?",
        answer:
          "Yes — column-aware design is standard for SoHo. We measure each column individually and detail cabinetry around it, often using the column as a natural separator between kitchen and dining zones.",
      },
      {
        question: "What does a SoHo loft kitchen cost?",
        answer:
          "Cabinetry alone for a SoHo loft kitchen typically runs $20,000–$45,000. Full renovation including stone, appliances, plumbing, and electrical usually falls $80,000–$200,000+ depending on scope.",
      },
      {
        question: "How long does a SoHo kitchen install take?",
        answer:
          "4–6 weeks total: 1–2 weeks design, 2–3 weeks fabrication in our Bushwick shop, and 5–10 days on site in SoHo (longer than Brooklyn projects because of freight-elevator scheduling and building protection requirements).",
      },
    ],
    geo: { latitude: 40.7233, longitude: -74.0019 },
  },

  "long-island-city": {
    slug: "long-island-city",
    name: "Long Island City",
    boroughSlug: "queens",
    boroughName: "Queens",
    url: `${BASE}/custom-kitchen-cabinets-long-island-city`,
    title:
      "Custom Kitchen Cabinets in Long Island City, Queens | Green Cabinets NY",
    description:
      "Custom kitchen cabinets for Long Island City condos and lofts. Built in our nearby Brooklyn shop. New construction and resale upgrades. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets Long Island City, LIC cabinet maker, custom cabinetry Long Island City, LIC condo kitchen renovation, LIC loft kitchen, kitchen cabinets 11101 11109",
    heroTagline:
      "LIC condo and loft kitchens, designed for the way the neighborhood lives now.",
    intro:
      "Long Island City has the fastest-growing residential skyline in NYC. Our Bushwick shop is fifteen minutes away — close enough to handle LIC projects with the same speed and care we bring to Brooklyn.",
    body: [
      {
        heading: "Cabinetry for new-construction LIC condos",
        paragraphs: [
          "Most new LIC towers ship with developer-grade kitchens that don't take advantage of the apartment's potential. Our most common LIC project is a custom upgrade: replacing builder cabinets with full-custom cabinetry, taller wall units that reach the ceiling, integrated appliance panels, custom pantry pull-outs, and a redesigned island that turns the kitchen into the room it should be.",
          "For LIC's open-plan layouts, we lean into sleek slab or handle-less integrated styles in matte lacquer, rift-cut white oak, or our signature painted finishes. Waterfall-edge stone islands, hidden refrigerators, and seamless full-height pantry walls are standard requests.",
        ],
      },
      {
        heading: "Loft conversions and new-construction work",
        paragraphs: [
          "LIC also has a strong stock of converted industrial loft buildings — many along Vernon Boulevard, Jackson Avenue, and 5th Street. These spaces, like SoHo lofts, want oversized islands and double-stacked uppers. We're equipped to design either: a polished modern condo kitchen or a rougher, more architectural loft kitchen.",
          "For LIC developers and architects, we also build to-spec custom cabinetry packages for new-construction units — flat-pack delivery, shop drawings, and on-site install handled by our team.",
        ],
      },
      {
        heading: "LIC kitchen cabinet pricing and timeline",
        paragraphs: [
          "Custom kitchen cabinets in LIC start at $350 per linear foot. Condo upgrades typically run $8,000–$20,000; full-loft kitchens land $18,000–$35,000. Total timeline is 4–6 weeks from approval to installation. Free in-home consultation, fixed quote, no design fee.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you work with LIC condo buildings and their managers?",
        answer:
          "Yes. We provide certificates of insurance, contractor licensing, and alteration agreement paperwork for all the major LIC condo buildings — Hunter's Point, Court Square, Long Island City waterfront. We've worked in most of the larger towers in 11101 and 11109.",
      },
      {
        question: "Can you upgrade a developer-grade kitchen in a new LIC condo?",
        answer:
          "This is one of our most common LIC projects. We replace builder cabinets with full-custom cabinetry, push uppers to the ceiling, add integrated appliance panels and custom pantry pull-outs, and often redesign the island.",
      },
      {
        question: "Do you work with LIC developers on new construction?",
        answer:
          "Yes. We collaborate with LIC developers and architects on new-construction unit packages — built to spec, delivered flat-pack or fully assembled, installed by our team.",
      },
      {
        question: "How much does a Long Island City kitchen cost?",
        answer:
          "Custom cabinetry for an LIC condo typically runs $8,000–$20,000; an LIC loft kitchen falls $18,000–$35,000. Full renovations including stone, appliances, and trades usually land $35,000–$80,000+ depending on scope.",
      },
    ],
    geo: { latitude: 40.7447, longitude: -73.9485 },
  },
};

export const NEIGHBORHOOD_LIST = Object.values(NEIGHBORHOODS);

export const isNeighborhoodSlug = (slug: string): slug is keyof typeof NEIGHBORHOODS =>
  slug in NEIGHBORHOODS;
