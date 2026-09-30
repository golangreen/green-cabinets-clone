import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "custom-kitchen-cabinets-ditmas-park-brooklyn",
  title: "Custom Kitchen Cabinets for Ditmas Park Brooklyn",
  meta_description:
    "Custom kitchen cabinets for Ditmas Park Brooklyn — Victorian houses and apartments by appointment. (718) 804-5488.",
  created_at: "2026-09-30T15:30:00-04:00",
  updated_at: "2026-09-30T15:30:00-04:00",
  tags: [
    "ditmas park kitchen cabinets",
    "brooklyn kitchen cabinets",
    "victorian house kitchen",
    "custom kitchen cabinets",
    "custom millwork",
    "by appointment",
  ],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/custom-kitchen-cabinets-ditmas-park-brooklyn",
};

// Article body is appended below as HTML strings, in order.
const BODY: string[] = [
  `<p>Ditmas Park kitchens sit on the porch-row Victorian grid of central Brooklyn — freestanding houses with wraparound porches along Ocean Avenue and Beverly Road, Cortelyou Road corridor storefronts that tip into apartment kitchens upstairs, and Newkirk Avenue blocks that mix landmarked houses with smaller walk-ups on the 11218 / 11226 edge. A Victorian parlor-floor kitchen often has tall plaster, a chimney breast that eats a bay, and a porch-side window that pins the sink run. An upstairs apartment or condo conversion fights a shorter galley, a radiator niche, and a stair that will not take an oversized stock panel. Stock packs leave fillers, a crooked fridge line, and uppers that never meet the wall you own.</p>`,
  `<p>Green Cabinets NY designs and installs custom kitchen cabinets for Ditmas Park by appointment. We are home-based in Bushwick — not a walk-in shop. Measure and sample visits happen in your kitchen. Start with the <a href="https://greencabinetsny.com/custom-kitchen-cabinets-brooklyn">Brooklyn kitchen cabinets</a> map. Nearby Brooklyn depth: <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-bay-ridge-brooklyn">Bay Ridge</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-prospect-heights-brooklyn">Prospect Heights</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-park-slope-brownstones">Park Slope brownstones</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-clinton-hill-brooklyn">Clinton Hill</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-brooklyn-heights">Brooklyn Heights</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-cobble-hill-carroll-gardens">Cobble Hill and Carroll Gardens</a>, and <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-boerum-hill-brooklyn">Boerum Hill</a>. Related house storage: <a href="https://greencabinetsny.com/blog/under-stair-storage-millwork-brooklyn-brownstones">under-stair storage</a> and <a href="https://greencabinetsny.com/blog/custom-walk-in-closet-millwork-brooklyn-brownstones">walk-in closets</a>.</p>`,
  `<h2>Victorian houses, porch-row blocks, and apartments</h2>`,
  `<p><strong>Victorian freestanding houses and porch-row blocks near Ocean Avenue, Beverly Road, and Cortelyou.</strong> Tall ceilings, plaster that bows off square after a century of settlement, and chimney breasts that refuse a 36-inch catalog bay. Porch-side windows and radiator niches pin the sink or fridge line. Longer L-shaped or galley-plus-pantry runs are common on parlor floors; basement or garden-level kitchens still need panels sized for the stoop and stair before fabrication. Classic <a href="https://greencabinetsny.com/blog/shaker-vs-slim-shaker-nyc">shaker or slim shaker</a> with careful scribe is a frequent ask. Soft-close: <a href="https://greencabinetsny.com/blog/soft-close-blum-vs-hettich-nyc">Blum vs Hettich</a>. Drawer banks and <a href="https://greencabinetsny.com/blog/dovetail-drawer-boxes-nyc-kitchens">dovetail drawer boxes</a> beat deep shelves you never see. Finish: <a href="https://greencabinetsny.com/wood-species">wood species</a> and <a href="https://greencabinetsny.com/blog/painted-vs-wood-veneer-cabinets-nyc-humidity">painted vs wood veneer in NYC humidity</a>.</p>`,
];


export const ditmasParkBrooklynPost: BlogArticle = {
  id: META.slug,
  external_id: null,
  slug: META.slug,
  title: META.title,
  content_html: BODY.join("\n"),
  excerpt: META.meta_description,
  meta_title: META.title,
  meta_description: META.meta_description,
  tags: META.tags,
  image_url: null,
  content_image_urls: META.content_image_urls,
  canonical_url: META.canonical_url,
  created_at: META.created_at,
  updated_at: META.updated_at,
};
