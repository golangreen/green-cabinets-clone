/**
 * /about/golan-achdary — author page for the Person node every article
 * references (AUTHOR_IDS.golan). Facts here are the ones already published
 * on /about; nothing new is claimed.
 */
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import Seo from "@/components/Seo";
import { PEOPLE, AUTHOR_IDS, AUTHOR_PAGE_URL } from "@/data/authors";
import { STATIC_BLOG_POSTS, orderBlogPosts } from "@/data/blogIndex";
import { GOLAN_GUIDES } from "@/data/siteLinks";

const PATH = "/about/golan-achdary";
const TITLE = "Golan Achdary, Founder & Cabinetmaker | Green Cabinets NY";
const DESC =
  "Golan Achdary founded Green Cabinets NY in 2009 and runs design, millwork and finish QC. Guides and articles he has written on NYC custom cabinetry.";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    ...PEOPLE,
    {
      "@type": "ProfilePage",
      "@id": `${AUTHOR_PAGE_URL}#profilepage`,
      url: AUTHOR_PAGE_URL,
      name: TITLE,
      mainEntity: { "@id": AUTHOR_IDS.golan },
      isPartOf: { "@id": "https://greencabinetsny.com/#website" },
    },
  ],
};

export default function AuthorGolan() {
  const posts = orderBlogPosts(STATIC_BLOG_POSTS);
  return (
    <div className="min-h-screen bg-background">
      <Seo title={TITLE} description={DESC} path={PATH} />
      <Helmet>
        <meta property="og:type" content="profile" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
          { name: "Golan Achdary", url: PATH },
        ]}
      />
      <Header />
      <main id="main" tabIndex={-1} className="pt-16 md:pt-20 focus:outline-none">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About", to: "/about" }, { label: "Golan Achdary" }]} />
        <section className="container mx-auto px-4 sm:px-6 max-w-3xl py-12 sm:py-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Author</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">Golan Achdary</h1>
          <p className="font-semibold mb-6">Founder &amp; Master Cabinetmaker, Green Cabinets NY</p>
          <p className="leading-relaxed mb-4">
            Golan founded Green Cabinets NY in 2009 after years on NYC job sites. He runs design,
            millwork, and finish QC personally: every door, drawer, and panel gets eyes on before it
            ships. Specialty: shaker and slim-shaker construction, FSC-certified hardwoods, and
            hand-tuned door reveals.
          </p>
          <p className="text-muted-foreground mb-10">
            Knows: custom kitchens, bathroom vanities, walk-in closets, architectural millwork,
            low-VOC finishes, NYC co-op approval workflows. More about the team on the{" "}
            <Link to="/about" className="underline hover:text-primary">About page</Link>.
          </p>

          <h2 className="text-2xl font-bold mb-4">Guides by Golan</h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-10 list-disc pl-5">
            {GOLAN_GUIDES.map((g) => (
              <li key={g.to}><Link to={g.to} className="hover:text-primary underline-offset-2 hover:underline">{g.label}</Link></li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold mb-4">Articles</h2>
          <ul className="space-y-2 list-disc pl-5">
            {posts.map((p) => (
              <li key={p.slug}><Link to={`/blog/${p.slug}`} className="hover:text-primary underline-offset-2 hover:underline">{p.title}</Link></li>
            ))}
          </ul>
          <p className="mt-6"><Link to="/blog" className="underline hover:text-primary">All articles on the blog →</Link></p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
