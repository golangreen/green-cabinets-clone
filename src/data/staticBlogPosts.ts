import type { BlogArticle } from "@/services/blogService";

/**
 * Statically bundled blog posts. These render immediately with no async fetch,
 * so the article HTML is present as soon as the JS bundle executes.
 */
export const STATIC_BLOG_POSTS: BlogArticle[] = [
  {
    id: "static-custom-closet-millwork-brooklyn",
    external_id: null,
    slug: "custom-closet-millwork-brooklyn",
    title: "Custom Closet Millwork for Brooklyn Apartments",
    excerpt: "Brooklyn closets are never a catalog rectangle. How custom closet millwork \u2014 walk-ins, reach-ins, bulkhead and pipe workarounds \u2014 gets designed and installed under co-op rules, by appointment in Brooklyn, Manhattan, and Queens.",
    meta_title: "Custom Closet Millwork for Brooklyn Apartments",
    meta_description: "Custom closet millwork for Brooklyn apartments. Green Cabinets NY designs walk-ins and reach-ins by appointment in Brooklyn, Manhattan, and Queens.",
    tags: ["custom closets", "closet millwork", "brooklyn", "walk-in closet", "reach-in closet"],
    image_url: null,
    content_image_urls: [],
    canonical_url: "https://greencabinetsny.com/blog/custom-closet-millwork-brooklyn",
    created_at: "2026-08-30T00:00:00+00:00",
    updated_at: "2026-08-30T00:00:00+00:00",
    content_html: "<h2>Why Brooklyn closets are never standard</h2>\n<p>Brooklyn closets fail for a boring reason: the room is never a rectangle from a catalog. A brownstone reach-in is deep and narrow. A Bushwick condo has a bulkhead. A Park Slope hallway closet shares a wall with a stack of pipes. Stock boxes fight that. Custom millwork works with it.</p>\n<p>Green Cabinets NY designs and installs custom closets by appointment in Brooklyn, Manhattan, and Queens. We are not a walk-in shop. You get a plan, millwork spec'd to the room you actually have, and an install that can live with co-op rules.</p>\n<h2>Walk-ins vs reach-ins</h2>\n<p>A walk-in earns its keep when the hanging, shelving, and drawer runs are laid out around how you actually dress \u2014 double-hang for shirts and pants, a long-hang bay for coats and dresses, drawers where the light is best. A reach-in is a different discipline: every inch of depth matters, door swing or bifold clearance decides the interior, and a well-placed tower of drawers can replace a dresser entirely.</p>\n<h2>Working around bulkheads, pipes, and out-of-square walls</h2>\n<p>Pre-war and brownstone rooms are rarely square, and modern condo closets hide sprinkler pipes, risers, and soffits. Custom millwork is scribed and notched to those conditions instead of leaving dead gaps. That is the difference between a closet that looks installed and one that looks built in.</p>\n<h2>Co-op and condo logistics</h2>\n<p>Most Brooklyn buildings require a certificate of insurance, an approved alteration agreement for anything beyond furniture, and deliveries booked around the freight elevator and quiet hours. We plan installs around those rules so the job does not stall at the front desk.</p>\n<h2>Materials and finishes</h2>\n<p>Closet interiors take daily abuse, so we spec durable melamine and veneer panels from suppliers like Tafisa, Egger, and Shinnoki \u2014 the same finish families we use on our <a href=\"https://greencabinetsny.com/designer\">custom bathroom vanities</a> \u2014 with edge banding that matches and hardware sized for real loads.</p>\n<h2>How a project works</h2>\n<p>It starts with a measuring visit by appointment. You get a layout and a fixed scope before anything is built, the millwork is produced through our vetted suppliers, and installation is scheduled around your building's rules. Most closet installs complete in a day or two once the millwork arrives.</p>\n<p>Planning a renovation beyond the closet? See our guides to <a href=\"https://greencabinetsny.com/custom-kitchen-cabinets-brooklyn\">custom kitchen cabinets in Brooklyn</a> and <a href=\"https://greencabinetsny.com/blog/is-a-custom-bathroom-vanity-worth-it-for-nyc-homes\">whether a custom bathroom vanity is worth it</a>.</p>\n<h2>Get a quote</h2>\n<p>We serve Brooklyn, Manhattan, and Queens by appointment. Call <a href=\"tel:+17188045488\">(718) 804-5488</a> or email <a href=\"mailto:orders@greencabinetsny.com\">orders@greencabinetsny.com</a> with rough dimensions and a photo of the space, and we will take it from there.</p>",
  },
];

export const STATIC_BLOG_SLUGS = new Set(STATIC_BLOG_POSTS.map((p) => p.slug));

export function getStaticBlogPost(slug?: string): BlogArticle | null {
  if (!slug) return null;
  return STATIC_BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}
