import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/Seo";
import { listBlogArticles } from "@/services/blogService";
import { BLOG_PAGE_SIZE, STATIC_BLOG_POSTS, STATIC_BLOG_SLUGS, orderBlogPosts } from "@/data/blogIndex";
import { MERGED_BLOG_POSTS, applyBlogSeo } from "@/data/blogSeo";
import { BOROUGH_HUBS, PLANNING_LINKS } from "@/data/siteLinks";
import { getPrerenderedBlogCards, toBlogCard, type BlogCard } from "@/lib/prerenderData";

function combine(remote: BlogCard[]): BlogCard[] {
  return orderBlogPosts([
    ...STATIC_BLOG_POSTS.map(toBlogCard),
    ...remote
      .filter((a) => !STATIC_BLOG_SLUGS.has(a.slug) && !MERGED_BLOG_POSTS[a.slug])
      .map(applyBlogSeo),
  ]);
}

export default function Blog() {
  const { page: pageParam } = useParams<{ page?: string }>();
  const page = pageParam ? Number(pageParam) : 1;
  const [articles, setArticles] = useState<BlogCard[]>(() => combine(getPrerenderedBlogCards()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listBlogArticles()
      .then((remote) => setArticles(combine(remote.map(toBlogCard))))
      .catch((e) => setError(e?.message ?? "Failed to load"));
  }, []);

  const pages = Math.max(1, Math.ceil(articles.length / BLOG_PAGE_SIZE));
  const shown = useMemo(
    () => articles.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE),
    [articles, page],
  );

  if (pageParam && (!Number.isInteger(page) || page < 2)) return <Navigate to="/blog" replace />;

  const path = page > 1 ? `/blog/page/${page}` : "/blog";
  const pageHref = (n: number) => (n === 1 ? "/blog" : `/blog/page/${n}`);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={page > 1 ? `Blog, page ${page} | Green Cabinets NY` : "Blog | Green Cabinets NY"}
        description="Insights, guides, and updates from Green Cabinets NY on custom kitchens, vanities, and millwork."
        path={path}
      />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 container mx-auto px-4 py-16 sm:py-20 md:py-28 focus:outline-none">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog{page > 1 ? `, page ${page}` : ""}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Design ideas, project stories, and craft notes from Green Cabinets NY — custom
            millwork by appointment in Brooklyn, Manhattan, and Queens.
          </p>
        </header>

        {error && articles.length === 0 && (
          <p className="text-center text-destructive">{error}</p>
        )}
        {articles.length === 0 && !error && (
          <p className="text-center text-muted-foreground">No articles yet — check back soon.</p>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((a, i) => (
            <Link
              key={a.slug}
              to={`/blog/${a.slug}`}
              className="group block rounded-lg overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow"
            >
              {a.image_url && (
                <img
                  src={a.image_url}
                  alt=""
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                  width={640}
                  height={360}
                  className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="p-5">
                <time dateTime={a.created_at} className="text-xs uppercase tracking-wider text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    timeZone: "America/New_York",
                  })}
                </time>
                <h2 className="text-xl font-semibold mt-2 mb-2 group-hover:text-primary transition-colors">
                  {a.title}
                </h2>
                {a.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {pages > 1 && (
          <nav aria-label="Blog pages" className="mt-12 flex flex-wrap justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                to={pageHref(n)}
                aria-current={n === page ? "page" : undefined}
                className={`min-w-11 rounded-md border px-3 py-2 text-center ${n === page ? "border-primary font-semibold" : "border-border hover:border-primary"}`}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}

        <section aria-labelledby="by-area" className="mt-16 border-t border-border pt-10">
          <h2 id="by-area" className="text-2xl font-bold mb-6">Custom cabinets by area</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BOROUGH_HUBS.map(({ hub, neighborhoods }) => (
              <div key={hub.to}>
                <Link to={hub.to} className="font-semibold hover:text-primary">{hub.label}</Link>
                {neighborhoods.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {neighborhoods.map((n) => (
                      <li key={n.to}><Link to={n.to} className="hover:text-primary">{n.label}</Link></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Planning tools:{" "}
            {PLANNING_LINKS.map((l, i) => (
              <span key={l.to}>
                {i > 0 && " · "}
                <Link to={l.to} className="underline hover:text-primary">{l.label}</Link>
              </span>
            ))}
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
