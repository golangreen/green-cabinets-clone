import type { BlogArticle } from "@/services/blogService";
import { MERGED_BLOG_POSTS, applyBlogSeo } from "@/data/blogSeo";
import {
  STATIC_BLOG_POSTS as BASE_POSTS,
  getStaticBlogPost as getBaseStaticBlogPost,
} from "@/data/staticBlogPosts";
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
import { parkSlopeBathroomVanityPost } from "@/data/blogPosts/parkSlopeBathroomVanityPost";
import { underStairStorageBrooklynPost } from "@/data/blogPosts/underStairStorageBrooklynPost";
import { forestHillsQueensPost } from "@/data/blogPosts/forestHillsQueensPost";
import { linenClosetManhattanCoopsPost } from "@/data/blogPosts/linenClosetManhattanCoopsPost";
import { rangeHoodMantleMillworkPost } from "@/data/blogPosts/rangeHoodMantleMillworkPost";
import { kitchenIslandNycLoftsPost } from "@/data/blogPosts/kitchenIslandNycLoftsPost";
import { ditmasParkBrooklynPost } from "@/data/blogPosts/ditmasParkBrooklynPost";
import { bayRidgeBrooklynPost } from "@/data/blogPosts/bayRidgeBrooklynPost";
import { clintonHillBrooklynPost } from "@/data/blogPosts/clintonHillBrooklynPost";
import { jacksonHeightsQueensPost } from "@/data/blogPosts/jacksonHeightsQueensPost";
import { pullOutTrashRecyclingPost } from "@/data/blogPosts/pullOutTrashRecyclingPost";
import { customKitchenCabinetsCostNycPost } from "@/data/blogPosts/customKitchenCabinetsCostNycPost";
import { radiatorCoversBuiltInsPrewarNycPost } from "@/data/blogPosts/radiatorCoversBuiltInsPrewarNycPost";
import { customKitchenTimelineNycPost } from "@/data/blogPosts/customKitchenTimelineNycPost";
import { plywoodVsMdfCabinetBoxesNycPost } from "@/data/blogPosts/plywoodVsMdfCabinetBoxesNycPost";
import { cornerCabinetsLazySusanNycKitchensPost } from "@/data/blogPosts/cornerCabinetsLazySusanNycKitchensPost";
import { faceFrameVsFramelessCabinetsNycPost } from "@/data/blogPosts/faceFrameVsFramelessCabinetsNycPost";
import { countertopTemplatingCabinetInstallNycPost } from "@/data/blogPosts/countertopTemplatingCabinetInstallNycPost";
import { kidsRoomBuiltInsBunkBedsNycPost } from "@/data/blogPosts/kidsRoomBuiltInsBunkBedsNycPost";
import { cabinetPullsKnobsHardwareSizingNycPost } from "@/data/blogPosts/cabinetPullsKnobsHardwareSizingNycPost";

/** Prepend newest SEO posts here without rewriting the large staticBlogPosts bundle. */
const ALL_STATIC_POSTS: BlogArticle[] = [
  cabinetPullsKnobsHardwareSizingNycPost,
  kidsRoomBuiltInsBunkBedsNycPost,
  countertopTemplatingCabinetInstallNycPost,
  faceFrameVsFramelessCabinetsNycPost,
  cornerCabinetsLazySusanNycKitchensPost,
  radiatorCoversBuiltInsPrewarNycPost,
  customKitchenTimelineNycPost,
  plywoodVsMdfCabinetBoxesNycPost,
  customKitchenCabinetsCostNycPost,
  pullOutTrashRecyclingPost,
  rangeHoodMantleMillworkPost,
  ditmasParkBrooklynPost,
  bayRidgeBrooklynPost,
  clintonHillBrooklynPost,
  jacksonHeightsQueensPost,
  kitchenIslandNycLoftsPost,
  linenClosetManhattanCoopsPost,
  forestHillsQueensPost,
  underStairStorageBrooklynPost,
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
    ...BASE_POSTS.filter(
    (p) =>
      p.slug !== cornerCabinetsLazySusanNycKitchensPost.slug &&
      p.slug !== radiatorCoversBuiltInsPrewarNycPost.slug &&
      p.slug !== customKitchenTimelineNycPost.slug &&
      p.slug !== plywoodVsMdfCabinetBoxesNycPost.slug &&
      p.slug !== customKitchenCabinetsCostNycPost.slug &&
      p.slug !== pullOutTrashRecyclingPost.slug &&
      p.slug !== ditmasParkBrooklynPost.slug &&
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
      p.slug !== underStairStorageBrooklynPost.slug &&
      p.slug !== forestHillsQueensPost.slug &&
      p.slug !== linenClosetManhattanCoopsPost.slug &&
      p.slug !== rangeHoodMantleMillworkPost.slug &&
      p.slug !== kitchenIslandNycLoftsPost.slug &&
      p.slug !== jacksonHeightsQueensPost.slug &&
      p.slug !== clintonHillBrooklynPost.slug &&
      p.slug !== bayRidgeBrooklynPost.slug,
  ),
];

/** Every static post, minus merged-away ones, with title overrides applied. */
export const STATIC_BLOG_POSTS: BlogArticle[] = ALL_STATIC_POSTS.filter((p) => !MERGED_BLOG_POSTS[p.slug]).map(applyBlogSeo);

export const STATIC_BLOG_SLUGS = new Set(STATIC_BLOG_POSTS.map((p) => p.slug));

/** Slugs pinned to the top of /blog, in order, regardless of published date. */
export const PINNED_BLOG_SLUGS: string[] = [
  cabinetPullsKnobsHardwareSizingNycPost.slug,
  kidsRoomBuiltInsBunkBedsNycPost.slug,
  countertopTemplatingCabinetInstallNycPost.slug,
  faceFrameVsFramelessCabinetsNycPost.slug,
  cornerCabinetsLazySusanNycKitchensPost.slug,
  radiatorCoversBuiltInsPrewarNycPost.slug,
  customKitchenTimelineNycPost.slug,
  plywoodVsMdfCabinetBoxesNycPost.slug,
  customKitchenCabinetsCostNycPost.slug,
  pullOutTrashRecyclingPost.slug,
  rangeHoodMantleMillworkPost.slug,
  ditmasParkBrooklynPost.slug,
  bayRidgeBrooklynPost.slug,
  clintonHillBrooklynPost.slug,
  jacksonHeightsQueensPost.slug,
  kitchenIslandNycLoftsPost.slug,
  linenClosetManhattanCoopsPost.slug,
  forestHillsQueensPost.slug,
  underStairStorageBrooklynPost.slug,
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

const STATIC_BY_SLUG = new Map(STATIC_BLOG_POSTS.map((p) => [p.slug, p]));

export function getStaticBlogPost(slug?: string): BlogArticle | null {
  if (!slug || MERGED_BLOG_POSTS[slug]) return null;
  // Every post listed in STATIC_BLOG_POSTS resolves here, so a new post can't
  // be in the index and sitemap yet show "Article not found".
  const listed = STATIC_BY_SLUG.get(slug);
  if (listed) return listed;
  if (slug === cornerCabinetsLazySusanNycKitchensPost.slug) return cornerCabinetsLazySusanNycKitchensPost;
  if (slug === radiatorCoversBuiltInsPrewarNycPost.slug) return radiatorCoversBuiltInsPrewarNycPost;
  if (slug === customKitchenTimelineNycPost.slug) return customKitchenTimelineNycPost;
  if (slug === plywoodVsMdfCabinetBoxesNycPost.slug) return plywoodVsMdfCabinetBoxesNycPost;
  if (slug === customKitchenCabinetsCostNycPost.slug) return customKitchenCabinetsCostNycPost;
  if (slug === pullOutTrashRecyclingPost.slug) return pullOutTrashRecyclingPost;
  if (slug === rangeHoodMantleMillworkPost.slug) return rangeHoodMantleMillworkPost;
  if (slug === ditmasParkBrooklynPost.slug) return ditmasParkBrooklynPost;
  if (slug === bayRidgeBrooklynPost.slug) return bayRidgeBrooklynPost;
  if (slug === clintonHillBrooklynPost.slug) return clintonHillBrooklynPost;
  if (slug === jacksonHeightsQueensPost.slug) return jacksonHeightsQueensPost;
  if (slug === kitchenIslandNycLoftsPost.slug) return kitchenIslandNycLoftsPost;
  if (slug === linenClosetManhattanCoopsPost.slug) return linenClosetManhattanCoopsPost;
  if (slug === forestHillsQueensPost.slug) return forestHillsQueensPost;
  if (slug === underStairStorageBrooklynPost.slug) return underStairStorageBrooklynPost;
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
  const base = getBaseStaticBlogPost(slug);
  return base ? applyBlogSeo(base) : null;
}

const BOROUGH_WORDS = ["brooklyn", "manhattan", "queens", "staten"];
const words = (s: string) => new Set(s.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3));

/**
 * Related static posts for the bottom of an article: shared tags first,
 * then shared slug/title words, same borough as a tie-breaker. Static posts
 * only, so the pre-rendered HTML and the first browser render match.
 */
export function relatedBlogPosts(slug: string, tags: string[] = [], title = "", n = 4): BlogArticle[] {
  const myTags = new Set(tags.map((t) => t.toLowerCase()));
  const myWords = words(`${slug} ${title}`);
  const myBorough = BOROUGH_WORDS.find((b) => slug.includes(b));
  return STATIC_BLOG_POSTS.filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      for (const t of p.tags ?? []) if (myTags.has(t.toLowerCase())) score += 3;
      for (const w of words(`${p.slug} ${p.title}`)) if (myWords.has(w)) score += 1;
      if (myBorough && p.slug.includes(myBorough)) score += 2;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.slug.localeCompare(b.p.slug))
    .slice(0, n)
    .map((x) => x.p);
}

/** Posts per blog index page; scripts/prerender.mjs pre-renders every page. */
export const BLOG_PAGE_SIZE = 24;
