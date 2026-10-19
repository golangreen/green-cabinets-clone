/**
 * Hub links: service → borough → neighborhood → posts. Rendered on the
 * Services page, the borough guides and every neighborhood page so each
 * location page is reachable within a few clicks and links back up.
 * Static data only (no fetches), so pre-rendered HTML matches hydration.
 */
import { Link } from "react-router-dom";
import { BOROUGH_HUBS, PLANNING_LINKS, type SiteLink } from "@/data/siteLinks";
import { STATIC_BLOG_POSTS, orderBlogPosts } from "@/data/blogIndex";
import { POST_PRIMARY_LOCATION } from "@/data/blogSeo";

interface Props {
  /** Hub path of the current borough, e.g. "/custom-kitchen-cabinets-brooklyn". */
  boroughHub?: string;
  /** Path of the current page, left out of the lists. */
  current?: string;
  /** Words to match post slugs on (neighborhood slug, borough name). */
  postKeywords?: string[];
  heading?: string;
  className?: string;
}

function postsFor(keywords: string[], current?: string, n = 6): SiteLink[] {
  const kw = keywords.map((k) => k.toLowerCase());
  return orderBlogPosts(STATIC_BLOG_POSTS)
    .filter((p) => POST_PRIMARY_LOCATION[p.slug]?.path === current || kw.some((k) => p.slug.includes(k)))
    .slice(0, n)
    .map((p) => ({ to: `/blog/${p.slug}`, label: p.title }));
}

const linkCls = "hover:text-primary underline-offset-2 hover:underline";

export default function AreaLinks({ boroughHub, current, postKeywords = [], heading = "Explore by area", className = "" }: Props) {
  const own = BOROUGH_HUBS.find((b) => b.hub.to === boroughHub);
  const others = BOROUGH_HUBS.filter((b) => b !== own);
  const posts = postKeywords.length ? postsFor(postKeywords, current) : [];

  return (
    <nav aria-label={heading} className={`container mx-auto px-4 sm:px-6 max-w-5xl py-12 text-sm ${className}`}>
      <h2 className="text-2xl font-bold mb-6">{heading}</h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {own && (
          <div>
            <p className="font-semibold mb-2">
              {own.hub.to === current ? own.hub.label : <Link to={own.hub.to} className={linkCls}>{own.hub.label} custom cabinets</Link>}
            </p>
            <ul className="space-y-1 opacity-80">
              {own.neighborhoods.filter((x) => x.to !== current).map((x) => (
                <li key={x.to}><Link to={x.to} className={linkCls}>{x.label}</Link></li>
              ))}
            </ul>
          </div>
        )}
        {posts.length > 0 && (
          <div>
            <p className="font-semibold mb-2">Articles</p>
            <ul className="space-y-1 opacity-80">
              {posts.map((x) => (
                <li key={x.to}><Link to={x.to} className={linkCls}>{x.label}</Link></li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <p className="font-semibold mb-2">{own ? "Other boroughs" : "Boroughs and neighborhoods"}</p>
          <ul className="space-y-1 opacity-80">
            {others.map(({ hub, neighborhoods }) => (
              <li key={hub.to}>
                <Link to={hub.to} className={linkCls}>{hub.label}</Link>
                {!own && neighborhoods.length > 0 && (
                  <>
                    {": "}
                    {neighborhoods.map((x, i) => (
                      <span key={x.to}>{i > 0 && ", "}<Link to={x.to} className={linkCls}>{x.label}</Link></span>
                    ))}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Plan your project</p>
          <ul className="space-y-1 opacity-80">
            {PLANNING_LINKS.filter((x) => x.to !== current).map((x) => (
              <li key={x.to}><Link to={x.to} className={linkCls}>{x.label}</Link></li>
            ))}
            <li><Link to="/blog" className={linkCls}>All articles</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
