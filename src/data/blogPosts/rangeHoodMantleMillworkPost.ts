import type { BlogArticle } from "@/services/blogService";

const META = {
  slug: "range-hood-mantle-cabinet-millwork-nyc",
  title: "Range Hood and Mantle Cabinet Millwork for NYC Kitchens",
  meta_description:
    "Custom range hood and mantle cabinet millwork for NYC kitchens — by appointment in Brooklyn, Manhattan, Queens. (718) 804-5488.",
  created_at: "2026-10-02T09:30:00-04:00",
  updated_at: "2026-10-02T09:30:00-04:00",
  tags: ["range hood millwork", "mantle cabinet", "kitchen hood surround nyc", "custom millwork", "by appointment"],
  content_image_urls: [] as string[],
  canonical_url: "https://greencabinetsny.com/blog/range-hood-mantle-cabinet-millwork-nyc",
};

const BODY = [
  "<p>The range wall is where a stock kitchen usually looks unfinished. A stainless chimney hangs short of the bulkhead. A mantle hood kit lands off-center because the plaster is out of square. The door style on the surround does not match the rest of the run. In a prewar Brooklyn or Manhattan kitchen, that gap reads louder than the cooktop itself.</p>",
  "<p>Green Cabinets NY designs and installs custom range hood and mantle cabinet millwork for Brooklyn, Manhattan, and Queens kitchens by appointment. We are home-based in Bushwick — not a walk-in shop. Measure and sample visits happen in your kitchen. Start with <a href=\"https://greencabinetsny.com/blog/nyc-kitchen-cabinet-installation\">kitchen installation in NYC</a> and the borough maps for <a href=\"https://greencabinetsny.com/custom-kitchen-cabinets-brooklyn\">Brooklyn</a>, <a href=\"https://greencabinetsny.com/custom-kitchen-cabinets-manhattan\">Manhattan</a>, and <a href=\"https://greencabinetsny.com/custom-kitchen-cabinets-queens\">Queens</a>. Related: <a href=\"https://greencabinetsny.com/blog/floor-to-ceiling-bulkhead-kitchen-cabinets-prewar-nyc\">floor-to-ceiling / bulkhead cabinets</a>, <a href=\"https://greencabinetsny.com/blog/appliance-panel-integrated-fridge-cabinets-nyc\">appliance-panel integrated fridges</a>, and <a href=\"https://greencabinetsny.com/blog/shaker-vs-slim-shaker-nyc\">shaker vs slim shaker</a>.</p>",
];

export const rangeHoodMantleMillworkPost: BlogArticle = {
  id: "static-range-hood-mantle-cabinet-millwork-nyc",
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
