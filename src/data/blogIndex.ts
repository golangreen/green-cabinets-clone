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

/** Prepend newest SEO posts here without rewriting the large staticBlogPosts bundle. */
export const STATIC_BLOG_POSTS: BlogArticle[] = [
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
      p.slug !== toeKickPantryPullOutsPost.slug,
  ),
];

export const STATIC_BLOG_SLUGS = new Set(STATIC_BLOG_POSTS.map((p) => p.slug));

export function getStaticBlogPost(slug?: string): BlogArticle | null {
  if (!slug) return null;
  if (slug === toeKickPantryPullOutsPost.slug) return toeKickPantryPullOutsPost;
  if (slug === upperEastSideCoopsPost.slug) return upperEastSideCoopsPost;
  if (slug === wetBarWineStorageManhattanPost.slug) return wetBarWineStorageManhattanPost;
  if (slug === appliancePanelPost.slug) return appliancePanelPost;
  if (slug === greenpointKitchenPost.slug) return greenpointKitchenPost;
  if (slug === fortGreeneKitchenPost.slug) return fortGreeneKitchenPost;
  if (slug === williamsburgKitchenPost.slug) return williamsburgKitchenPost;
  return getBaseStaticBlogPost(slug);
}
