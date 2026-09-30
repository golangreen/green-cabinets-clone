import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "custom-kitchen-cabinets-bay-ridge-brooklyn",
  title: "Custom Kitchen Cabinets for Bay Ridge Brooklyn",
  meta_description:
    "Custom kitchen cabinets for Bay Ridge Brooklyn — pre-war apartments and houses by appointment. (718) 804-5488.",
  created_at: "2026-09-30T09:30:00-04:00",
  updated_at: "2026-09-30T09:30:00-04:00",
  tags: [
    "bay ridge kitchen cabinets",
    "brooklyn kitchen cabinets",
    "pre-war apartment kitchen",
    "custom kitchen cabinets",
    "custom millwork",
    "by appointment",
  ],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/custom-kitchen-cabinets-bay-ridge-brooklyn",
};

// Article body is appended below as HTML strings, in order.
const BODY: string[] = [
  `<p>Bay Ridge kitchens sit on the Narrows side of southwest Brooklyn — Third Avenue and Fifth Avenue corridors, Shore Road blocks that face the water, and the brick walk-ups and attached houses that fill 11209 and the 11220 edge. A pre-war galley off Fifth often has plaster that bows off square, a radiator niche that eats a fixed module, and a bulkhead that cuts the upper run short of the catalog height. An attached or semi-detached house near Shore Road or Colonial Road may have a longer L-shaped run and a basement stair that still will not take an oversized stock panel. A co-op board on a quiet side street wants COI and work-hour windows before the first box rolls in. Stock packs leave fillers, a crooked fridge line, and uppers that never meet the wall you own.</p>`,
  `<p>Green Cabinets NY designs and installs custom kitchen cabinets for Bay Ridge by appointment. We are home-based in Bushwick — not a walk-in shop. Measure and sample visits happen in your kitchen. Delivery typically comes through the Sunset Park corridor from Bushwick. Start with the <a href="https://greencabinetsny.com/custom-kitchen-cabinets-brooklyn">Brooklyn kitchen cabinets</a> map. Nearby Brooklyn depth: <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-clinton-hill-brooklyn">Clinton Hill</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-brooklyn-heights">Brooklyn Heights</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-park-slope-brownstones">Park Slope brownstones</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-cobble-hill-carroll-gardens">Cobble Hill and Carroll Gardens</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-boerum-hill-brooklyn">Boerum Hill</a>, and <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-prospect-heights-brooklyn">Prospect Heights</a>.</p>`,
  `<h2>Pre-war apartments, attached houses, and Shore Road blocks</h2>`,
  `<p><strong>Pre-war brick apartments and walk-ups near Third Avenue and Fifth Avenue.</strong> Short clear heights, shared stacks, and galleys that were never square. Radiator niches refuse a 36-inch catalog bay. Boards often want a <a href="https://greencabinetsny.com/blog/certificate-of-insurance-kitchen-remodel-nyc">Certificate of Insurance</a> before demo day. Freight elevators need a reservation when the building has one; walk-ups need panels sized for the stoop and stair before fabrication — see <a href="https://greencabinetsny.com/blog/freight-elevator-kitchen-cabinet-delivery-nyc">freight elevator delivery</a>. Custom millwork reclaims unused height under the bulkhead with taller wall cabinets and <a href="https://greencabinetsny.com/blog/floor-to-ceiling-bulkhead-kitchen-cabinets-prewar-nyc">floor-to-ceiling / bulkhead kitchen cabinets</a> logic. Classic <a href="https://greencabinetsny.com/blog/shaker-vs-slim-shaker-nyc">shaker or slim shaker</a> with careful scribe is a common ask. Soft-close: <a href="https://greencabinetsny.com/blog/soft-close-blum-vs-hettich-nyc">Blum vs Hettich</a>. Drawer banks and <a href="https://greencabinetsny.com/blog/dovetail-drawer-boxes-nyc-kitchens">dovetail drawer boxes</a> beat deep shelves you never see.</p>`,
  `<p><strong>Attached and semi-detached houses toward Shore Road, Colonial, and the Narrows-facing blocks.</strong> Longer runs, sometimes an eat-in corner, and wet walls that still sit off plumb after decades of settlement. Stair carries from the stoop matter as much as layout. Finish: <a href="https://greencabinetsny.com/wood-species">wood species</a> and <a href="https://greencabinetsny.com/blog/painted-vs-wood-veneer-cabinets-nyc-humidity">painted vs wood veneer in NYC humidity</a>.</p>`,
];

export const bayRidgeBrooklynPost: BlogArticle = {
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
