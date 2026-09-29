import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "custom-kitchen-cabinets-sunnyside-queens",
  title: "Custom Kitchen Cabinets for Sunnyside Queens",
  meta_description:
    "Custom kitchen cabinets for Sunnyside Queens — garden apartments, walk-ups, and condos by appointment. (718) 804-5488.",
  created_at: "2026-09-29T15:30:00-04:00",
  updated_at: "2026-09-29T15:30:00-04:00",
  tags: [
    "sunnyside kitchen cabinets",
    "queens kitchen cabinets",
    "garden apartment kitchen",
    "custom kitchen cabinets",
    "custom millwork",
    "by appointment",
  ],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/custom-kitchen-cabinets-sunnyside-queens",
};

// Article body is appended below as HTML strings, in order.
const BODY: string[] = [
  `<p>Sunnyside kitchens sit between Long Island City and Woodside on a grid that mixes historic garden apartments with walk-ups and corridor condos. A unit in Sunnyside Gardens often has an 8-foot ceiling, a shared wet wall that pins the sink, and a board that wants COI before demo day. A walk-up near Skillman Avenue or Queens Boulevard fights a narrow galley, a radiator niche, and stairs that will not take an oversized stock box. A newer condo near the 7 train or the Court Square edge has cleaner slabs — and developer boxes that leave a dead bay under the soffit. Stock packs leave fillers, a crooked fridge line, and uppers that never meet the wall you own.</p>`,
  `<p>Green Cabinets NY designs and installs custom kitchen cabinets for Sunnyside by appointment. We are home-based in Bushwick — not a walk-in shop. Measure and sample visits happen in your kitchen. Start with the <a href="https://greencabinetsny.com/custom-kitchen-cabinets-queens">Queens kitchen cabinets</a> map and our <a href="https://greencabinetsny.com/blog/queens-apartment-kitchen-millwork">Queens apartment millwork</a> overview. Nearby Queens depth: <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-astoria-queens">Astoria</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-jackson-heights-queens">Jackson Heights</a>, <a href="https://greencabinetsny.com/blog/custom-kitchen-cabinets-forest-hills-queens">Forest Hills</a>, and <a href="https://greencabinetsny.com/blog/custom-closet-systems-long-island-city">Long Island City closets</a>.</p>`,
  `<h2>Garden apartments, walk-ups, and corridor condos</h2>`,
  `<p><strong>Sunnyside Gardens and nearby garden campuses.</strong> Courtyard blocks mean short clear heights, shared stacks, and kitchens that share wet walls with the neighbor. Expect plaster that is not square and a bulkhead over the fridge. Painted <a href="https://greencabinetsny.com/blog/shaker-vs-slim-shaker-nyc">shaker or slim shaker</a> reads clean here. Soft-close drawers matter when party walls are thin — see <a href="https://greencabinetsny.com/blog/soft-close-blum-vs-hettich-nyc">Blum vs Hettich</a>. Drawer banks and <a href="https://greencabinetsny.com/blog/dovetail-drawer-boxes-nyc-kitchens">dovetail drawer boxes</a> often beat deep shelves you never see. Finish: <a href="https://greencabinetsny.com/wood-species">wood species</a> and <a href="https://greencabinetsny.com/blog/painted-vs-wood-veneer-cabinets-nyc-humidity">painted vs wood veneer in NYC humidity</a>.</p>`,
  `<p><strong>Walk-ups near Skillman Avenue, 46th Street, and Queens Boulevard.</strong> Galley kitchens, narrow hall turns, and stair-only access dominate. Catalog 36-inch bases leave ugly fillers; stock tall panels will not clear the stair. We measure the run and the stair, then section panels for the building you live in — same discipline as <a href="https://greencabinetsny.com/blog/freight-elevator-kitchen-cabinet-delivery-nyc">freight elevator delivery</a> and <a href="https://greencabinetsny.com/blog/nyc-kitchen-cabinet-installation">kitchen installation in NYC</a>.</p>`,
  `<p><strong>Newer and mid-rise condos near the 7 train and the Court Square / LIC edge.</strong> Cleaner slabs, shallower galleys, and freight elevators that need a reservation and a <a href="https://greencabinetsny.com/blog/certificate-of-insurance-kitchen-remodel-nyc">Certificate of Insurance</a>. Developer boxes often leave unused height under the bulkhead. Custom millwork reclaims that bay with taller wall cabinets, <a href="https://greencabinetsny.com/blog/appliance-panel-integrated-fridge-cabinets-nyc">appliance-panel integrated fridges</a>, and <a href="https://greencabinetsny.com/blog/toe-kick-drawers-pantry-pull-outs-nyc-kitchens">toe-kick drawers or pantry pull-outs</a>. Same height logic as <a href="https://greencabinetsny.com/blog/floor-to-ceiling-bulkhead-kitchen-cabinets-prewar-nyc">floor-to-ceiling / bulkhead kitchen cabinets</a>.</p>`,
  `<p>Zip context: 11377 (Sunnyside core) and the 11104 edge toward Long Island City — by appointment only. Astoria, Woodside, and LIC sit next door; we measure each kitchen separately.</p>`,
  `<h2>Why stock cabinets fail in Sunnyside</h2>`,
  `<ul>
    <li>Short clear heights (often 8'–8'6") where 48-inch wall cabinets do not fit</li>
    <li>Shared stacks and radiator niches that refuse a fixed catalog bay</li>
    <li>Out-of-square plaster after decades of settlement in garden campuses</li>
    <li>Narrow galleys where every inch of custom width matters against stock fillers</li>
    <li>Walk-ups that will not take oversized stock panels</li>
    <li>Boards that want COI, work-hour windows, and hallway protection before install day</li>
  </ul>`,
  `<p>Custom millwork starts from the clear opening. We scribe fillers on site so the run looks built into the plaster, not parked against it.</p>`,
  `<h2>Boards, COI, and occupied-unit installs</h2>`,
];

export const sunnysideQueensPost: BlogArticle = {
  id: "static-custom-kitchen-cabinets-sunnyside-queens",
  external_id: null,
  slug: META.slug,
  title: META.title,
  meta_title: META.title,
  meta_description: META.meta_description,
  excerpt: META.meta_description,
  image_url: null,
  content_html: BODY.join("\n"),
  content_image_urls: META.content_image_urls,
  tags: META.tags,
  created_at: META.created_at,
  updated_at: META.updated_at,
  canonical_url: META.canonical_url,
};
