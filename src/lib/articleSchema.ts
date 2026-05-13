/**
 * Centralized Article schema builder for guide / blog routes.
 * Ensures every long-form page emits a valid schema.org Article node
 * with consistent author, publisher, and dateModified handling.
 *
 * Usage:
 *   const articleSchema = buildArticleSchema({
 *     url: URL,
 *     headline: TITLE,
 *     description: DESC,
 *     datePublished: "2026-05-13",
 *     keywords: "best wood for cabinets, ...",
 *   });
 */
import { authorRef, AUTHOR_IDS, ORG_ID } from "@/data/authors";

export interface ArticleSchemaInput {
  /** Canonical URL of the page (no trailing slash). */
  url: string;
  headline: string;
  description: string;
  /** ISO date string (YYYY-MM-DD). */
  datePublished: string;
  /** ISO date string. Defaults to today. */
  dateModified?: string;
  /** OG/article hero image. Defaults to site og-image. */
  image?: string | string[];
  /** Comma-separated keyword string. */
  keywords?: string;
  /** Optional `about` summary for richer LLM context. */
  about?: string;
  /** Author key — defaults to founder. */
  author?: keyof typeof AUTHOR_IDS;
  /** Schema.org subtype: Article (default), BlogPosting, NewsArticle, TechArticle. */
  type?: "Article" | "BlogPosting" | "NewsArticle" | "TechArticle";
}

const DEFAULT_IMAGE = "https://greencabinetsny.com/og-image.jpg";

export function buildArticleSchema(input: ArticleSchemaInput) {
  const {
    url,
    headline,
    description,
    datePublished,
    dateModified = new Date().toISOString().slice(0, 10),
    image = DEFAULT_IMAGE,
    keywords,
    about,
    author = "golan",
    type = "Article",
  } = input;

  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#article`,
    headline,
    description,
    author: authorRef(author),
    publisher: { "@id": ORG_ID },
    datePublished,
    dateModified,
    image: Array.isArray(image) ? image : [image],
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(about ? { about } : {}),
    ...(keywords ? { keywords } : {}),
  } as const;
}

/**
 * Standard FAQPage schema builder — most guides ship a FAQ block.
 * Pairs naturally with buildArticleSchema().
 */
export function buildFaqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } as const;
}
