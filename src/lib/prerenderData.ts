import type { BlogArticle } from "@/services/blogService";

/**
 * Build-time only: the pre-renderer (scripts/prerender.mjs) fetches the
 * database blog articles once and registers them here so BlogArticle can
 * render their full text into static HTML. The pre-renderer also embeds
 * that article as JSON (<script id="prerendered-article">) so the browser
 * starts from the same data and hydrates without a re-render; BlogArticle
 * still refreshes it from Supabase as before.
 */
const articles = new Map<string, BlogArticle>();

export function setPrerenderedArticles(list: BlogArticle[]) {
  articles.clear();
  for (const a of list) if (a?.slug) articles.set(a.slug, a);
}

export function getPrerenderedArticle(slug?: string): BlogArticle | null {
  if (!slug) return null;
  const known = articles.get(slug);
  if (known) return known;
  if (typeof document === "undefined") return null;
  const el = document.getElementById("prerendered-article");
  if (!el?.textContent) return null;
  try {
    const a = JSON.parse(el.textContent) as BlogArticle;
    return a?.slug === slug ? a : null;
  } catch {
    return null;
  }
}
