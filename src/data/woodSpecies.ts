/**
 * Wood species reference data for Green Cabinets NY.
 * Used by /wood-species (index + compare) and /wood-species/:slug (detail).
 *
 * Janka hardness values are sourced from the USDA Forest Products Lab
 * "Wood Handbook" (FPL-GTR-282) and reflect lbf for side hardness on
 * dry, kiln-conditioned lumber. Costs are relative to 4/4 FAS hardwood
 * pricing in the NYC market and refresh annually.
 */

import mapleImg from "@/assets/wood/maple.jpg";
import walnutImg from "@/assets/wood/walnut.jpg";
import whiteOakImg from "@/assets/wood/white-oak.jpg";
import redOakImg from "@/assets/wood/red-oak.jpg";
import birchImg from "@/assets/wood/birch.jpg";
import cherryImg from "@/assets/wood/cherry.jpg";
import hickoryImg from "@/assets/wood/hickory.jpg";
import ashImg from "@/assets/wood/ash.jpg";
import mahoganyImg from "@/assets/wood/mahogany.jpg";
import alderImg from "@/assets/wood/alder.jpg";
import beechImg from "@/assets/wood/beech.jpg";

export type CostTier = "$" | "$$" | "$$$" | "$$$$";
export type Workability = "Excellent" | "Very Good" | "Good" | "Moderate" | "Difficult";
export type StainTake = "Excellent" | "Very Good" | "Good" | "Tricky" | "Difficult";

export interface WoodSpecies {
  slug: string;
  name: string;
  scientificName: string;
  origin: string;
  /** Short tagline for cards. */
  tagline: string;
  /** One-paragraph overview, ~40 words. */
  shortDescription: string;
  /** Long-form SEO copy, multiple paragraphs. */
  longDescription: string[];
  /** Janka side hardness, lbf (dry). */
  jankaHardness: number;
  /** Specific gravity (oven-dry, 12% MC). */
  specificGravity: number;
  /** Average price tier per board foot in NYC. */
  costTier: CostTier;
  /** Heart color description. */
  color: string;
  /** Grain pattern description. */
  grain: string;
  workability: Workability;
  stainTake: StainTake;
  /** Dimensional stability score 1-5 (5 = most stable). */
  stability: number;
  /** Common uses in cabinetry. */
  uses: string[];
  pros: string[];
  cons: string[];
  /** Best paired finishes / stains. */
  bestFinishes: string[];
  /** Suggested cabinet door styles for this wood. */
  bestDoorStyles: string[];
  /** Hex swatch approximating the species heart color. */
  swatch: string;
  /** Hero/card image (license-free Unsplash hotlink). */
  image: string;
  /** Close-up grain image. */
  grainImage: string;
  /** Optional additional panel shots shown in the detail-page carousel. */
  gallery?: string[];
  /** SEO keywords for the species detail page. */
  keywords: string[];
  /** FAQ entries shown on detail page (also used for FAQPage schema). */
  faqs: { question: string; answer: string }[];
}

export const WOOD_SPECIES: WoodSpecies[] = [
  {
    slug: "maple",
    name: "Maple",
    scientificName: "Acer saccharum (hard maple)",
    origin: "Northeastern U.S. & Canada",
    tagline: "Smooth, pale, and the painter's favorite.",
    shortDescription:
      "Hard maple offers a creamy, almost uniform grain that takes paint and light stains beautifully. It is the workhorse of modern shaker and slab cabinetry across Brooklyn and Manhattan.",
    longDescription: [
      "Hard maple (Acer saccharum) is a dense, closed-pore North American hardwood with a fine, uniform texture and very subtle grain. Sapwood ranges from nearly white to a pale cream, while the heartwood pulls slightly darker with reddish or golden brown tones. Because it lacks dramatic figure, maple reads as clean and contemporary — exactly what most NYC homeowners want from a painted shaker kitchen.",
      "In the shop, maple's tight grain is a double-edged sword: it sands to a glassy surface and accepts conversion varnish or 2K urethane without grain telegraphing, but it can blotch under oil-based stains. We mitigate this with a sanding sealer or a dye-stain base coat before topcoats. For painted cabinets, maple is unmatched — joints stay crisp and the finish remains smooth even after years of use.",
      "Maple's Janka hardness of 1,450 lbf makes it harder than red oak, so doors and drawer fronts resist dents from daily use. It is a smart choice for families, rental units, and any project where the cabinetry will be opened thousands of times a year. It is also one of the more sustainable choices on this list: U.S. hard maple is FSC-certified and harvested in expanding northeastern forests.",
    ],
    jankaHardness: 1450,
    specificGravity: 0.63,
    costTier: "$$",
    color: "Creamy white to pale reddish-brown",
    grain: "Fine, closed, mostly straight with occasional curl",
    workability: "Very Good",
    stainTake: "Tricky",
    stability: 4,
    uses: ["Painted shaker doors", "Slab modern fronts", "Drawer boxes", "Interior shelving"],
    pros: [
      "Excellent paint finish — no grain bleed-through",
      "Hard wearing surface (Janka 1,450)",
      "Affordable and widely available",
      "Sustainable North American species",
    ],
    cons: [
      "Can blotch under oil stains without prep",
      "Yellows slightly with UV over time when clear-coated",
      "Less dramatic grain than oak or walnut",
    ],
    bestFinishes: ["Brilliant White paint", "Sage green paint", "Light natural lacquer", "Dye-stained gray"],
    bestDoorStyles: ["Shaker", "Slim Shaker", "Slab", "Beaded inset"],
    swatch: "#efe1c6",
    image: mapleImg,
    grainImage: mapleImg,
    keywords: ["maple kitchen cabinets", "painted maple cabinets NYC", "hard maple shaker"],
    faqs: [
      {
        question: "Is maple good for painted kitchen cabinets?",
        answer:
          "Yes — maple is the industry-standard substrate for painted cabinets because its tight, closed grain stays smooth under paint and does not telegraph through the topcoat the way oak or ash does.",
      },
      {
        question: "How does maple compare to oak for durability?",
        answer:
          "Hard maple is denser than red oak (Janka 1,450 vs 1,290 lbf), so it resists dents slightly better, but oak's open grain hides scratches more forgivingly over time.",
      },
    ],
  },
  {
    slug: "walnut",
    name: "American Walnut",
    scientificName: "Juglans nigra",
    origin: "Eastern & Midwestern U.S.",
    tagline: "Rich chocolate tones with quiet luxury.",
    shortDescription:
      "Black walnut is the prestige hardwood of American cabinetmaking — deep brown heartwood, gentle figure, and a soft, hand-finished feel that elevates any kitchen, library, or vanity.",
    longDescription: [
      "American black walnut (Juglans nigra) is the only commercially harvested dark hardwood native to North America. Heartwood is a deep chocolate brown often streaked with purple, gray, or violet undertones, while the sapwood is creamy yellow. Most premium millwork specifies steamed walnut, which evens out the contrast between heart and sap so doors and panels read as a single warm tone.",
      "Walnut works beautifully — it cuts cleanly, glues well, and finishes to a soft luster with minimal effort. Its medium density (Janka 1,010 lbf) makes it kind on tooling and on the wallet of a custom shop, but it is not the toughest hardwood here. We recommend walnut for upper cabinets, vanities, libraries, and feature islands rather than heavily-used base runs in busy households.",
      "Walnut darkens slightly with age and then mellows toward a golden brown after years of UV exposure — the opposite of cherry's reddening patina. For NYC clients we typically specify a hardwax oil or matte conversion varnish to preserve that natural depth without adding plastic-looking sheen. Pair walnut with brushed brass, antique bronze, or matte black hardware.",
    ],
    jankaHardness: 1010,
    specificGravity: 0.55,
    costTier: "$$$$",
    color: "Deep chocolate brown with purple undertones",
    grain: "Medium, mostly straight, occasional waves and burl",
    workability: "Excellent",
    stainTake: "Excellent",
    stability: 5,
    uses: ["Feature islands", "Library and office millwork", "Vanities", "Slab and shaker doors"],
    pros: [
      "Naturally rich color — no stain required",
      "One of the most dimensionally stable hardwoods",
      "Easy to machine and hand-finish",
      "Reads as luxury without dramatic figure",
    ],
    cons: [
      "Premium price tier (~3-4× maple)",
      "Sapwood-heartwood color contrast must be sorted carefully",
      "Softer than maple or oak — more prone to denting",
    ],
    bestFinishes: ["Hardwax oil (natural)", "Matte conversion varnish", "Rubio Monocoat Pure", "Soft satin lacquer"],
    bestDoorStyles: ["Slab", "Shaker", "Reeded", "Frameless European"],
    swatch: "#5b3a29",
    image: walnutImg,
    grainImage: walnutImg,
    keywords: ["walnut kitchen cabinets NYC", "custom walnut cabinetry", "black walnut vanity"],
    faqs: [
      {
        question: "Why is walnut more expensive than other woods?",
        answer:
          "Walnut grows slowly, yields are limited per log because of sapwood, and demand for dark domestic hardwoods has stayed strong. Expect walnut cabinetry to run 2–3× the cost of maple of equivalent construction.",
      },
      {
        question: "Does walnut fade in sunlight?",
        answer:
          "Yes — walnut lightens with prolonged UV exposure, mellowing toward a warmer golden brown over 5–10 years. A UV-protective topcoat slows but does not stop this natural aging.",
      },
    ],
  },
  {
    slug: "white-oak",
    name: "White Oak",
    scientificName: "Quercus alba",
    origin: "Eastern U.S.",
    tagline: "The defining wood of modern American kitchens.",
    shortDescription:
      "White oak combines visible cathedral grain, exceptional hardness, and a cool tan tone that takes everything from rift-cut natural finishes to Belgian-inspired smoked stains.",
    longDescription: [
      "White oak (Quercus alba) has dominated high-end American kitchen design for the last decade — and for good reason. The wood is significantly harder than red oak (Janka 1,360 lbf), more dimensionally stable, and its closed pore structure makes it watertight enough to have built ships and whiskey barrels for centuries. In a kitchen, that translates to rock-solid drawer fronts and panels that stay flat through New York's humid summers and dry winters.",
      "Cut matters with white oak. Plain-sawn lumber shows the dramatic cathedral arches you see in farmhouse kitchens; rift-sawn produces tight, ruler-straight lines for modern slab fronts; quartersawn reveals the iridescent ray fleck favored in Mission and Greene & Greene work. We typically specify rift-and-quartered for contemporary projects so adjacent doors look consistent.",
      "White oak's slightly olive base tone makes it the chameleon of the stain world. It is the foundation for the fumed and smoked finishes popularized by Belgian and Scandinavian designers, the reactive iron-acetate finishes that turn it dark gray, and the natural hardwax-oil look that has defined post-2018 American kitchens. It also paints beautifully when grain texture is desired beneath the color.",
    ],
    jankaHardness: 1360,
    specificGravity: 0.68,
    costTier: "$$$",
    color: "Light to medium tan with olive undertones",
    grain: "Open-pored, prominent cathedral or straight rift",
    workability: "Good",
    stainTake: "Excellent",
    stability: 4,
    uses: ["Rift-cut slab fronts", "Shaker bases", "Open shelving", "Floors and ceilings to match"],
    pros: [
      "Exceptional hardness and stability",
      "Takes reactive, fumed, and pigment stains beautifully",
      "Highly weather-resistant (closed tyloses)",
      "On-trend for modern, transitional, and traditional kitchens",
    ],
    cons: [
      "Open grain shows under paint without filling",
      "Rift-and-quartered cuts cost ~30% more than plain-sawn",
      "Tannins can react with metal fasteners and some finishes",
    ],
    bestFinishes: ["Hardwax oil natural", "Fumed/smoked", "Cerused white", "Reactive iron-acetate"],
    bestDoorStyles: ["Slab (rift-cut)", "Shaker", "Reeded", "Beaded inset"],
    swatch: "#c9a877",
    image: whiteOakImg,
    grainImage: whiteOakImg,
    keywords: ["white oak kitchen cabinets", "rift cut white oak NYC", "fumed oak cabinets"],
    faqs: [
      {
        question: "What is the difference between rift, quarter, and plain-sawn white oak?",
        answer:
          "Plain-sawn shows wide cathedral arches, rift-sawn shows narrow vertical lines, and quartersawn reveals the medullary ray fleck. Rift is the most consistent for door-to-door matching on modern cabinets.",
      },
      {
        question: "Can white oak be painted?",
        answer:
          "Yes, but its open pores telegraph through paint unless filled with a grain filler. Many designers leave the grain visible under paint as a feature rather than fighting it.",
      },
    ],
  },
  {
    slug: "red-oak",
    name: "Red Oak",
    scientificName: "Quercus rubra",
    origin: "Eastern & Midwestern U.S.",
    tagline: "Familiar, affordable, and unmistakably American.",
    shortDescription:
      "Red oak's pinkish heartwood and pronounced cathedral grain defined American kitchens for half a century. Modern stains and rift cuts have brought it roaring back as a budget-friendly white oak alternative.",
    longDescription: [
      "Red oak (Quercus rubra) is the most widely harvested hardwood in North America and was the default cabinet wood from the 1970s through the early 2000s. Its grain is bolder and more open than white oak, with a pinkish-red cast in the heartwood. After a long fall from fashion it has returned, partly because it costs roughly 25–30% less than white oak and partly because designers are revisiting honey-toned mid-century kitchens.",
      "Workability is excellent — red oak machines, glues, and stains predictably. Its open grain accepts pigment stains so deeply that you can shift it to nearly any tone, from limed bone-white to espresso. The same open structure means it should not be used for wine racks or anything that holds liquid (white oak's closed pores are watertight, red oak's are not).",
      "For modern projects we recommend rift-cut red oak with a clear hardwax oil — the look is closer to vintage Scandinavian than to 1990s builder-grade kitchens. For traditional jobs, a pigment stain plus glaze gives that classic warm farmhouse feel.",
    ],
    jankaHardness: 1290,
    specificGravity: 0.63,
    costTier: "$$",
    color: "Pinkish to reddish-brown",
    grain: "Open-pored, very prominent cathedral",
    workability: "Very Good",
    stainTake: "Excellent",
    stability: 3,
    uses: ["Traditional shaker", "Mid-century modern slab", "Painted bases with grain texture"],
    pros: [
      "Most affordable premium domestic hardwood",
      "Takes any stain color predictably",
      "Strong, hard, and easy to repair",
      "Abundant supply, stable lead times",
    ],
    cons: [
      "Open grain is not watertight — avoid for wet zones",
      "Pinkish undertone can clash with cool palettes",
      "Less dimensionally stable than white oak",
    ],
    bestFinishes: ["Honey stain + matte topcoat", "Limed white", "Espresso pigment", "Cerused gray"],
    bestDoorStyles: ["Shaker", "Raised panel", "Slab (rift-cut)"],
    swatch: "#b07555",
    image: redOakImg,
    grainImage: redOakImg,
    keywords: ["red oak cabinets NYC", "affordable oak kitchen", "rift red oak"],
    faqs: [
      {
        question: "Is red oak cheaper than white oak?",
        answer:
          "Yes — red oak typically runs 20–30% less per board foot than white oak in the NYC market and has better availability for tight lead times.",
      },
    ],
  },
  {
    slug: "birch",
    name: "Birch",
    scientificName: "Betula alleghaniensis (yellow birch)",
    origin: "Northeastern U.S. & Canada",
    tagline: "Affordable, paint-ready, and surprisingly strong.",
    shortDescription:
      "Yellow birch offers maple-like density at a more accessible price. Its subtle grain finishes smooth under paint and takes a range of warm stains, making it the value pick for shaker and slab cabinetry.",
    longDescription: [
      "Yellow birch (Betula alleghaniensis) is the unsung hero of value-conscious custom cabinetry. It is nearly as hard as hard maple (Janka 1,260 lbf), shares maple's fine, closed grain, and costs 15–25% less. Heartwood is a warm yellowish brown with occasional reddish streaks; sapwood is a creamy white that resembles maple.",
      "Birch plywood is the gold standard for cabinet boxes and drawer interiors in the U.S. — it sands flat, takes screws and glue exceptionally well, and is dimensionally stable enough for full-depth shelving. Most American cabinet shops, including ours, build cases out of either Baltic birch or domestic prefinished birch ply.",
      "For show surfaces, solid birch paints beautifully and accepts gel stains, but plain pigment stains can blotch — pre-conditioning is essential. Birch is a strong choice for budget-conscious renovations that still want solid wood doors rather than thermofoil or MDF.",
    ],
    jankaHardness: 1260,
    specificGravity: 0.62,
    costTier: "$$",
    color: "Creamy white sap, light yellow-brown heart",
    grain: "Fine, closed, mostly straight with subtle curl",
    workability: "Very Good",
    stainTake: "Tricky",
    stability: 3,
    uses: ["Painted doors", "Cabinet boxes (plywood)", "Drawer fronts", "Budget shaker"],
    pros: [
      "Maple-like density at a lower price",
      "Excellent paint finish",
      "Strong and screw-friendly",
      "Best plywood substrate for cabinet construction",
    ],
    cons: [
      "Blotches under oil-based stains without prep",
      "Yellows under UV exposure",
      "Less dramatic grain than oak",
    ],
    bestFinishes: ["White or sage paint", "Gel stain medium walnut", "Light natural lacquer"],
    bestDoorStyles: ["Shaker", "Slim Shaker", "Slab"],
    swatch: "#e8d3a8",
    image: birchImg,
    grainImage: birchImg,
    keywords: ["birch cabinets NYC", "affordable shaker cabinets", "baltic birch plywood"],
    faqs: [
      {
        question: "What is Baltic birch plywood and why is it preferred?",
        answer:
          "Baltic birch is multi-ply European birch with no internal voids and consistent thin laminations. It is stiffer, screw-holds better, and finishes more cleanly than typical domestic plywood — the standard for premium cabinet boxes and drawer construction.",
      },
    ],
  },
  {
    slug: "cherry",
    name: "Cherry",
    scientificName: "Prunus serotina",
    origin: "Eastern U.S.",
    tagline: "Patinas to a deep amber with age.",
    shortDescription:
      "American black cherry begins as a soft pinkish blonde and matures over months into a glowing reddish-amber. It is the heritage hardwood of Shaker and Federal furniture, prized for its silky finish.",
    longDescription: [
      "American black cherry (Prunus serotina) is one of the most personality-rich woods in North American cabinetry. Freshly milled cherry is a pale pink-brown that looks almost ordinary; within 6–12 months of UV exposure it transforms into a deep reddish-amber that designers call its 'patina.' Many cherry kitchens are intentionally photographed before installation because the wood looks meaningfully different by year two.",
      "Cherry is moderately hard (Janka 950 lbf) and exceptionally easy to machine. It cuts cleanly, sands without fuzz, and finishes to a glassy luster with nothing more than oil and wax. It is the wood the Shakers used for built-ins and the Federal cabinetmakers used for their finest casework.",
      "Modern uses lean traditional — raised-panel doors, beaded inset, and library casework — but minimalist slab cherry vanities have made a quiet comeback. Pair with brushed nickel or aged brass; avoid cool grays, which fight cherry's warm patina.",
    ],
    jankaHardness: 950,
    specificGravity: 0.5,
    costTier: "$$$",
    color: "Pale pink-blonde aging to deep reddish amber",
    grain: "Fine, closed, straight with occasional curl or pin knots",
    workability: "Excellent",
    stainTake: "Tricky",
    stability: 4,
    uses: ["Raised panel doors", "Library and built-ins", "Beaded inset cabinets", "Heirloom furniture"],
    pros: [
      "Develops a unique amber patina over time",
      "Silky-smooth finish with minimal sanding",
      "Excellent dimensional stability",
      "Heritage American species",
    ],
    cons: [
      "Color shift can surprise clients (sample with patina)",
      "Blotches under stains without conditioner",
      "Softer than oak or maple — gentler use",
    ],
    bestFinishes: ["Hand-rubbed oil/wax", "Clear satin lacquer", "Light natural stain (no pigment)"],
    bestDoorStyles: ["Raised panel", "Beaded inset", "Shaker", "Slab"],
    swatch: "#9a4f30",
    image: cherryImg,
    grainImage: cherryImg,
    keywords: ["cherry kitchen cabinets", "american cherry NYC", "shaker cherry"],
    faqs: [
      {
        question: "How long does it take cherry cabinets to darken?",
        answer:
          "Most of the color shift happens in the first 6 months of normal indoor light exposure, then continues to deepen gradually for another year or two before stabilizing.",
      },
    ],
  },
  {
    slug: "hickory",
    name: "Hickory",
    scientificName: "Carya ovata",
    origin: "Eastern U.S.",
    tagline: "The hardest commercial American hardwood.",
    shortDescription:
      "Hickory delivers the most dramatic color contrast and the highest Janka rating of any common cabinet wood. It is the right call for high-traffic kitchens, mountain houses, and rustic-modern aesthetics.",
    longDescription: [
      "Hickory (Carya ovata, shagbark hickory) is the toughest commercially available American hardwood, with a Janka hardness of 1,820 lbf — about 25% harder than maple. It is the wood used for tool handles, drumsticks, and floors that have to survive everything. In a kitchen it shrugs off pet claws, dropped pans, and decades of family abuse.",
      "Hickory's defining visual feature is contrast. Sapwood is nearly white, heartwood is a warm reddish brown, and most boards include both. Cabinet doors are usually selected to embrace this contrast — fighting it requires expensive sap-only sorting. The result is a lively, organic look that feels at home in mountain modern, rustic, and industrial-loft kitchens.",
      "Working hickory is challenging — it dulls blades quickly, splinters under aggressive cuts, and can move during finishing. It is not a beginner wood, but an experienced shop produces stunning results. Expect lead times to be slightly longer due to the careful sorting and the need for sharper-than-usual tooling.",
    ],
    jankaHardness: 1820,
    specificGravity: 0.72,
    costTier: "$$$",
    color: "Cream sap with warm reddish-brown heart",
    grain: "Bold, mostly straight, occasional wild figure",
    workability: "Difficult",
    stainTake: "Good",
    stability: 3,
    uses: ["High-traffic kitchens", "Rustic modern doors", "Mountain house casework"],
    pros: [
      "Hardest common cabinet hardwood (Janka 1,820)",
      "Unique sap/heart contrast adds character",
      "Extremely tough and shock-resistant",
    ],
    cons: [
      "Hard on tooling — premium pricing on labor",
      "Strong color contrast not everyone wants",
      "Less dimensionally stable than oak or walnut",
    ],
    bestFinishes: ["Clear hardwax oil", "Light natural stain", "Distressed/wire-brushed"],
    bestDoorStyles: ["Shaker", "Raised panel", "Plank-style"],
    swatch: "#8a5a3b",
    image: hickoryImg,
    grainImage: hickoryImg,
    keywords: ["hickory cabinets", "rustic kitchen wood", "hardest cabinet wood"],
    faqs: [
      {
        question: "Is hickory good for a busy family kitchen?",
        answer:
          "Yes — its 1,820 lbf Janka rating makes it the most dent- and impact-resistant common cabinet hardwood, ideal for households with kids, pets, and heavy daily use.",
      },
    ],
  },
  {
    slug: "ash",
    name: "White Ash",
    scientificName: "Fraxinus americana",
    origin: "Eastern U.S.",
    tagline: "Oak-like grain, cleaner color, lower price.",
    shortDescription:
      "White ash has the bold open grain of oak with a paler, more neutral background — perfect for clients who want oak texture without oak's pink or olive undertones. It also accepts cerused and limed finishes beautifully.",
    longDescription: [
      "White ash (Fraxinus americana) looks remarkably like white oak at first glance, with the same prominent open grain and similar density (Janka 1,320 lbf). The key differences are color — ash heartwood is a more neutral light brown without oak's olive cast — and value, with ash typically priced 10–15% below comparable white oak.",
      "Ash has been the wood of baseball bats and longbows for centuries because of its excellent strength-to-weight ratio. In cabinetry that translates to thin door rails and stiles that resist racking, and to long open shelves that stay flat under load. It machines cleanly and accepts both reactive and pigment finishes.",
      "The emerald ash borer has reduced North American ash supply, so availability fluctuates. When available, it is one of the best-value premium hardwoods on the market and a smart specification for cerused or limed finishes where oak's tannin reactivity becomes problematic.",
    ],
    jankaHardness: 1320,
    specificGravity: 0.6,
    costTier: "$$",
    color: "Pale neutral tan with light heartwood",
    grain: "Open-pored, prominent cathedral, similar to oak",
    workability: "Very Good",
    stainTake: "Excellent",
    stability: 4,
    uses: ["Cerused doors", "Slab modern fronts", "Open shelving", "Bench seating"],
    pros: [
      "Oak look with neutral color",
      "Strong strength-to-weight ratio",
      "Takes cerused and limed finishes cleanly",
      "Lower price than white oak",
    ],
    cons: [
      "Supply impacted by emerald ash borer",
      "Open grain telegraphs under paint",
      "Less recognizable to clients than oak",
    ],
    bestFinishes: ["Cerused white", "Limed gray", "Hardwax oil natural", "Light pigment stain"],
    bestDoorStyles: ["Slab", "Shaker", "Reeded"],
    swatch: "#d2b48c",
    image: ashImg,
    grainImage: ashImg,
    keywords: ["ash kitchen cabinets", "cerused ash NYC", "white ash slab doors"],
    faqs: [
      {
        question: "Is ash a good substitute for white oak?",
        answer:
          "For many modern kitchens, yes — ash offers similar grain texture and density at a lower price, with a more neutral color base that suits cerused and limed finishes especially well.",
      },
    ],
  },
  {
    slug: "mahogany",
    name: "Mahogany",
    scientificName: "Khaya ivorensis (African) / Swietenia macrophylla (Honduran)",
    origin: "West Africa, Central & South America",
    tagline: "The original luxury hardwood, ribbon-figured and timeless.",
    shortDescription:
      "True mahogany develops a deep reddish-brown patina, takes a piano-grade finish, and is dimensionally rock-solid. We specify African (Khaya) for sustainable sourcing while preserving the classic look.",
    longDescription: [
      "Mahogany has defined fine cabinetry since the Georgian era. Honduran mahogany (Swietenia macrophylla) is CITES Appendix II and difficult to source responsibly, so most reputable shops — ours included — specify African mahogany (Khaya ivorensis) which delivers the same warm reddish-brown color, ribbon-stripe figure, and superb workability without the supply-chain concerns.",
      "Mahogany machines and finishes like a dream. It is the wood of choice for high-gloss French polish, hand-rubbed oil, and traditional library paneling. Janka hardness is moderate (1,070 lbf for Khaya) — softer than oak but stable enough that doors and panels stay flat for generations.",
      "In NYC homes mahogany shows up most often in libraries, dining rooms, statement bars, and prewar restorations where the historical material register matters. We typically pair it with traditional raised-panel or fielded inset doors and unlacquered brass hardware that ages alongside the wood.",
    ],
    jankaHardness: 1070,
    specificGravity: 0.55,
    costTier: "$$$$",
    color: "Pinkish-tan deepening to rich reddish-brown",
    grain: "Medium, often ribbon-striped, interlocked figure",
    workability: "Excellent",
    stainTake: "Excellent",
    stability: 5,
    uses: ["Library paneling", "Bar and dining millwork", "Traditional raised panel kitchens"],
    pros: [
      "Extremely dimensionally stable",
      "Takes high-gloss and hand-rubbed finishes beautifully",
      "Develops a rich patina over decades",
      "Historical authenticity for prewar restorations",
    ],
    cons: [
      "Premium price tier",
      "Sourcing requires care for sustainability",
      "Softer than maple/oak — less ideal for high-traffic bases",
    ],
    bestFinishes: ["French polish (shellac)", "Hand-rubbed oil", "Conversion varnish satin"],
    bestDoorStyles: ["Raised panel", "Fielded inset", "Library frame-and-panel"],
    swatch: "#7d3a1f",
    image: mahoganyImg,
    grainImage: mahoganyImg,
    keywords: ["mahogany cabinets NYC", "khaya african mahogany", "library mahogany millwork"],
    faqs: [
      {
        question: "Is African mahogany the same as 'genuine' mahogany?",
        answer:
          "Botanically they are different genera (Khaya vs Swietenia) but they share visual character and workability. African mahogany is more sustainable and widely available, so we recommend it for nearly all new projects.",
      },
    ],
  },
  {
    slug: "alder",
    name: "Knotty Alder",
    scientificName: "Alnus rubra",
    origin: "Pacific Northwest U.S.",
    tagline: "Warm rustic character at a friendly price.",
    shortDescription:
      "Knotty alder brings honest character knots, warm honey tones, and a soft hand-feel to rustic, mountain-modern, and Spanish revival kitchens. It is also the standard substrate for mid-priced stained cabinetry.",
    longDescription: [
      "Red alder (Alnus rubra) is the most abundant hardwood in the Pacific Northwest. It is a softer hardwood (Janka 590 lbf) with a fine, even texture and a light reddish-brown color that resembles cherry without the patina shift. It is sold either as 'clear alder' (knot-free) for refined applications or as 'knotty alder' (sound knots welcome) for rustic looks.",
      "Knotty alder is the go-to wood for Tuscan, Spanish revival, mountain modern, and rustic farmhouse kitchens because it accepts distressing, glazing, and rub-through finishes beautifully. Its soft density makes it a wood to handle gently — fine for residential cabinetry, less ideal for restaurants or commercial use.",
      "Alder is also a budget-friendly substrate for stained cabinets that need to mimic cherry or walnut at a lower price point. It absorbs pigment evenly enough that a good finisher can create convincing equivalents to those premium woods at roughly half the material cost.",
    ],
    jankaHardness: 590,
    specificGravity: 0.41,
    costTier: "$",
    color: "Light honey to reddish-brown",
    grain: "Fine, mostly straight, with character knots when knotty grade",
    workability: "Excellent",
    stainTake: "Very Good",
    stability: 3,
    uses: ["Rustic doors", "Distressed and glazed finishes", "Stained mid-priced cabinetry"],
    pros: [
      "Affordable solid wood option",
      "Accepts distressing and rub-through finishes",
      "Easy to machine and hand-finish",
      "Warm, friendly aesthetic",
    ],
    cons: [
      "Soft (Janka 590) — dents easily",
      "Knots can fall out if poorly sorted",
      "Less suited to modern/minimalist looks",
    ],
    bestFinishes: ["Hand-rubbed honey stain + glaze", "Distressed cherry-tone stain", "Antique espresso"],
    bestDoorStyles: ["Raised panel", "Arched raised", "Beaded inset", "Plank-style"],
    swatch: "#c08a5a",
    image: alderImg,
    grainImage: alderImg,
    keywords: ["knotty alder cabinets", "rustic kitchen cabinets NYC", "affordable solid wood cabinets"],
    faqs: [
      {
        question: "Is alder strong enough for kitchen cabinets?",
        answer:
          "For residential use, yes — alder has been a mainstream cabinet wood for decades. For high-traffic commercial use or households that are hard on furniture, harder options like maple, oak, or hickory are a better fit.",
      },
    ],
  },
  {
    slug: "beech",
    name: "European Beech",
    scientificName: "Fagus sylvatica",
    origin: "Central & Western Europe",
    tagline: "Dense, pale, and the staple of European frameless cabinetry.",
    shortDescription:
      "Steamed European beech offers maple-like density with a pinkish-cream tone and a uniform grain that has defined Bauhaus and Scandinavian cabinetry for nearly a century.",
    longDescription: [
      "European beech (Fagus sylvatica) is the European counterpart to American maple — a fine-grained, pale, dense hardwood (Janka 1,300 lbf) used heavily in furniture, plywood cores, and traditional European frameless cabinetry. Most beech is steamed during drying, which evens its color to a uniform pinkish cream.",
      "Beech machines beautifully and bends well under steam, which is why it shows up in classic Thonet chairs and in curved cabinet components. Its tight grain takes paint and clear finishes equally well, and it is the European standard for plywood cabinet boxes (much like Baltic birch in the U.S.).",
      "In residential cabinetry beech is most often specified for clients who want a Scandinavian-modern look with solid wood doors, or for prefab European-style kitchens being adapted to NYC apartments. It is less common in custom American shops but readily available through European mills.",
    ],
    jankaHardness: 1300,
    specificGravity: 0.64,
    costTier: "$$",
    color: "Pinkish-cream (steamed) to pale tan",
    grain: "Fine, closed, very uniform",
    workability: "Very Good",
    stainTake: "Very Good",
    stability: 3,
    uses: ["Scandinavian modern doors", "Bent components", "European frameless casework"],
    pros: [
      "Excellent paint and clear finish surface",
      "Steam-bends easily for curved components",
      "Affordable European hardwood",
      "Uniform, calm grain",
    ],
    cons: [
      "Less dimensionally stable than maple",
      "Pinkish cast not loved by every palette",
      "Lower availability in U.S. domestic supply",
    ],
    bestFinishes: ["Clear hardwax oil", "Soft white paint", "Light pigment stain"],
    bestDoorStyles: ["Slab (frameless)", "Shaker", "Reeded"],
    swatch: "#e6c9a8",
    image: beechImg,
    grainImage: beechImg,
    keywords: ["beech cabinets", "european beech NYC", "scandinavian wood cabinets"],
    faqs: [
      {
        question: "How does beech compare to maple?",
        answer:
          "They are very similar in density and grain — beech runs slightly pinker, is a touch less dimensionally stable, and is more common in European cabinetry while maple dominates American shops.",
      },
    ],
  },
];

export const getWoodSpecies = (slug: string): WoodSpecies | undefined =>
  WOOD_SPECIES.find((w) => w.slug === slug);
