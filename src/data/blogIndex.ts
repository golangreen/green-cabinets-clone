import type { BlogArticle } from "@/services/blogService";
import {
  STATIC_BLOG_POSTS as BASE_POSTS,
  getStaticBlogPost as getBaseStaticBlogPost,
} from "@/data/staticBlogPosts";
import { williamsburgKitchenPost } from "@/data/blogPosts/williamsburgKitchenPost";
import { fortGreeneKitchenPost } from "@/data/blogPosts/fortGreeneKitchenPost";
import { greenpointKitchenPost } from "@/data/blogPosts/greenpointKitchenPost";
import { appliancePanelPost } from "@/data/blogPosts/appliancePanelPost";
import { wetBarWineStorageManhattanPost } from "@/data/blogPosts/wetBarWineStorageManhattanPost";
import { upperEastSideCoopsPost } from "@/data/blogPosts/upperEastSideCoopsPost";
import { toeKickPantryPullOutsPost } from "@/data/blogPosts/toeKickPantryPullOutsPost";
import { entryFoyerClosetManhattanPost } from "@/data/blogPosts/entryFoyerClosetManhattanPost";
import { cobbleHillCarrollGardensPost } from "@/data/blogPosts/cobbleHillCarrollGardensPost";
import { prospectHeightsBrooklynPost } from "@/data/blogPosts/prospectHeightsBrooklynPost";
import { floorToCeilingBulkheadPost } from "@/data/blogPosts/floorToCeilingBulkheadPost";
import { brooklynBrownstoneWalkInClosetPost } from "@/data/blogPosts/brooklynBrownstoneWalkInClosetPost";
import { boerumHillBrooklynPost } from "@/data/blogPosts/boerumHillBrooklynPost";
import { parkSlopeBathroomVanityPost } from "@/data/blogPosts/parkSlopeBathroomVanityPost";
import { underStairStorageBrooklynPost } from "@/data/blogPosts/underStairStorageBrooklynPost";

/** Prepend newest SEO posts here without rewriting the large staticBlogPosts bundle. */
export const STATIC_BLOG_POSTS: BlogArticle[] = [
  underStairStorageBrooklynPost,
  boerumHillBrooklynPost,
  parkSlopeBathroomVanityPost,
  brooklynBrownstoneWalkInClosetPost,
  floorToCeilingBulkheadPost,
  prospectHeightsBrooklynPost,
  cobbleHillCarrollGardensPost,
  entryFoyerClosetManhattanPost,
  toeKickPantryPullOutsPost,
  upperEastSideCoopsPost,
  wetBarWineStorageManhattanPost,
  appliancePanelPost,
  greenpointKitchenPost,
  fortGreeneKitchenPost,
  williamsburgKitchenPost,
  ...BASE_POSTS.filter(
    (p) =>
      p.slug !== williamsburgKitchenPost.slug &&
      p.slug !== fortGreeneKitchenPost.slug &&
      p.slug !== greenpointKitchenPost.slug &&
      p.slug !== appliancePanelPost.slug &&
      p.slug !== wetBarWineStorageManhattanPost.slug &&
      p.slug !== upperEastSideCoopsPost.slug &&
      p.slug !== toeKickPantryPullOutsPost.slug &&
      p.slug !== entryFoyerClosetManhattanPost.slug &&
      p.slug !== cobbleHillCarrollGardensPost.slug &&
      p.slug !== floorToCeilingBulkheadPost.slug &&
      p.slug !== prospectHeightsBrooklynPost.slug &&
      p.slug !== brooklynBrownstoneWalkInClosetPost.slug &&
      p.slug !== parkSlopeBathroomVanityPost.slug &&
      p.slug !== boerumHillBrooklynPost.slug &&
      p.slug !== underStairStorageBrooklynPost.slug,
  ),
];

export const STATIC_BLOG_SLUGS = new Set(STATIC_BLOG_POSTS.map((p) => p.slug));

/** Slugs pinned to the top of /blog, in order, regardless of published date. */
export const PINNED_BLOG_SLUGS: string[] = [
  underStairStorageBrooklynPost.slug,
  boerumHillBrooklynPost.slug,
  parkSlopeBathroomVanityPost.slug,
  brooklynBrownstoneWalkInClosetPost.slug,
  floorToCeilingBulkheadPost.slug,
  prospectHeightsBrooklynPost.slug,
  cobbleHillCarrollGardensPost.slug,
  entryFoyerClosetManhattanPost.slug,
];

/** Newest-first ordering with pinned posts forced to the top. */
export function orderBlogPosts<T extends { slug: string; created_at: string }>(posts: T[]): T[] {
  const rank = (slug: string) => {
    const i = PINNED_BLOG_SLUGS.indexOf(slug);
    return i === -1 ? PINNED_BLOG_SLUGS.length : i;
  };
  return [...posts].sort(
    (a, b) =>
      rank(a.slug) - rank(b.slug) || +new Date(b.created_at) - +new Date(a.created_at),
  );
}

export function getStaticBlogPost(slug?: string): BlogArticle | null {
  if (!slug) return null;
  if (slug === underStairStorageBrooklynPost.slug) return underStairStorageBrooklynPost;
  if (slug === boerumHillBrooklynPost.slug) return boerumHillBrooklynPost;
  if (slug === parkSlopeBathroomVanityPost.slug) return parkSlopeBathroomVanityPost;
  if (slug === brooklynBrownstoneWalkInClosetPost.slug) return brooklynBrownstoneWalkInClosetPost;
  if (slug === floorToCeilingBulkheadPost.slug) return floorToCeilingBulkheadPost;
  if (slug === prospectHeightsBrooklynPost.slug) return prospectHeightsBrooklynPost;
  if (slug === cobbleHillCarrollGardensPost.slug) return cobbleHillCarrollGardensPost;
  if (slug === entryFoyerClosetManhattanPost.slug) return entryFoyerClosetManhattanPost;
  if (slug === toeKickPantryPullOutsPost.slug) return toeKickPantryPullOutsPost;
  if (slug === upperEastSideCoopsPost.slug) return upperEastSideCoopsPost;
  if (slug === wetBarWineStorageManhattanPost.slug) return wetBarWineStorageManhattanPost;
  if (slug === appliancePanelPost.slug) return appliancePanelPost;
  if (slug === greenpointKitchenPost.slug) return greenpointKitchenPost;
  if (slug === fortGreeneKitchenPost.slug) return fortGreeneKitchenPost;
  if (slug === williamsburgKitchenPost.slug) return williamsburgKitchenPost;
  return getBaseStaticBlogPost(slug);
}
