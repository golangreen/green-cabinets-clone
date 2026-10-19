/**
 * Build-time server renderer. `vite build --ssr src/entry-server.tsx` turns
 * this into dist-ssr/entry-server.js, and scripts/prerender.mjs calls
 * render(url) for every public route to write static HTML into dist/.
 * Never shipped to the browser.
 */
import { StrictMode, type ReactNode } from "react";
import { renderToPipeableStream, renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { setPrerenderedArticles } from "@/lib/prerenderData";
import { STATIC_BLOG_POSTS } from "@/data/blogIndex";
import { BOROUGHS } from "@/data/boroughSeo";
import { NEIGHBORHOODS } from "@/data/neighborhoodSeo";
import { WOOD_SPECIES } from "@/data/woodSpecies";
import { CASE_STUDIES } from "@/data/caseStudies";
import type { BlogArticle } from "@/services/blogService";

export { setPrerenderedArticles };
export { MERGED_BLOG_POSTS } from "@/data/blogSeo";
export { BLOG_PAGE_SIZE } from "@/data/blogIndex";
export const STATIC_BLOG_COUNT = STATIC_BLOG_POSTS.length;

/** Route list built from the data files (cross-checked against the sitemap). */
export function dataRoutes(): string[] {
  return [
    ...STATIC_BLOG_POSTS.map((p) => `/blog/${p.slug}`),
    ...Object.values(BOROUGHS).map((b) => `/custom-kitchen-cabinets-${b.slug}`),
    ...Object.values(NEIGHBORHOODS).map((n) => `/custom-kitchen-cabinets-${n.slug}`),
    ...WOOD_SPECIES.map((w) => `/wood-species/${w.slug}`),
    ...CASE_STUDIES.map((c) => `/case-studies/${c.slug}`),
  ];
}

export type { BlogArticle };

export interface RenderResult {
  html: string;
  helmet: HelmetServerState | undefined;
}

function buildApp(url: string, helmetContext: { helmet?: HelmetServerState }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, enabled: false } },
  });
  // Same tree as src/main.tsx so the browser can hydrate the static HTML
  // in place instead of re-rendering it.
  return (
    <StrictMode>
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <App Router={({ children }: { children?: ReactNode }) => <StaticRouter location={url}>{children}</StaticRouter>} />
      </QueryClientProvider>
    </HelmetProvider>
    </StrictMode>
  );
}

/** First pass: let every lazy route/component chunk load (output discarded). */
function loadLazyChunks(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      stream.abort();
      reject(new Error(`render timeout for ${url}`));
    }, 20_000);
    const stream = renderToPipeableStream(buildApp(url, {}), {
      onAllReady() {
        clearTimeout(timer);
        stream.abort();
        resolve();
      },
      onShellError(err) {
        clearTimeout(timer);
        reject(err);
      },
    });
  });
}

/**
 * Second pass with renderToString: with the lazy chunks already loaded it
 * renders synchronously in full. (The streaming renderer is only used to
 * wait for chunks; its byte output can corrupt multi-byte characters.)
 */
export async function render(url: string): Promise<RenderResult> {
  await loadLazyChunks(url);
  const helmetContext: { helmet?: HelmetServerState } = {};
  const html = renderToString(buildApp(url, helmetContext));
  return { html, helmet: helmetContext.helmet };
}
