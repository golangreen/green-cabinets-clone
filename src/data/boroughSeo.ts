export type BoroughSlug = "brooklyn" | "manhattan" | "queens";

export interface BoroughFaq {
  question: string;
  answer: string;
}

export interface BoroughSeo {
  slug: BoroughSlug;
  name: string;
  shortName: string;
  url: string;
  title: string;
  description: string;
  keywords: string;
  heroTagline: string;
  intro: string;
  neighborhoods: string[];
  faqs: BoroughFaq[];
}

const BASE = "https://greencabinetsny.com";

export const BOROUGHS: Record<BoroughSlug, BoroughSeo> = {
  brooklyn: {
    slug: "brooklyn",
    name: "Brooklyn",
    shortName: "Brooklyn",
    url: `${BASE}/custom-kitchen-cabinets-brooklyn`,
    title:
      "Custom Kitchen Cabinets in Brooklyn, NY | Green Cabinets NY",
    description:
      "Custom kitchen cabinets in Brooklyn, handcrafted in our Bushwick shop since 2009. FSC hardwoods, free in-home consultation.",
    keywords:
      "custom kitchen cabinets Brooklyn, Brooklyn cabinet maker, kitchen cabinetry Brooklyn NY, Bushwick cabinet shop, sustainable cabinets Brooklyn, bathroom vanities Brooklyn",
    heroTagline:
      "Brooklyn-built custom kitchen cabinets, designed to last generations.",
    intro:
      "From Park Slope brownstones to Williamsburg lofts, we design and build custom kitchen cabinetry that fits the way Brooklyn lives.",
    neighborhoods: [
      "Park Slope",
      "Williamsburg",
      "DUMBO",
      "Brooklyn Heights",
      "Carroll Gardens",
      "Bushwick",
      "Greenpoint",
      "Cobble Hill",
      "Bedford-Stuyvesant",
      "Crown Heights",
      "Fort Greene",
      "Prospect Heights",
      "Clinton Hill",
      "Boerum Hill",
      "Gowanus",
      "Red Hook",
      "Sunset Park",
      "Bay Ridge",
      "Flatbush",
      "Windsor Terrace",
    ],
    faqs: [
      {
        question:
          "How much do custom kitchen cabinets cost in Brooklyn?",
        answer:
          "Custom kitchen cabinets in Brooklyn typically run $350 per linear foot for full kitchens, $225/lf for base cabinets, and $125/lf for wall cabinets. A typical Brooklyn kitchen ranges between $8,000 and $25,000+ depending on size, materials, and finish.",
      },
      {
        question:
          "How long does a Brooklyn kitchen cabinet project take?",
        answer:
          "Most Brooklyn projects take 4–6 weeks: 1–2 weeks for design, 2–3 weeks of in-shop fabrication in Bushwick, and 3–7 days for installation in your home.",
      },
      {
        question:
          "Which Brooklyn neighborhoods do you serve?",
        answer:
          "We serve all of Brooklyn including Park Slope, Williamsburg, DUMBO, Brooklyn Heights, Carroll Gardens, Bushwick, Greenpoint, Cobble Hill, and surrounding neighborhoods.",
      },
      {
        question:
          "Do you offer free in-home consultations in Brooklyn?",
        answer:
          "Yes. Every Brooklyn project starts with a complimentary in-home consultation where we measure your space, discuss layout, and review materials and finish options.",
      },
    ],
  },
  manhattan: {
    slug: "manhattan",
    name: "Manhattan",
    shortName: "Manhattan",
    url: `${BASE}/custom-kitchen-cabinets-manhattan`,
    title:
      "Custom Kitchen Cabinets in Manhattan, NY | Green Cabinets NY",
    description:
      "Custom kitchen cabinets in Manhattan built for prewar apartments, lofts, and townhouses. Premium materials, white-glove install, free design consultation.",
    keywords:
      "custom kitchen cabinets Manhattan, Manhattan cabinet maker, kitchen cabinetry NYC, custom cabinets Tribeca, custom cabinets SoHo, Upper East Side cabinets",
    heroTagline:
      "Custom kitchen cabinetry engineered for Manhattan's most demanding spaces.",
    intro:
      "Tight elevators, prewar quirks, and co-op rules — we build and install custom kitchen cabinets across Manhattan with the precision the borough requires.",
    neighborhoods: [
      "Tribeca",
      "SoHo",
      "West Village",
      "Upper East Side",
      "Upper West Side",
      "Harlem",
      "Chelsea",
      "Financial District",
      "East Village",
      "Lower East Side",
      "Greenwich Village",
      "NoHo",
      "Nolita",
      "Gramercy",
      "Murray Hill",
      "Midtown",
      "Hell's Kitchen",
      "Morningside Heights",
      "Washington Heights",
      "Battery Park City",
    ],
    faqs: [
      {
        question:
          "Do you handle Manhattan co-op and condo board approvals?",
        answer:
          "Yes. We regularly provide the documentation, insurance certificates, and alteration agreement specs required by Manhattan co-op and condo boards.",
      },
      {
        question:
          "How much do custom kitchen cabinets cost in Manhattan?",
        answer:
          "Custom kitchen cabinets in Manhattan start at $350 per linear foot for full kitchens. Most Manhattan kitchens range $10,000–$30,000+ depending on layout, materials, and finish complexity.",
      },
      {
        question:
          "Can you install in prewar Manhattan apartments?",
        answer:
          "Absolutely. We specialize in prewar Manhattan kitchens — out-of-square walls, plaster ceilings, and tight service elevators are our daily reality.",
      },
      {
        question:
          "Which Manhattan neighborhoods do you serve?",
        answer:
          "We serve all of Manhattan including Tribeca, SoHo, West Village, Upper East Side, Upper West Side, Harlem, Chelsea, and the Financial District.",
      },
    ],
  },
  queens: {
    slug: "queens",
    name: "Queens",
    shortName: "Queens",
    url: `${BASE}/custom-kitchen-cabinets-queens`,
    title:
      "Custom Kitchen Cabinets in Queens, NY | Green Cabinets NY",
    description:
      "Custom kitchen cabinets in Queens. Sustainable hardwoods, free consultation, install in 4–6 weeks. Call (718) 804-5488.",
    keywords:
      "custom kitchen cabinets Queens, Queens cabinet maker, custom cabinets Astoria, custom cabinets Long Island City, Forest Hills kitchen cabinets, LIC kitchen renovation",
    heroTagline:
      "Custom kitchen cabinets for Queens homes, co-ops, and new construction.",
    intro:
      "From LIC high-rises to Forest Hills Tudors, we deliver custom kitchen cabinetry built to Queens-scale and Queens-budget.",
    neighborhoods: [
      "Long Island City",
      "Astoria",
      "Forest Hills",
      "Sunnyside",
      "Ridgewood",
      "Jackson Heights",
      "Rego Park",
      "Bayside",
      "Flushing",
      "Woodside",
      "Elmhurst",
      "Maspeth",
      "Glendale",
      "Kew Gardens",
      "Middle Village",
      "Whitestone",
      "College Point",
      "Briarwood",
      "Richmond Hill",
      "Howard Beach",
    ],
    faqs: [
      {
        question:
          "How much do custom kitchen cabinets cost in Queens?",
        answer:
          "Custom kitchen cabinets in Queens typically run $350/lf for full kitchens, $225/lf for base cabinets, and $125/lf for wall cabinets. Most Queens kitchens land between $8,000 and $22,000.",
      },
      {
        question:
          "Do you work with new construction in Long Island City?",
        answer:
          "Yes. We collaborate with developers and architects on new-construction LIC condos, providing built-to-spec custom cabinetry packages.",
      },
      {
        question:
          "Which Queens neighborhoods do you serve?",
        answer:
          "We serve all of Queens including Long Island City, Astoria, Forest Hills, Sunnyside, Ridgewood, Jackson Heights, Rego Park, and Bayside.",
      },
      {
        question:
          "How long does installation take in Queens?",
        answer:
          "Plan on 4–6 weeks total: 1–2 weeks design, 2–3 weeks fabrication in our Bushwick shop, and 3–7 days for on-site installation in your Queens home.",
      },
    ],
  },
};

export const BOROUGH_LIST = Object.values(BOROUGHS);
