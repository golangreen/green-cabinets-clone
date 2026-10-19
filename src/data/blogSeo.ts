/**
 * Blog SEO decisions that apply to both the static posts (src/data/blogPosts)
 * and the database (Supabase) posts, without editing the database.
 *
 * - MERGED_BLOG_POSTS: near-duplicate neighborhood posts folded into one page
 *   (2026-10-19). The dropped URL 301s to the kept one (worker/index.ts) and
 *   is removed from the index, sitemap and pre-render.
 * - POST_PRIMARY_LOCATION: posts whose neighborhood also has a location page.
 *   The location page is primary for the commercial query; the post links
 *   to it prominently and keeps an informational angle.
 * - BLOG_TITLE_OVERRIDES: shorter <title>s (≤ 60 chars) and the
 *   informational retitles. Descriptions are trimmed to ≤ 160 chars by
 *   fitDescription where they are rendered.
 */
export const MERGED_BLOG_POSTS: Record<string, string> = {
  "custom-kitchen-cabinets-williamsburg-brooklyn": "custom-kitchen-cabinets-greenpoint-brooklyn",
  "custom-kitchen-cabinets-brooklyn-heights": "custom-kitchen-cabinets-clinton-hill-brooklyn",
  "custom-kitchen-cabinets-sunnyside-queens": "custom-kitchen-cabinets-jackson-heights-queens",
  "custom-kitchen-cabinets-boerum-hill-brooklyn": "custom-kitchen-cabinets-cobble-hill-carroll-gardens",
};

export interface LocationLink {
  path: string;
  label: string;
}

export const POST_PRIMARY_LOCATION: Record<string, LocationLink> = {
  "custom-kitchen-cabinets-greenpoint-brooklyn": { path: "/custom-kitchen-cabinets-williamsburg", label: "Williamsburg custom kitchen cabinets" },
  "custom-kitchen-cabinets-clinton-hill-brooklyn": { path: "/custom-kitchen-cabinets-brooklyn-heights", label: "Brooklyn Heights custom kitchen cabinets" },
  "custom-kitchen-cabinets-park-slope-brownstones": { path: "/custom-kitchen-cabinets-park-slope", label: "Park Slope custom kitchen cabinets" },
  "custom-kitchen-cabinets-astoria-queens": { path: "/custom-kitchen-cabinets-astoria", label: "Astoria custom kitchen cabinets" },
  "custom-kitchen-cabinets-upper-east-side-coops": { path: "/custom-kitchen-cabinets-upper-east-side", label: "Upper East Side custom kitchen cabinets" },
  "custom-closet-systems-long-island-city": { path: "/custom-kitchen-cabinets-long-island-city", label: "Long Island City custom cabinetry" },
  "custom-bathroom-vanity-park-slope-brownstones": { path: "/custom-kitchen-cabinets-park-slope", label: "Park Slope custom cabinetry" },
};

interface TitleOverride {
  /** <title> / og:title */
  meta_title?: string;
  /** visible H1 + listing title (informational retitles only) */
  title?: string;
}

export const BLOG_TITLE_OVERRIDES: Record<string, TitleOverride> = {
  // Informational angle — the location page owns "custom kitchen cabinets <neighborhood>".
  "custom-kitchen-cabinets-park-slope-brownstones": {
    title: "Park Slope Brownstone Kitchens: Planning Custom Cabinets",
    meta_title: "Park Slope Brownstone Kitchens: Planning Custom Cabinets",
  },
  "custom-kitchen-cabinets-astoria-queens": {
    title: "Astoria Rowhouse and Co-op Kitchens: A Cabinet Planning Guide",
    meta_title: "Astoria Rowhouse & Co-op Kitchens: Cabinet Planning Guide",
  },
  "custom-kitchen-cabinets-upper-east-side-coops": {
    title: "Upper East Side Co-op Kitchens: Board Rules and Cabinet Planning",
    meta_title: "UES Co-op Kitchens: Board Rules & Cabinet Planning",
  },
  // Length trims (≤ 60 characters), keywords kept.
  "appliance-panel-integrated-fridge-cabinets-nyc": { meta_title: "Appliance Panels & Integrated Fridge Cabinets for NYC" },
  "brooklyn-brownstone-kitchen-millwork": { meta_title: "Brooklyn Brownstone Kitchen Millwork: Park Slope to Bed-Stuy" },
  "commercial-millwork-nyc": { meta_title: "Commercial Millwork for NYC Offices, Retail & Clinics" },
  "corner-cabinets-lazy-susan-nyc-kitchens": { meta_title: "Corner Cabinets & Lazy Susans for NYC Galley Kitchens" },
  "custom-bathroom-vanity-nyc": { meta_title: "Custom Bathroom Vanities for NYC Apartments, Live Price" },
  "custom-entry-foyer-closet-millwork-manhattan": { meta_title: "Entry & Foyer Closet Millwork for Manhattan Apartments" },
  "custom-kitchen-cabinets-cost-nyc": { meta_title: "Custom Kitchen Cabinet Cost in NYC: What Drives the Price" },
  "custom-kitchen-timeline-nyc": { meta_title: "Custom Kitchen Cabinet Timeline in NYC, Week by Week" },
  "custom-wet-bar-wine-storage-manhattan": { meta_title: "Custom Wet Bar & Wine Storage Millwork in Manhattan" },
  "floor-to-ceiling-bulkhead-kitchen-cabinets-prewar-nyc": { meta_title: "Floor-to-Ceiling & Bulkhead Cabinets for Prewar NYC" },
  "how-to-order-custom-kitchen-cabinets-online-without-the-risk": { meta_title: "Order Custom Kitchen Cabinets Online Without Risk (2026)" },
  "manhattan-condo-coop-kitchen-millwork": { meta_title: "Manhattan Condo & Co-op Kitchen Millwork: COI, Elevators" },
  "plywood-vs-mdf-cabinet-boxes-nyc": { meta_title: "Plywood vs MDF Cabinet Boxes for NYC Apartments" },
  "queens-apartment-kitchen-millwork": { meta_title: "Queens Apartment Kitchen Millwork: Astoria to Forest Hills" },
  "reception-desk-commercial-millwork-brooklyn-retail": { meta_title: "Reception Desks & Commercial Millwork for Brooklyn Retail" },
  "what-are-custom-walnut-kitchen-cabinets-a-2026-guide": { meta_title: "Custom Walnut Kitchen Cabinets: 2026 Guide" },
  "what-is-a-kitchen-and-cabinets-design-consultation-2026-guide": { meta_title: "Kitchen & Cabinet Design Consultation: 2026 Guide" },
};

/** Apply the title overrides to a post from either source. */
export function applyBlogSeo<T extends { slug: string; title: string; meta_title?: string | null }>(post: T): T {
  const o = BLOG_TITLE_OVERRIDES[post.slug];
  if (!o) return post;
  const out = { ...post, title: o.title ?? post.title };
  if ("meta_title" in post) out.meta_title = o.meta_title ?? post.meta_title;
  return out;
}

export function mergedTarget(slug?: string): string | null {
  return (slug && MERGED_BLOG_POSTS[slug]) || null;
}
