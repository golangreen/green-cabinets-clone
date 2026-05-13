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
  /** Real Green Cabinets project photos shown on the neighborhood page. Files live in src/assets/gallery/. */
  gallery: { file: string; caption: string }[];
}

const BASE = "https://greencabinetsny.com";

const RAW: Record<string, Omit<NeighborhoodSeo, "gallery">> = {
  bushwick: {
    slug: "bushwick",
    name: "Bushwick",
    boroughSlug: "brooklyn",
    boroughName: "Brooklyn",
    url: `${BASE}/custom-kitchen-cabinets-bushwick`,
    title: "Custom Cabinets in Bushwick, Brooklyn | Green Cabinets NY",
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
      "Custom Cabinets in Williamsburg, Brooklyn | Green Cabinets",
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
      "Custom Cabinets in Park Slope, Brooklyn | Green Cabinets NY",
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
    title: "Custom Cabinets in SoHo, Manhattan | Green Cabinets NY",
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
      "LIC Custom Cabinets, Queens | Green Cabinets NY",
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

  dumbo: {
    slug: "dumbo",
    name: "DUMBO",
    boroughSlug: "brooklyn",
    boroughName: "Brooklyn",
    url: `${BASE}/custom-kitchen-cabinets-dumbo`,
    title: "Custom Cabinets in DUMBO, Brooklyn | Green Cabinets NY",
    description:
      "Custom kitchen cabinets for DUMBO loft conversions and waterfront condos. Built in our Bushwick shop. Co-op and condo board experience. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets DUMBO, DUMBO loft kitchen, DUMBO cabinet maker, custom cabinetry DUMBO Brooklyn, DUMBO condo kitchen renovation, kitchen cabinets 11201",
    heroTagline:
      "Loft and waterfront condo kitchens, designed to live up to a DUMBO view.",
    intro:
      "DUMBO's converted warehouse condos have some of the highest ceilings, biggest windows, and most demanding clients in NYC. Our Bushwick shop is fifteen minutes away — close enough to handle DUMBO projects with the speed and care the buildings require.",
    body: [
      {
        heading: "Cabinetry built for DUMBO loft conversions",
        paragraphs: [
          "Most DUMBO residences are converted 19th-century industrial buildings — Clocktower, J Condo, Sweeney, One Brooklyn Bridge Park, the Front Street and Water Street loft buildings. Ceilings of 11–14 feet, exposed brick, exposed timber, and oversized windows are the norm. The standard developer kitchen never does these spaces justice.",
          "Our DUMBO kitchens use the height. We build double-stacked uppers (real cabinets above the standard 30-inch run, not decorative crown), oversized islands often 10–12 feet long with waterfall-edge stone, integrated panel-front refrigerators and dishwashers, and full-height pantry walls that read as architecture instead of cabinetry.",
          "For DUMBO's design-forward owners we lean into rift-cut white oak, deep matte lacquer, hand-rubbed steel hardware, and two-tone palettes. Inset shaker stays popular for the brick-and-timber lofts; flat slab and integrated handle-less for the more polished waterfront condos.",
        ],
      },
      {
        heading: "Co-op and condo board work in DUMBO",
        paragraphs: [
          "Every DUMBO building has its own alteration agreement, and the larger ones — Clocktower, One Brooklyn Bridge Park, J Condo — have especially strict rules. We handle the full paperwork: certificates of insurance, contractor licensing, alteration agreements, lobby and elevator protection plans. Our installers are experienced with freight-elevator scheduling and the building-staff coordination that DUMBO renovations require.",
        ],
      },
      {
        heading: "DUMBO kitchen pricing",
        paragraphs: [
          "Custom kitchen cabinets in DUMBO start at $350 per linear foot. A typical DUMBO loft kitchen — island, pantry wall, integrated appliances — runs $20,000–$45,000+ depending on materials, hardware, and stone. Free in-home consultation, fixed quote, no design fee.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you handle DUMBO condo board approvals and COIs?",
        answer:
          "Yes. We provide certificates of insurance, contractor licensing, and alteration agreement paperwork for the major DUMBO loft and condo buildings — Clocktower, J Condo, One Brooklyn Bridge Park, Sweeney, and the Front Street and Water Street buildings.",
      },
      {
        question: "Can you design around exposed brick and timber in a DUMBO loft?",
        answer:
          "Yes — historic-loft cabinetry is one of our specialties. We mount cabinets on French cleats or steel sub-frames so we never have to anchor heavily into 19th-century masonry, and we detail end panels to sit cleanly against exposed brick and timber columns.",
      },
      {
        question: "How much does a DUMBO loft kitchen cost?",
        answer:
          "Cabinetry alone for a DUMBO loft kitchen typically runs $20,000–$45,000. Full renovation including stone, appliances, plumbing, and electrical usually falls $80,000–$200,000+ depending on scope.",
      },
      {
        question: "How long does a DUMBO kitchen install take?",
        answer:
          "4–6 weeks total: 1–2 weeks design, 2–3 weeks fabrication in our Bushwick shop, and 5–10 days on site in DUMBO (longer than a typical Brooklyn project because of freight-elevator scheduling and building protection requirements).",
      },
    ],
    geo: { latitude: 40.7033, longitude: -73.9881 },
  },

  "brooklyn-heights": {
    slug: "brooklyn-heights",
    name: "Brooklyn Heights",
    boroughSlug: "brooklyn",
    boroughName: "Brooklyn",
    url: `${BASE}/custom-kitchen-cabinets-brooklyn-heights`,
    title:
      "Custom Cabinets in Brooklyn Heights | Green Cabinets NY",
    description:
      "Custom kitchen cabinets for Brooklyn Heights brownstones, co-ops, and townhouses. Historic-district experience, white-glove install. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets Brooklyn Heights, Brooklyn Heights cabinet maker, Brooklyn Heights brownstone kitchen, historic district cabinetry Brooklyn, kitchen cabinets 11201",
    heroTagline:
      "Heritage cabinetry for Brooklyn Heights brownstones and pre-war co-ops.",
    intro:
      "Brooklyn Heights was NYC's first designated Historic District (1965). Many of its 19th-century townhouses still have original moldings, plaster ceilings, and out-of-square corners — exactly the homes our shop was built to work in.",
    body: [
      {
        heading: "Brownstone and townhouse cabinetry, done with care",
        paragraphs: [
          "Brooklyn Heights' housing stock — Greek Revival, Italianate, and Federal townhouses from the 1820s–1880s — is some of the oldest and best-preserved in NYC. Working in these homes is half cabinetry, half restoration. We mill custom face frames, crown profiles, and door details to match existing trim, and we work around plaster, original wood floors, and architectural detail without damaging them.",
          "Most Brooklyn Heights kitchens we build are inset shaker, painted in heritage colors — deep forest green, navy, soft cream, off-white — with traditional bead detail, cup pulls, and visible hinges that read as period-appropriate hardware rather than modern fixtures.",
        ],
      },
      {
        heading: "Co-op and condo work in the Heights",
        paragraphs: [
          "For the larger Brooklyn Heights pre-war co-ops — including buildings on Pierrepont, Montague, Hicks, and Henry — we handle alteration agreements, COIs, and the full board approval process. The 9–10 ft ceilings in these classic-six layouts let us push uppers higher and add display rows that read as architecture.",
        ],
      },
      {
        heading: "Brooklyn Heights kitchen pricing",
        paragraphs: [
          "Custom kitchen cabinets in Brooklyn Heights run $350 per linear foot for full kitchens. Townhouse projects typically land $14,000–$28,000; co-op kitchens fall $10,000–$22,000. Free consultation, fixed quote, no design fee.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you work in the Brooklyn Heights Historic District?",
        answer:
          "Yes — regularly. Interior cabinetry generally does not require Landmarks approval, but we work carefully around original moldings, plaster, and historic finishes, and we'll coordinate with your architect if Landmarks review is needed for any structural change.",
      },
      {
        question: "Can you match original Brooklyn Heights brownstone trim?",
        answer:
          "Yes. We mill custom face frames, crown moldings, and door profiles to match existing 19th-century trim. For especially detailed homes we'll bring molding samples back to our Bushwick shop and replicate the profile in house.",
      },
      {
        question: "How much does a Brooklyn Heights kitchen renovation cost?",
        answer:
          "Cabinetry alone for a Brooklyn Heights brownstone or co-op typically runs $10,000–$28,000. Full renovation including stone, appliances, plumbing, and electrical usually lands $45,000–$110,000+ depending on scope.",
      },
      {
        question: "Which Brooklyn Heights blocks do you serve?",
        answer:
          "All of Brooklyn Heights — the historic district from Atlantic Avenue to the Brooklyn Bridge, including Pierrepont, Montague, Hicks, Henry, Joralemon, Willow, and Columbia Heights. Zip code 11201.",
      },
    ],
    geo: { latitude: 40.696, longitude: -73.9933 },
  },

  tribeca: {
    slug: "tribeca",
    name: "Tribeca",
    boroughSlug: "manhattan",
    boroughName: "Manhattan",
    url: `${BASE}/custom-kitchen-cabinets-tribeca`,
    title: "Custom Cabinets in Tribeca, Manhattan | Green Cabinets NY",
    description:
      "Custom kitchen cabinets for Tribeca lofts and luxury condos. Cast-iron and column-aware design, white-glove install, board approval experience. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets Tribeca, Tribeca loft kitchen, Tribeca cabinet maker, luxury kitchen cabinets Tribeca, custom cabinetry Tribeca Manhattan, kitchen cabinets 10013",
    heroTagline:
      "Tribeca loft kitchens, built with the precision a 14-foot ceiling deserves.",
    intro:
      "Tribeca has the highest concentration of cast-iron loft buildings in the world — and some of the most demanding kitchens we build. Column-free spans, 12–14 ft ceilings, and clients who notice every reveal.",
    body: [
      {
        heading: "Cabinetry for Tribeca lofts and luxury condos",
        paragraphs: [
          "The classic Tribeca residence is a 2,500–5,000 sq ft loft in a converted 19th-century cast-iron warehouse — Franklin, White, Walker, Hudson, Greenwich, Reade, Duane. Long column-free spans let us design true 12–14 ft galley runs, oversized islands with seating for six, full-height pantry walls, and integrated appliance fronts that disappear into the cabinetry.",
          "Tribeca clients tend to be experienced renovators with strong design opinions. Our work skews toward inset shaker in painted hardwood, slab in rift-cut white oak, and handle-less integrated styles in matte lacquer. Two-tone kitchens (deep navy or charcoal base, natural oak upper) are especially popular, often paired with hand-rubbed bronze or polished nickel hardware.",
          "All cabinets are built in solid hardwood with conversion-varnish or two-component polyurethane finishes — durable enough for daily use in a kitchen that will see heavy entertaining.",
        ],
      },
      {
        heading: "Loft board and condo approvals in Tribeca",
        paragraphs: [
          "Tribeca lofts are almost always co-ops or condos with strict alteration agreements. We handle the full paperwork — COIs, contractor licensing, alteration agreements, building rules, lobby and elevator protection — for the major Tribeca loft buildings. Our installers are experienced with the freight-elevator scheduling and building-staff coordination Tribeca renovations require.",
        ],
      },
      {
        heading: "Tribeca kitchen pricing",
        paragraphs: [
          "Custom kitchen cabinets in Tribeca start at $350 per linear foot. A full Tribeca loft kitchen — island, pantry wall, integrated appliances, premium hardware — typically runs $25,000–$60,000+ depending on materials and finish complexity. Free design consultation, fixed quote.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you handle Tribeca loft co-op and condo board approvals?",
        answer:
          "Yes. We provide alteration agreement specs, certificates of insurance, contractor licensing, and the full paperwork required by Tribeca loft co-op and condo boards. We've worked in most of the major buildings on Franklin, White, Walker, Hudson, Greenwich, Reade, and Duane.",
      },
      {
        question: "Can you design around cast-iron columns in a Tribeca loft?",
        answer:
          "Yes — column-aware design is standard for Tribeca. We measure each column individually and detail cabinetry around it, often using the column as a natural separator between kitchen and dining zones.",
      },
      {
        question: "What does a Tribeca loft kitchen cost?",
        answer:
          "Cabinetry alone for a Tribeca loft kitchen typically runs $25,000–$60,000. Full renovation including stone, appliances, plumbing, electrical, and trades usually falls $100,000–$300,000+ depending on scope.",
      },
      {
        question: "How long does a Tribeca kitchen install take?",
        answer:
          "4–7 weeks total: 1–2 weeks design, 2–3 weeks fabrication in our Bushwick shop, and 7–14 days on site in Tribeca (longer than a Brooklyn project because of freight-elevator scheduling and building protection requirements).",
      },
    ],
    geo: { latitude: 40.7163, longitude: -74.0086 },
  },

  "upper-east-side": {
    slug: "upper-east-side",
    name: "Upper East Side",
    boroughSlug: "manhattan",
    boroughName: "Manhattan",
    url: `${BASE}/custom-kitchen-cabinets-upper-east-side`,
    title:
      "Custom Cabinets, Upper East Side NYC | Green Cabinets",
    description:
      "Custom kitchen cabinets for Upper East Side pre-war co-ops and townhouses. Inset painted cabinetry, board-approved installs. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets Upper East Side, UES cabinet maker, Upper East Side pre-war kitchen, custom cabinetry UES, kitchen cabinets 10021 10028 10075 10128",
    heroTagline:
      "Pre-war Upper East Side kitchens, built to look like they have always been there.",
    intro:
      "The Upper East Side's pre-war co-ops are some of the most architecturally significant apartments in the country. Their classic-six layouts, 9–10 ft ceilings, and original detail are exactly what our inset painted cabinetry is built for.",
    body: [
      {
        heading: "Pre-war co-op cabinetry, done correctly",
        paragraphs: [
          "Most Upper East Side kitchens we work in are in pre-war co-op buildings on Park, Fifth, Madison, Lexington, and East End — many built between 1900 and 1930 and still managed by the same boards that ran them seventy years ago. The original kitchens are typically tucked at the back of the apartment, often with an adjoining maid's room or service entrance.",
          "Our work here focuses on inset shaker cabinets in painted hardwood — heritage colors like off-white, soft cream, deep navy, and forest green — with traditional bead detail, cup pulls, and visible hinges. We mill face frames and crown moldings to match existing apartment trim so the new kitchen reads as original to the building. Where the layout allows, we also convert former maid's rooms into full pantries with floor-to-ceiling cabinetry.",
        ],
      },
      {
        heading: "UES co-op and condo board experience",
        paragraphs: [
          "Upper East Side co-op boards are among the most demanding in the country. We provide alteration agreement specs, certificates of insurance, contractor licensing, lobby and elevator protection plans, and the full paperwork the larger buildings require. We've worked in pre-war co-ops on Park, Fifth, Madison, and East End — and we know the building managers and supers in many of them.",
        ],
      },
      {
        heading: "Upper East Side kitchen pricing",
        paragraphs: [
          "Custom kitchen cabinets in the Upper East Side start at $350 per linear foot. A typical UES classic-six kitchen runs $14,000–$32,000 depending on size, finish, and pantry scope. Townhouse projects can run higher. Free in-home consultation, fixed quote, no design fee.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you handle Upper East Side co-op board approvals?",
        answer:
          "Yes — daily. We provide alteration agreement specs, COIs, contractor licensing, lobby and elevator protection plans, and the full paperwork required by UES pre-war co-op boards.",
      },
      {
        question: "Can you match original pre-war moldings and trim?",
        answer:
          "Yes. We mill custom face frames, crown moldings, and door profiles to match existing apartment trim — including the heavier crown and base details typical of pre-war Park and Fifth Avenue buildings.",
      },
      {
        question: "Can you convert a maid's room into a pantry?",
        answer:
          "We've done dozens. Former maid's rooms become full walk-in pantries with floor-to-ceiling cabinetry, drawer banks, integrated lighting, and counter space for second prep zones.",
      },
      {
        question: "Which Upper East Side blocks do you serve?",
        answer:
          "All of the Upper East Side — Lenox Hill, Carnegie Hill, Yorkville, the Gold Coast on Fifth and Park. Zip codes 10021, 10028, 10065, 10075, and 10128.",
      },
    ],
    geo: { latitude: 40.7736, longitude: -73.9566 },
  },

  astoria: {
    slug: "astoria",
    name: "Astoria",
    boroughSlug: "queens",
    boroughName: "Queens",
    url: `${BASE}/custom-kitchen-cabinets-astoria`,
    title: "Custom Cabinets in Astoria, Queens | Green Cabinets NY",
    description:
      "Custom kitchen cabinets for Astoria rowhouses, co-ops, and condos. Built in our nearby Brooklyn shop. Free in-home consultation. (718) 804-5488.",
    keywords:
      "custom kitchen cabinets Astoria, Astoria cabinet maker, Astoria Queens kitchen renovation, custom cabinetry Astoria, kitchen cabinets 11102 11103 11105 11106",
    heroTagline:
      "Astoria rowhouse, co-op, and condo kitchens — built for the way the neighborhood cooks.",
    intro:
      "Astoria has one of the most diverse food cultures in the country, and kitchens here have to work hard. Our Bushwick shop is twenty minutes away — close enough to handle Astoria projects with the same speed and care we bring to Brooklyn.",
    body: [
      {
        heading: "Cabinetry built for how Astoria lives",
        paragraphs: [
          "Astoria's housing mix is unusually broad: brick attached rowhouses (most built 1920s–1940s), pre-war and post-war co-ops, two- and three-family homes, and a growing wave of new-construction condos. Each calls for a different cabinetry approach, and we build for all of them.",
          "Many of our Astoria clients cook constantly — extended-family meals, multiple ovens, dedicated baking zones, large pantries. We design for that. Floor-to-ceiling pantries with deep pull-outs, double-oven configurations, oversized drawer banks for pots and serving pieces, and durable conversion-varnish finishes that hold up to daily use.",
          "Style-wise, Astoria is a mix. Rowhouse owners often want classic shaker in painted hardwood; condo owners lean modern slab or handle-less integrated; pre-war co-op owners want inset cabinets that respect the building's age.",
        ],
      },
      {
        heading: "Rowhouse, co-op, and condo work",
        paragraphs: [
          "For Astoria rowhouses we typically open the kitchen up to the dining room, add a peninsula or small island, and push uppers to the ceiling for storage. For co-ops and condos — including buildings in 11102, 11103, 11105, and 11106 — we handle COIs, alteration agreements, and the typical board approval process.",
        ],
      },
      {
        heading: "Astoria kitchen cabinet pricing",
        paragraphs: [
          "Custom kitchen cabinets in Astoria run $350 per linear foot for full kitchens. Most Astoria rowhouse kitchens land $10,000–$22,000; co-op and condo kitchens fall $8,000–$18,000. Free in-home consultation, written fixed quote, no design fee.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you work in Astoria rowhouses and two-family homes?",
        answer:
          "Yes — these are some of our most common Astoria projects. We open kitchens up to dining rooms, add islands or peninsulas where space allows, and design floor-to-ceiling storage for the way Astoria families actually cook.",
      },
      {
        question: "Do you handle Astoria co-op and condo board approvals?",
        answer:
          "Yes. We provide certificates of insurance, alteration agreement paperwork, and contractor licensing for Astoria co-op and condo buildings throughout 11102, 11103, 11105, and 11106.",
      },
      {
        question: "How much does an Astoria kitchen cost?",
        answer:
          "Cabinetry alone for an Astoria kitchen typically runs $8,000–$22,000. Full renovation including stone, appliances, plumbing, and electrical usually lands $30,000–$70,000+ depending on scope.",
      },
      {
        question: "Which Astoria areas do you serve?",
        answer:
          "All of Astoria — Old Astoria, Ditmars-Steinway, Astoria Heights, and the rowhouse and condo blocks throughout 11102, 11103, 11105, and 11106.",
      },
    ],
    geo: { latitude: 40.772, longitude: -73.9302 },
  },
};

/**
 * Real Green Cabinets project photography for each neighborhood. Captions describe
 * the cabinetry style, not specific addresses (we don't tag photos by street).
 * Files must exist in src/assets/gallery/.
 */
const GALLERIES: Record<string, NeighborhoodSeo["gallery"]> = {
  bushwick: [
    { file: "two-tone-kitchen-island.jpg", caption: "Two-tone shaker kitchen with custom island" },
    { file: "kitchen-construction-two-tone-cabinets.jpeg", caption: "Two-tone cabinetry mid-install in our Bushwick shop" },
    { file: "modern-kitchen-dark-island.jpg", caption: "Modern kitchen with deep-tone island" },
    { file: "two-tone-kitchen-wide.jpg", caption: "Wide-format two-tone kitchen with painted base cabinets" },
    { file: "contemporary-wood-cabinets.jpg", caption: "Natural wood contemporary cabinetry" },
    { file: "dark-modern-kitchen.jpg", caption: "Dark modern kitchen, full custom build" },
  ],
  williamsburg: [
    { file: "loft-kitchen-exposed-brick-natural-wood.jpeg", caption: "Loft kitchen with exposed brick and natural wood cabinetry" },
    { file: "modern-white-wood-island-kitchen.jpg", caption: "Modern kitchen with white cabinets and wood island" },
    { file: "contemporary-white-kitchen-marble-island.webp", caption: "Contemporary white kitchen with marble island" },
    { file: "contemporary-white-gray-kitchen.jpeg", caption: "Two-tone gray and white contemporary kitchen" },
    { file: "modern-kitchen-dark-island.jpg", caption: "Modern kitchen with dark island and integrated appliances" },
  ],
  "park-slope": [
    { file: "classic-white-kitchen.jpg", caption: "Classic white shaker kitchen for a brownstone parlor floor" },
    { file: "green-kitchen-marble-island.png", caption: "Sage green inset shaker kitchen with marble island" },
    { file: "green-open-concept-kitchen.png", caption: "Open-concept green kitchen, brownstone renovation" },
    { file: "kitchen-traditional.jpg", caption: "Traditional inset cabinetry with period detail" },
    { file: "kitchen-fireplace.jpg", caption: "Brownstone kitchen with original fireplace integrated" },
    { file: "white-kitchen-glass-pendants.jpeg", caption: "White inset kitchen with glass pendant lighting" },
  ],
  soho: [
    { file: "marble-wood-kitchen-island.jpg", caption: "Loft kitchen with rift-cut white oak and marble island" },
    { file: "modern-kitchen-dark-island.jpg", caption: "Two-tone loft kitchen with dark island" },
    { file: "contemporary-wood-cabinets.jpg", caption: "Custom natural wood cabinetry for a SoHo loft" },
    { file: "dark-modern-kitchen.jpg", caption: "Modern dark kitchen with integrated appliance fronts" },
    { file: "two-tone-kitchen-wide.jpg", caption: "Wide-format two-tone loft kitchen" },
    { file: "contemporary-white-kitchen-marble-island.webp", caption: "Contemporary white kitchen with full marble island" },
  ],
  "long-island-city": [
    { file: "modern-white-wood-island-kitchen.jpg", caption: "Modern condo kitchen with wood island" },
    { file: "white-kitchen-island-cabinets.jpg", caption: "White cabinetry condo kitchen with custom island" },
    { file: "contemporary-white-gray-kitchen.jpeg", caption: "Contemporary gray-and-white condo kitchen" },
    { file: "white-wood-island-side-view.jpg", caption: "Side view, white kitchen with wood island detail" },
    { file: "contemporary-white-kitchen-marble-island.webp", caption: "Contemporary kitchen with marble waterfall island" },
  ],
  dumbo: [
    { file: "loft-kitchen-exposed-brick-natural-wood.jpeg", caption: "DUMBO-style loft kitchen with exposed brick" },
    { file: "marble-wood-kitchen-island.jpg", caption: "Loft kitchen with white oak and marble island" },
    { file: "dark-modern-kitchen.jpg", caption: "Dark modern loft kitchen" },
    { file: "two-tone-kitchen-island.jpg", caption: "Two-tone island in a converted warehouse loft" },
    { file: "modern-kitchen-dark-island.jpg", caption: "Loft kitchen with dark island and integrated appliances" },
    { file: "kitchen-construction-two-tone-cabinets.jpeg", caption: "Two-tone cabinetry mid-build in our shop" },
  ],
  "brooklyn-heights": [
    { file: "classic-white-kitchen.jpg", caption: "Classic white inset shaker for a Brooklyn Heights townhouse" },
    { file: "kitchen-traditional.jpg", caption: "Traditional cabinetry detailed to match historic trim" },
    { file: "green-kitchen-marble-island.png", caption: "Heritage green kitchen with marble island" },
    { file: "white-kitchen-glass-pendants.jpeg", caption: "White inset kitchen, pre-war co-op" },
    { file: "kitchen-fireplace.jpg", caption: "Townhouse kitchen with restored fireplace" },
    { file: "marble-countertop-kitchen.jpg", caption: "Painted shaker kitchen with full marble counters" },
  ],
  tribeca: [
    { file: "marble-wood-kitchen-island.jpg", caption: "Tribeca loft kitchen with rift-cut oak and marble island" },
    { file: "luxury-kitchen-marble-dining.jpeg", caption: "Luxury loft kitchen with full marble dining area" },
    { file: "modern-kitchen-dark-island.jpg", caption: "Two-tone loft kitchen with dark island" },
    { file: "contemporary-white-kitchen-marble-island.webp", caption: "Contemporary white kitchen with marble waterfall island" },
    { file: "dark-modern-kitchen.jpg", caption: "Dark modern loft kitchen with integrated panels" },
    { file: "loft-kitchen-exposed-brick-natural-wood.jpeg", caption: "Loft kitchen with exposed brick and natural wood" },
  ],
  "upper-east-side": [
    { file: "classic-white-kitchen.jpg", caption: "Classic white inset shaker for a pre-war co-op" },
    { file: "white-kitchen-glass-pendants.jpeg", caption: "Pre-war kitchen with glass pendants and inset cabinets" },
    { file: "kitchen-traditional.jpg", caption: "Traditional inset cabinetry, painted hardwood" },
    { file: "green-open-concept-kitchen.png", caption: "Heritage green inset kitchen for a classic six" },
    { file: "marble-countertop-kitchen.jpg", caption: "Painted shaker kitchen with full marble counters" },
    { file: "kitchen-fireplace.jpg", caption: "Pre-war kitchen with original architectural detail" },
  ],
  astoria: [
    { file: "classic-white-kitchen.jpg", caption: "Classic white shaker for an Astoria rowhouse" },
    { file: "contemporary-white-gray-kitchen.jpeg", caption: "Two-tone gray-and-white contemporary kitchen" },
    { file: "modern-white-wood-island-kitchen.jpg", caption: "Modern condo kitchen with wood island" },
    { file: "white-kitchen-island-cabinets.jpg", caption: "White cabinetry kitchen with custom island" },
    { file: "two-tone-kitchen-island.jpg", caption: "Two-tone shaker kitchen with painted island" },
  ],
};

export const NEIGHBORHOODS: Record<string, NeighborhoodSeo> = Object.fromEntries(
  Object.entries(RAW).map(([slug, data]) => [
    slug,
    { ...data, gallery: GALLERIES[slug] ?? [] },
  ]),
);

export const NEIGHBORHOOD_LIST = Object.values(NEIGHBORHOODS);

export const isNeighborhoodSlug = (slug: string): boolean => slug in NEIGHBORHOODS;

