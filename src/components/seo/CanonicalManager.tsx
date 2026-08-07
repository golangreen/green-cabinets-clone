import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_ORIGIN = "https://greencabinetsny.com";
const AUTO_ATTR = "data-canonical-auto";

/**
 * Guarantees every SPA route exposes exactly one <link rel="canonical">.
 * If a route already renders its own canonical (via Helmet), we stand down.
 * Otherwise we inject a self-referencing canonical derived from the URL.
 */
export default function CanonicalManager() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const head = document.head;

    const canonicalHref = () => {
      // Strip trailing slash (except root) and drop tracking-only query strings.
      const path =
        pathname !== "/" && pathname.endsWith("/")
          ? pathname.slice(0, -1)
          : pathname;
      const params = new URLSearchParams(search);
      const keep = new URLSearchParams();
      for (const [k, v] of params.entries()) {
        if (["page", "category", "product", "slug"].includes(k)) keep.append(k, v);
      }
      const qs = keep.toString();
      return `${SITE_ORIGIN}${path}${qs ? `?${qs}` : ""}`;
    };

    const sync = () => {
      const links = Array.from(
        head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'),
      );
      const owned = links.filter((l) => l.hasAttribute(AUTO_ATTR));
      const external = links.filter((l) => !l.hasAttribute(AUTO_ATTR));

      if (external.length > 0) {
        // A route-level canonical exists — remove ours and any duplicates.
        owned.forEach((l) => l.remove());
        external.slice(1).forEach((l) => l.remove());
        return;
      }

      const href = canonicalHref();
      let link = owned[0];
      owned.slice(1).forEach((l) => l.remove());
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        link.setAttribute(AUTO_ATTR, "true");
        head.appendChild(link);
      }
      if (link.getAttribute("href") !== href) link.setAttribute("href", href);

      // Keep og:url aligned with the canonical when no route set one.
      let og = head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
      if (!og) {
        og = document.createElement("meta");
        og.setAttribute("property", "og:url");
        og.setAttribute(AUTO_ATTR, "true");
        head.appendChild(og);
      }
      if (og.hasAttribute(AUTO_ATTR) && og.getAttribute("content") !== href) {
        og.setAttribute("content", href);
      }
    };

    // Run now, after Helmet flushes, and on any later head mutation.
    sync();
    const raf = requestAnimationFrame(sync);
    const observer = new MutationObserver(sync);
    observer.observe(head, { childList: true, attributes: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [pathname, search]);

  return null;
}
