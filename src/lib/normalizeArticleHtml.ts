/**
 * CMS articles sometimes ship raw markdown inside a single <li>/<p>
 * (e.g. the "Key Takeaways" block). Convert it to real HTML.
 */

function mdInline(s: string): string {
  return s
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>")
    .replace(/^\s*\*+\s*/, "")
    .replace(/`([^`]+?)`/g, "<code>$1</code>")
    .trim();
}

/** Split a markdown-ish blob into bullet items. Returns null if not a list. */
function splitBullets(text: string): string[] | null {
  const raw = text.replace(/\r/g, "");
  // bullets are either newline-prefixed or inline "- **" runs
  let parts: string[];
  if (/\n\s*[-*•]\s+/.test(raw)) {
    parts = raw.split(/\n\s*[-*•]\s+/);
  } else if (/-\s\*\*/.test(raw)) {
    parts = raw.split(/(?:^|\s)-\s(?=\*\*)/);
  } else {
    return null;
  }
  const items = parts.map((p) => mdInline(p)).filter(Boolean);
  return items.length > 1 ? items : null;
}

export function normalizeArticleHtml(html: string): string {
  if (typeof window === "undefined" || !html) return html;
  if (!/\*\*|(^|\n)\s*[-*•]\s+/.test(html)) return html;

  const doc = new DOMParser().parseFromString(html, "text/html");

  // 1) single <li> containing many markdown bullets -> many <li>
  doc.querySelectorAll("li").forEach((li) => {
    if (li.children.length > 0) return;
    const items = splitBullets(li.textContent || "");
    if (!items) {
      if (/\*\*/.test(li.textContent || "")) li.innerHTML = mdInline(li.textContent || "");
      return;
    }
    const frag = doc.createDocumentFragment();
    items.forEach((t) => {
      const el = doc.createElement("li");
      el.innerHTML = t;
      frag.appendChild(el);
    });
    li.replaceWith(frag);
  });

  // 2) <p> holding a markdown list -> heading text stays, list extracted
  doc.querySelectorAll("p").forEach((p) => {
    if (p.children.length > 0) return;
    const text = p.textContent || "";
    if (/^key takeaways:?$/i.test(text.trim())) {
      const h = doc.createElement("h2");
      h.setAttribute("style", p.getAttribute("style") || "");
      h.textContent = text.trim().replace(/:$/, "");
      p.replaceWith(h);
      return;
    }
    const items = splitBullets(text);
    if (items) {
      const ul = doc.createElement("ul");
      items.forEach((t) => {
        const el = doc.createElement("li");
        el.innerHTML = t;
        ul.appendChild(el);
      });
      p.replaceWith(ul);
    } else if (/\*\*/.test(text)) {
      p.innerHTML = mdInline(text);
    }
  });

  return doc.body.innerHTML;
}
