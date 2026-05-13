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
      "Hickory (Carya ovata, shagbark hickory) is the toughest commercially available American hardwood, with a Janka hardness of 1,820 lbf — roughly 25% harder than hard maple, 40% harder than red oak, and nearly double the density of black walnut. The wood has been used for tool handles, drumsticks, baseball bats, wagon wheels, and any application where shock resistance matters. In a kitchen, that translates to cabinets that shrug off pet claws, dropped pans, and decades of family abuse without showing meaningful wear.",
      "Hickory's defining visual feature is contrast. Sapwood is nearly white to pale cream, heartwood is a warm reddish brown to deep tan, and most boards include both. Cabinet doors can be selected to embrace this dramatic contrast (the typical farmhouse and mountain-modern aesthetic) or sap-sorted for a more uniform pale look at a 15-25% material premium. There is no middle ground — hickory commits visually, and the right move is usually to commit with it.",
      "The grain is bold, mostly straight with occasional waves, and the open pore structure gives surfaces a tactile, hand-finished quality even after machine sanding. Unlike oak's cathedral arches, hickory's character comes from color and knot variation rather than figure. This makes it a strong fit for kitchens that want warmth and personality without the formality of cherry or the prestige price of walnut.",
      "Working hickory is genuinely challenging. The wood dulls blades quickly (we run carbide tooling at slower feed rates), splinters under aggressive cuts, and resists hand-planing. Pre-drilling for screws is mandatory, and joinery requires tight tolerances because hickory does not forgive sloppy fits. Expect lead times to run 1-2 weeks longer than maple or oak work, and labor costs to run 10-15% higher to account for tool wear and careful sorting.",
      "Cost-wise, clean-grade hickory in the NYC market runs $11-$14 per board foot — comparable to white oak. Character-grade (rustic) hickory runs $9-$11/bf and is typically the better value because the knots and color contrast that mark it down are exactly what most clients want anyway. For a 30-linear-foot kitchen, expect hickory to cost similar to white oak and roughly 30% less than walnut of equivalent construction.",
      "Best uses include high-traffic family kitchens, mountain modern and farmhouse aesthetics, mudroom and entry built-ins, and any project where damage tolerance is a primary concern. We have specified hickory for Catskills weekend houses, Hamptons farmhouses, brownstone kitchens going for warmth-against-industrial, and homes with multiple large dogs. It is not the right wood for minimalist or contemporary kitchens — for that look, consider rift-cut white oak or maple.",
      "Finishing hickory is straightforward. Hardwax oils (Rubio Monocoat, Osmo) preserve the natural color contrast beautifully. Satin conversion varnish gives durability for heavy-use kitchens. Amber shellac warms the heartwood. Avoid heavy pigment stains, which mute the contrast that makes hickory worth specifying in the first place. Pair with brushed brass, oil-rubbed bronze, matte black, or aged copper hardware.",
    ],
...
    faqs: [
      {
        question: "Is hickory good for a busy family kitchen?",
        answer:
          "Yes — its 1,820 lbf Janka rating makes it the most dent- and impact-resistant common cabinet hardwood. For households with kids, large dogs, or heavy cooking use, hickory will outlast maple, walnut, and even white oak in terms of visible damage. It is the most damage-tolerant cabinet wood you can specify.",
      },
      {
        question: "How much do hickory kitchen cabinets cost in NYC?",
        answer:
          "Clean-grade hickory runs $11-$14 per board foot in the NYC market — comparable to white oak. Character-grade (rustic) hickory runs $9-$11/bf. For a typical 30-linear-foot kitchen, expect hickory cabinetry from a custom shop to run $15,000-$25,000 in materials and labor, depending on door style and finish complexity.",
      },
      {
        question: "What is the difference between hickory and rustic hickory?",
        answer:
          "Same species, different selection. Standard (clean-grade) hickory minimizes knots and color variation. Rustic (character-grade) hickory celebrates them — visible knots, mineral streaks, and dramatic sapwood-heartwood contrast. Rustic actually costs 10-15% less because more of each log is usable when the variation is a feature, not a defect.",
      },
      {
        question: "Does hickory work in modern kitchens or only farmhouse?",
        answer:
          "Hickory is firmly in the farmhouse, mountain modern, and rustic-transitional camp. It can work in transitional designs paired with concrete or quartz counters and matte black hardware, but it is the wrong choice for pure minimalist or contemporary kitchens. For modern, specify rift-cut white oak or maple instead.",
      },
      {
        question: "How does hickory compare to oak for cabinets?",
        answer:
          "Hickory is significantly harder (Janka 1,820 vs 1,360 for white oak) and more dramatic visually due to color contrast. Oak is more dimensionally stable, more workable, and reads as more refined. Hickory wins on durability and farmhouse character; oak wins on versatility and modern aesthetics. Cost is roughly equivalent.",
      },
      {
        question: "Will hickory cabinets fade or change color over time?",
        answer:
          "Both heartwood and sapwood will mellow slightly with UV exposure over 5-10 years — heartwood softens from reddish-brown toward a warmer amber, sapwood ambers slightly from white toward cream. The dramatic contrast between them is permanent and is part of why hickory is specified.",
      },
      {
        question: "Is hickory hard to maintain in NYC humidity?",
        answer:
          "Hickory is less dimensionally stable than oak or maple, so it can move slightly in NYC's seasonal humidity swings (25% RH in winter, 75% in summer). A quality conversion varnish or hardwax oil topcoat plus running HVAC during humidity peaks keeps doors flat and joints tight. Avoid raw hickory near dishwashers or sinks.",
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
  {
    slug: "rift-cut-white-oak",
    name: "Rift-Cut White Oak",
    scientificName: "Quercus alba (rift sawn)",
    origin: "Eastern U.S.",
    tagline: "The defining cut of modern luxury kitchens.",
    shortDescription:
      "Rift-cut white oak shows tight, ruler-straight vertical grain with no cathedral arches. It's the most consistent door-to-door look in cabinetry and the signature of post-2018 high-end design.",
    longDescription: [
      "Rift-cut white oak (Quercus alba, rift sawn) is the same species as standard white oak — but the cut transforms its visual character. Rift sawing slices the log at a 30-to-60 degree angle to the growth rings, producing boards with tight, parallel grain lines that run dead straight from end to end. There are no cathedral arches, no wild figure, and almost no ray fleck. The result is the calmest, most modern-looking face grain in commercial cabinetry.",
      "Designers love rift-cut for one specific reason: door-to-door consistency. On a 14-foot wall of slab fronts, plain-sawn lumber gives you visible variation between every door — some show full arches, some show partial figure, some show almost nothing. Rift-cut eliminates that visual noise. Every door reads identical, which is exactly what minimalist and modern kitchens demand. This is why every shelter magazine kitchen since roughly 2018 specifies rift-cut white oak.",
      "The trade-off is yield. A log sawn for rift produces only 25-30% rift-quality boards versus 60-70% plain-sawn yield. That cuts log value sharply, which is why rift-cut white oak runs roughly 30-40% more per board foot than plain-sawn — currently $14-$18/bf in the NYC market versus $10-$12 for plain. For a typical 30-linear-foot kitchen, expect a $2,500-$4,000 lumber premium over plain-sawn white oak.",
      "Rift-cut takes the same finishing palette as standard white oak: hardwax oils for natural warmth, fumed and smoked finishes for cool gray tones, cerused white for textural contrast, and reactive iron-acetate for blackened looks. Pair with brass, blackened steel, or warm nickel hardware. We do not recommend painting rift-cut — paying the rift premium and then covering the grain defeats the purpose.",
      "In Brooklyn and Manhattan brownstones we typically specify rift-cut for slab fronts on contemporary kitchens, and pair with plain-sawn white oak floors below. The two cuts of the same species play together beautifully without matching exactly. For Park Slope and Williamsburg lofts, rift-cut shaker doors with a hardwax oil finish have become the de facto signature look.",
    ],
    jankaHardness: 1360,
    specificGravity: 0.68,
    costTier: "$$$$",
    color: "Light to medium tan with olive undertones",
    grain: "Tight, vertical, ruler-straight",
    workability: "Good",
    stainTake: "Excellent",
    stability: 5,
    uses: ["Modern slab fronts", "Minimalist shaker", "Floor-to-ceiling pantries", "Custom range hoods"],
    pros: [
      "Most consistent door-to-door grain match available",
      "Reads as calm and modern — no cathedral noise",
      "More dimensionally stable than plain-sawn (cuts perpendicular to rings)",
      "Same hardness and water resistance as plain white oak",
    ],
    cons: [
      "30-40% more expensive per board foot than plain-sawn",
      "Lower yield = longer lead times for custom widths",
      "Wastes the cut's beauty if you plan to paint it",
      "Less character than plain-sawn for traditional kitchens",
    ],
    bestFinishes: ["Hardwax oil natural", "Fumed/smoked", "Cerused white", "Rubio Monocoat Pure"],
    bestDoorStyles: ["Slab", "Shaker", "Reeded", "Frameless European"],
    swatch: "#c9a877",
    image: whiteOakImg,
    grainImage: whiteOakImg,
    keywords: [
      "rift cut white oak",
      "rift cut white oak cabinets",
      "rift sawn white oak NYC",
      "modern white oak kitchen",
      "white oak slab cabinets",
    ],
    faqs: [
      {
        question: "What is the difference between rift-cut and plain-sawn white oak?",
        answer:
          "Plain-sawn shows wide cathedral arches and varies dramatically board-to-board. Rift-cut shows tight, parallel vertical lines and reads almost identical from one door to the next. Rift is preferred for modern minimalist kitchens; plain-sawn for traditional or farmhouse looks.",
      },
      {
        question: "How much more does rift-cut cost than plain-sawn?",
        answer:
          "Roughly 30-40% more per board foot. In the NYC market, plain-sawn white oak runs $10-$12/bf while rift-cut runs $14-$18/bf. On a typical 30-linear-foot kitchen, that's a $2,500-$4,000 lumber premium.",
      },
      {
        question: "Is rift-cut white oak worth the premium?",
        answer:
          "If you're doing a contemporary slab or minimalist shaker kitchen with long uninterrupted runs of cabinetry, yes — the door-to-door consistency is impossible to replicate any other way. For shorter runs, traditional styles, or painted finishes, plain-sawn is the smarter spend.",
      },
      {
        question: "Can rift-cut white oak be stained dark?",
        answer:
          "Yes, but think twice. Rift-cut's value is its calm grain — staining it dark obscures the very thing you paid extra for. Most designers pair rift-cut with hardwax oil natural, fumed, or reactive finishes that preserve grain visibility.",
      },
      {
        question: "What's the lead time on rift-cut white oak in NYC?",
        answer:
          "Plan on 8-10 weeks for a full custom kitchen versus 6-8 weeks for plain-sawn, due to lower yield from each log and tighter sourcing on consistent widths. We hold inventory of common widths to compress this when possible.",
      },
      {
        question: "Does rift-cut work for shaker cabinets or only slab?",
        answer:
          "It works beautifully for both. Rift-cut shaker is becoming as common as rift-cut slab in NYC kitchens — the straight grain on the rails and stiles plus the calm panel reads as a refined, slightly traditional take on the modern oak look.",
      },
    ],
  },
  {
    slug: "quartersawn-oak",
    name: "Quartersawn Oak",
    scientificName: "Quercus alba / Quercus rubra (quartersawn)",
    origin: "Eastern U.S.",
    tagline: "Iridescent ray fleck and the soul of Mission and Greene & Greene.",
    shortDescription:
      "Quartersawn oak is sliced perpendicular to the growth rings, exposing the medullary rays as shimmering silver-gold ribbons. It is the defining wood of Arts & Crafts, Mission, and Stickley furniture.",
    longDescription: [
      "Quartersawn oak is produced by cutting the log into quarters and then sawing each quarter into boards perpendicular to the growth rings. The cut exposes the wood's medullary rays — radial structures that move nutrients horizontally through the trunk — as iridescent silver-gold or copper ribbons that shimmer when light hits the surface. This 'ray fleck' is the visual signature of Mission furniture, Stickley pieces, Greene & Greene millwork, and the entire American Arts & Crafts movement of 1900-1920.",
      "Both white oak and red oak can be quartersawn, but white oak produces dramatically more visible ray fleck because its medullary rays are larger and more numerous. When designers say 'quartersawn oak' without qualification, they almost always mean quartersawn white oak. Red oak quartersawn shows subtler fleck and reads more like rift-cut — less collectible, but more affordable.",
      "Quartersawn lumber is the most dimensionally stable cut available from any species. Because the growth rings run perpendicular to the board face, the wood expands and contracts much less across its width with humidity changes. For NYC kitchens that swing from 25% relative humidity in February to 75% in July, this stability is genuinely useful — quartersawn doors and panels stay flatter, and joints stay tighter, than the same species cut plain or rift.",
      "The cost is significant. Quartersawn yield from a log is the lowest of any cut — typically 15-20% versus 60% plain-sawn. Expect quartersawn white oak in the NYC market to run $18-$24/board foot, roughly double plain-sawn and 30-40% above rift-cut. For a 30-linear-foot kitchen, that's a $5,000-$8,000 lumber premium over plain-sawn.",
      "Finish quartersawn oak to celebrate the ray fleck, not hide it. Traditional Mission finishes used fuming with ammonia (a chemical reaction with white oak's tannins that produced the deep brown of original Stickley pieces) followed by a thin shellac or oil topcoat. Modern equivalents include hardwax oils, conversion varnishes in clear or amber, and reactive iron-acetate finishes. Avoid heavy pigment stains that obscure the fleck.",
      "Best uses in cabinetry: feature islands, libraries and built-ins, range hoods, statement pantries, and bathroom vanities where the fleck becomes a design moment. For a full kitchen of cabinets, the cost can become prohibitive — many of our Brooklyn and Manhattan clients specify quartersawn for the island and a few key pieces, and rift-cut or plain-sawn for the perimeter cabinets, blending cuts of the same species.",
    ],
    jankaHardness: 1360,
    specificGravity: 0.68,
    costTier: "$$$$",
    color: "Tan to medium brown with shimmering ray fleck",
    grain: "Straight grain face with prominent medullary ray fleck",
    workability: "Good",
    stainTake: "Excellent",
    stability: 5,
    uses: ["Mission/Craftsman cabinetry", "Feature islands", "Library millwork", "Custom range hoods", "Statement vanities"],
    pros: [
      "Most dimensionally stable cut available — minimal seasonal movement",
      "Iridescent ray fleck is impossible to replicate any other way",
      "Defining wood of American Arts & Crafts and Mission style",
      "Holds tight joinery in NYC's humidity swings",
    ],
    cons: [
      "Most expensive cut of oak — roughly 2× plain-sawn cost",
      "Lowest yield per log = longest lead times (10-14 weeks)",
      "Strong visual character can overwhelm minimalist designs",
      "Ray fleck makes inconsistent panel matching harder to manage",
    ],
    bestFinishes: ["Fumed (ammonia)", "Hardwax oil natural", "Amber shellac", "Reactive iron-acetate"],
    bestDoorStyles: ["Mission/Craftsman flat panel", "Inset shaker", "Slab (for modern fleck-forward)", "Raised panel"],
    swatch: "#a37a4f",
    image: whiteOakImg,
    grainImage: whiteOakImg,
    keywords: [
      "quartersawn oak cabinets",
      "quartersawn white oak NYC",
      "mission style cabinets",
      "stickley style oak",
      "ray fleck oak",
      "craftsman kitchen cabinets",
    ],
    faqs: [
      {
        question: "What is the difference between quartersawn, rift-cut, and plain-sawn oak?",
        answer:
          "It's all about how the log is sliced. Plain-sawn cuts parallel to one face (cathedral grain, cheapest, ~60% yield). Rift-cut slices at a 30-60° angle to the rings (straight vertical grain, no fleck, ~25% yield). Quartersawn cuts perpendicular to the rings (straight grain plus shimmering ray fleck, ~15-20% yield, most expensive).",
      },
      {
        question: "Why is quartersawn oak associated with Mission furniture?",
        answer:
          "Gustav Stickley and the early-1900s Arts & Crafts movement chose quartersawn white oak specifically for its ray fleck — they viewed it as honest expression of the wood's structure, in contrast to ornate Victorian veneers. The fumed finish on original Stickley pieces is what produces that signature dark brown.",
      },
      {
        question: "How much more does quartersawn cost than plain-sawn?",
        answer:
          "In the NYC market, quartersawn white oak runs $18-$24/board foot versus $10-$12 for plain-sawn — roughly double. On a typical 30-linear-foot kitchen, expect a $5,000-$8,000 lumber premium. Many clients specify quartersawn only for the island and feature pieces to manage cost.",
      },
      {
        question: "Is quartersawn red oak the same thing?",
        answer:
          "Both species can be quartersawn, but red oak shows much subtler ray fleck because its medullary rays are smaller. When designers say 'quartersawn oak' without qualifying, they nearly always mean white oak. Quartersawn red oak is roughly 25% cheaper and reads more like rift-cut.",
      },
      {
        question: "Can quartersawn oak be used in modern kitchens?",
        answer:
          "Yes, but selectively. The ray fleck reads as strong character — beautiful in transitional and maximalist designs, potentially overwhelming in pure minimalist kitchens. A common solution is quartersawn on a single feature element (island, range hood, or pantry wall) with rift-cut elsewhere.",
      },
      {
        question: "What finish best showcases ray fleck?",
        answer:
          "Hardwax oils and clear conversion varnishes preserve the fleck's natural iridescence. Fumed finishes (the traditional Mission look) deepen the background while leaving the fleck visible. Avoid heavy pigment stains, which obscure the ray fleck entirely.",
      },
    ],
  },
  {
    slug: "rustic-hickory",
    name: "Rustic Hickory",
    scientificName: "Carya ovata (with character grade)",
    origin: "Eastern & Central U.S.",
    tagline: "The hardest domestic hardwood — with knots, color swings, and farmhouse soul.",
    shortDescription:
      "Rustic hickory is character-grade hickory selected for visible knots, mineral streaks, and dramatic heartwood-sapwood contrast. It is the signature wood of mountain modern, farmhouse, and lodge-style kitchens.",
    longDescription: [
      "Rustic hickory (Carya ovata, character grade) is the same species as standard hickory — but instead of selecting clean, uniform boards, the rustic grade celebrates the wood's natural variation. Expect dramatic contrast between creamy white sapwood and deep reddish-brown heartwood, prominent knots (sound and tight), mineral streaks, and occasional bark inclusions. Every door tells a different story, which is exactly the point.",
      "Hickory in any grade is the hardest commercial domestic hardwood, with a Janka hardness of 1,820 lbf — roughly 25% harder than hard maple and 40% harder than red oak. That makes it functionally bulletproof for kitchen cabinets. Doors and drawer fronts shrug off impacts that would visibly dent maple or oak. For families with kids, dogs, or active cooking households, hickory is the most damage-tolerant wood you can specify.",
      "The aesthetic is unmistakable: warm, rustic, and unapologetically Americana. Rustic hickory is the defining wood of Aspen ski lodges, Tahoe mountain houses, Texas hill-country ranches, and the contemporary farmhouse trend that swept American interiors after 2015. In NYC it works particularly well in Catskills weekend houses, Hamptons farmhouses, and Brooklyn brownstones aiming for warmth against industrial counters.",
      "Working with rustic hickory requires planning. The wood is dense, hard on tooling, and prone to splitting if pre-drilled inadequately — our shop runs sharper bits at slower feed rates than for maple work. Color sorting takes longer because the goal is intentional variation, not consistency. Expect 10-15% more shop time than for clean-grade material, which we factor into pricing.",
      "Cost-wise, rustic hickory typically runs 10-15% less than clean-grade hickory because more of the log is usable when knots and color variation are features, not defects. In the NYC market, rustic hickory runs roughly $9-$11/board foot — comparable to red oak. That makes it the most cost-effective way to get a true farmhouse-character wood without the price tag of walnut or cherry.",
      "Finish to enhance the natural variation: hardwax oils, satin conversion varnishes, and amber shellacs all let the heartwood-sapwood contrast and grain figure read clearly. Avoid heavy pigment stains that flatten the variation — if you wanted uniform color you should have specified clean-grade. For a more refined take, a thin clear coat over raw hickory delivers maximum character with minimal sheen.",
    ],
    jankaHardness: 1820,
    specificGravity: 0.72,
    costTier: "$$",
    color: "Dramatic creamy white sap to reddish-brown heart with knots",
    grain: "Bold, open, often wavy, with mineral streaks and tight knots",
    workability: "Moderate",
    stainTake: "Good",
    stability: 3,
    uses: ["Farmhouse kitchens", "Mountain modern", "Lodge-style cabinetry", "Heavy-use family kitchens", "Mudroom built-ins"],
    pros: [
      "Hardest domestic cabinet wood — Janka 1,820 lbf",
      "Distinctive farmhouse and mountain-modern character",
      "More affordable than clean-grade hickory (10-15% less)",
      "Hides dents, scratches, and dings exceptionally well",
    ],
    cons: [
      "Strong visual character not for minimalist kitchens",
      "Hard on tooling — slightly higher labor cost",
      "Less dimensionally stable than oak or maple in humidity swings",
      "Requires intentional color sorting to balance panels",
    ],
    bestFinishes: ["Clear hardwax oil", "Satin conversion varnish", "Amber shellac", "Light natural stain"],
    bestDoorStyles: ["Shaker", "Raised panel", "Beaded inset", "Plank-style slab"],
    swatch: "#9c6b3f",
    image: hickoryImg,
    grainImage: hickoryImg,
    keywords: [
      "rustic hickory cabinets",
      "rustic hickory kitchen cabinets",
      "character grade hickory",
      "farmhouse kitchen cabinets",
      "mountain modern cabinets",
      "knotty hickory cabinets",
    ],
    faqs: [
      {
        question: "What's the difference between rustic and clean-grade hickory?",
        answer:
          "Same species, different selection. Clean-grade hickory is sorted to minimize knots and color variation for a more uniform look. Rustic (or character) grade celebrates knots, mineral streaks, and dramatic heartwood-sapwood contrast. Rustic actually costs 10-15% less because more of the log is usable.",
      },
      {
        question: "Is hickory really the hardest domestic cabinet wood?",
        answer:
          "Yes. Hickory's Janka hardness of 1,820 lbf is the highest of any commercially harvested North American hardwood used in cabinetry — roughly 25% harder than hard maple, 40% harder than red oak, and 80% harder than walnut. For high-impact use, nothing else comes close.",
      },
      {
        question: "Does rustic hickory work outside of farmhouse style?",
        answer:
          "Yes — it's increasingly popular in mountain modern and transitional kitchens that want warmth and character without going full farmhouse. Pair with concrete or quartz counters and matte black hardware to dial back the rustic feel. It's a tougher sell for pure minimalist or contemporary kitchens.",
      },
      {
        question: "How much do rustic hickory cabinets cost in NYC?",
        answer:
          "Rustic hickory runs roughly $9-$11/board foot in the NYC market, which is comparable to red oak and about 30% less than walnut. For a typical 30-linear-foot kitchen, expect rustic hickory to cost $2,000-$3,000 less than clean-grade hickory and roughly $4,000-$6,000 less than walnut of equivalent construction.",
      },
      {
        question: "Will the heartwood-sapwood contrast bother me over time?",
        answer:
          "If contrast is a concern, rustic hickory is the wrong choice — that contrast is the entire aesthetic. Both heartwood and sapwood will mellow slightly with UV exposure, but the dramatic difference between them is permanent. Clients who love rustic hickory after install almost always cite the contrast as their favorite feature.",
      },
      {
        question: "Does rustic hickory hold up in humid kitchens?",
        answer:
          "Reasonably well — better than walnut, not as well as white oak. Hickory is dense and strong but not exceptionally dimensionally stable. For NYC kitchens we recommend a quality conversion varnish or hardwax oil topcoat and running the HVAC during humidity peaks. Avoid raw hickory next to dishwashers or sinks without splash guards.",
      },
    ],
  },
];

export const getWoodSpecies = (slug: string): WoodSpecies | undefined =>
  WOOD_SPECIES.find((w) => w.slug === slug);
