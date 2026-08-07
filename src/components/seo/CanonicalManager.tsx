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

    const syncOgUrl = (href: string) => {
      // Never fight Helmet: if the route manages its own head tags,
      // leave og:url to it.
      const helmetManaged = head.querySelector('[data-rh="true"]') !== null;
      const ogs = Array.from(
        head.querySelectorAll<HTMLMetaElement>('meta[property="og:url"]'),
      );
      const ogOwned = ogs.filter((m) => m.hasAttribute(AUTO_ATTR));
      const ogExternal = ogs.filter((m) => !m.hasAttribute(AUTO_ATTR));

      if (helmetManaged || ogExternal.length > 0) {
        ogOwned.forEach((m) => m.remove());
        ogExternal.slice(1).forEach((m) => m.remove());
        return;
      }

      let og = ogOwned[0];
      ogOwned.slice(1).forEach((m) => m.remove());
      if (!og) {
        og = document.createElement("meta");
        og.setAttribute("property", "og:url");
        og.setAttribute(AUTO_ATTR, "true");
        head.appendChild(og);
      }
      if (og.getAttribute("content") !== href) og.setAttribute("content", href);
    };

    const sync = () => {
      const links = Array.from(
        head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'),
      );
      const owned = links.filter((l) => l.hasAttribute(AUTO_ATTR));
      const external = links.filter((l) => !l.hasAttribute(AUTO_ATTR));
      const href = canonicalHref();

      if (external.length > 0) {
        // A route-level canonical exists — remove ours and any duplicates.
        owned.forEach((l) => l.remove());
        external.slice(1).forEach((l) => l.remove());
        syncOgUrl(href);
        return;
      }

      let link = owned[0];
      owned.slice(1).forEach((l) => l.remove());
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        link.setAttribute(AUTO_ATTR, "true");
        head.appendChild(link);
      }
      if (link.getAttribute("href") !== href) link.setAttribute("href", href);

      syncOgUrl(href);
    };


    // Debounce so Helmet finishes its own head flush before we reconcile.
    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(sync, 120);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(head, { childList: true, attributes: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname, search]);

  return null;
}
