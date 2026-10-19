/**
 * Presents each article's "Quick facts" section (an <h2>Quick facts</h2>
 * followed by one or more paragraphs) as a compact boxed bullet list.
 * Pure string transform, so it runs the same in the browser and in the
 * build-time pre-render.
 */

const SECTION_RE = /<h2>Quick facts<\/h2>\s*((?:<p>[\s\S]*?<\/p>\s*)+)/g;

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Split paragraph HTML into sentences without breaking inside tags or URLs. */
export function splitFactSentences(html: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inTag = false;
  for (let i = 0; i < html.length; i++) {
    const ch = html[i];
    cur += ch;
    if (ch === "<") inTag = true;
    else if (ch === ">") inTag = false;
    else if (!inTag && (ch === "." || ch === "!" || ch === "?")) {
      const rest = html.slice(i + 1);
      // sentence end: punctuation followed by whitespace + capital/tag, or the end
      if (rest.length === 0 || /^\s+(?=[A-Z<])/.test(rest)) {
        out.push(cur.trim());
        cur = "";
      }
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter((s) => s.replace(/<[^>]+>/g, "").trim().length > 0);
}

export function factsToItems(paragraphs: string[]): string[] {
  const items: string[] = [];
  for (const p of paragraphs) {
    for (const sentence of splitFactSentences(p)) {
      const also = sentence.match(/^Also worth knowing:\s*([\s\S]*?)\.?$/);
      if (also) {
        also[1]
          .split(/;\s*/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((s) => items.push(capitalize(s) + "."));
      } else {
        items.push(sentence);
      }
    }
  }
  return items;
}

export function boxQuickFacts(html: string): string {
  if (!html || !html.includes("<h2>Quick facts</h2>")) return html;
  return html.replace(SECTION_RE, (_m, body: string) => {
    const paragraphs = [...body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
    const items = factsToItems(paragraphs);
    if (!items.length) return "";
    return (
      '<aside class="quick-facts" aria-labelledby="quick-facts">' +
      '<h2 id="quick-facts">Quick facts</h2><ul>' +
      items.map((i) => `<li>${i}</li>`).join("") +
      "</ul></aside>"
    );
  });
}
