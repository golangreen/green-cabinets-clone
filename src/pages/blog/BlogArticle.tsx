import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/Seo";
import { getBlogArticleBySlug, type BlogArticle } from "@/services/blogService";
import { getStaticBlogPost, relatedBlogPosts } from "@/data/blogIndex";
import { POST_PRIMARY_LOCATION, applyBlogSeo, mergedTarget } from "@/data/blogSeo";
import { authorRef, ORG_ID } from "@/data/authors";
import AuthorByline from "@/components/marketing/AuthorByline";
import { fitDescription } from "@/lib/metaText";
import { normalizeArticleHtml } from "@/lib/normalizeArticleHtml";
import { boxQuickFacts } from "@/lib/quickFacts";
import { buildFaqSchema } from "@/lib/articleSchema";
import { getPrerenderedArticle } from "@/lib/prerenderData";

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const mergedInto = mergedTarget(slug);
  const prerenderedDb = getPrerenderedArticle(slug);
  const staticArticle = getStaticBlogPost(slug) ?? (prerenderedDb ? applyBlogSeo(prerenderedDb) : null);
  const [article, setArticle] = useState<BlogArticle | null>(staticArticle);
  const [loading, setLoading] = useState(!staticArticle);
  const [notFound, setNotFound] = useState(false);
  // normalizeArticleHtml needs the browser's DOMParser, so it runs after the
  // first (hydrating) render; until then the HTML matches the pre-render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!slug || mergedTarget(slug)) return;
    const preset = getStaticBlogPost(slug);
    setNotFound(false);
    if (preset) {
      setArticle(preset);
      setLoading(false);
      return;
    }
    // A pre-rendered database article is shown right away and refreshed
    // quietly; otherwise show the loading state while it is fetched.
    const pre = getPrerenderedArticle(slug);
    const prerendered = pre ? applyBlogSeo(pre) : null;
    setArticle(prerendered);
    setLoading(!prerendered);
    getBlogArticleBySlug(slug)
      .then((a) => {
        if (!a) {
          setArticle(null);
          setNotFound(true);
        } else setArticle(applyBlogSeo(a));
      })
      .catch(() => {
        if (!prerendered) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);


  // Merged near-duplicate post: the Worker 301s this URL; in-app navigation
  // lands here, so send it to the kept page.
  if (mergedInto) return <Navigate to={`/blog/${mergedInto}`} replace />;

  const location = article ? POST_PRIMARY_LOCATION[article.slug] : undefined;
  const related = article ? relatedBlogPosts(article.slug, article.tags ?? [], article.title) : [];
  const description = fitDescription(article?.meta_description || article?.excerpt || "") || undefined;

  return (
    <div className="min-h-screen flex flex-col">
      {article && (
        <>
          <Seo
            title={article.meta_title || article.title}
            description={description}
            path={`/blog/${article.slug}`}
            image={article.image_url || undefined}
          />
          <Helmet>
            {/* The cover photo is the LCP element: start loading it with the HTML. */}
            {article.image_url && <link rel="preload" as="image" href={article.image_url} {...{ fetchpriority: "high" }} />}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: article.title,
                description,
                image: article.image_url || undefined,
                datePublished: article.created_at,
                dateModified: (article as any).updated_at || article.created_at,
                mainEntityOfPage: `https://greencabinetsny.com/blog/${article.slug}`,
                author: authorRef("golan"),
                publisher: {
                  "@type": "Organization",
                  "@id": ORG_ID,
                  name: "Green Cabinets NY",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://greencabinetsny.com/icon-512.png",
                  },
                },
              })}
            </script>
            {article.faqs && article.faqs.length > 0 && (
              <script type="application/ld+json">
                {JSON.stringify(buildFaqSchema(article.faqs))}
              </script>
            )}
          </Helmet>
        </>
      )}
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 container mx-auto px-4 py-16 sm:py-20 md:py-24 max-w-3xl">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to Blog
        </Link>

        {loading && <p className="mt-8 text-muted-foreground" aria-busy="true">Loading…</p>}
        {notFound && (
          <div className="mt-8">
            <Helmet>
              <title>Article not found | Green Cabinets NY</title>
              <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <h1 className="text-3xl font-bold mb-2">Article not found</h1>
            <p className="text-muted-foreground">This post may have been removed.</p>
          </div>
        )}

        {article && (
          <article className="mt-6">
            <header className="mb-8">
              <time dateTime={article.created_at} className="text-xs uppercase tracking-wider text-muted-foreground">
                {new Date(article.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "America/New_York",
                })}
              </time>
              <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">{article.title}</h1>
              {article.excerpt && (
                <p className="text-lg text-muted-foreground">{article.excerpt}</p>
              )}
              <AuthorByline author="golan" label="By" className="mt-4" />
              {location && (
                <p className="mt-4 rounded-md border border-border bg-secondary/40 px-4 py-3 text-sm">
                  Planning a kitchen here? See our{" "}
                  <Link to={location.path} className="font-semibold underline underline-offset-2 hover:text-primary">
                    {location.label}
                  </Link>{" "}
                  page for projects, building notes and a quote.
                </p>
              )}
              {article.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                width={1280}
                height={720}
                decoding="async"
                {...{ fetchpriority: "high" }}
                className="w-full rounded-lg mb-8 aspect-video object-cover"
              />
            )}

            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: mounted ? normalizeArticleHtml(boxQuickFacts(article.content_html)) : boxQuickFacts(article.content_html) }}
            />
          </article>
        )}

        {article && related.length > 0 && (
          <aside aria-labelledby="related-heading" className="mt-16 border-t border-border pt-10">
            <h2 id="related-heading" className="text-2xl font-bold mb-4">Related articles</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link to={`/blog/${r.slug}`} className="block rounded-md border border-border p-4 hover:border-primary hover:text-primary">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              More: <Link to="/custom-kitchen-cabinets-brooklyn" className="underline hover:text-primary">Brooklyn</Link>,{" "}
              <Link to="/custom-kitchen-cabinets-manhattan" className="underline hover:text-primary">Manhattan</Link> and{" "}
              <Link to="/custom-kitchen-cabinets-queens" className="underline hover:text-primary">Queens</Link> cabinet guides ·{" "}
              <Link to="/blog" className="underline hover:text-primary">all articles</Link>
            </p>
          </aside>
        )}
      </main>
      <Footer />
    </div>
  );
}
